import { FC, ReactNode, useEffect, useLayoutEffect, useState } from 'react';
import { useConfig } from './ConfigContext';
import { ArrowDownIcon, ArrowLeftIcon, ArrowRightIcon, ArrowUpIcon } from "@heroicons/react/24/solid";
import { useAutoResize } from './useAutoResize';
import { debounce } from './utils/debounce';

export const IntegrationApp: FC = () => {
  const config = useConfig();
  const [, setIsDisabled] = useState(config.initialIsDisabled);

  const [value, setValue] = useState<string | undefined>(config.initialValue);
  const [error, setError] = useState<string | undefined>(undefined);

  const [isLoading, setIsLoading] = useState(false);
  const [watchIndex, setWatchIndex] = useState(0);
  const [placement, setPlacement] = useState(config.config.initialPlacement);

  useAutoResize(value);

  useLayoutEffect(() => {
    if (!placement) {
      return;
    }

    CustomElement.setPlacement(placement);

    if (config.config.width) {
        CustomElement.setWidth(config.config.width);
    }
  }, [placement, config.config.width]);

  const isGeneratingValue = (config.config.job === 'generate-value');

  useEffect(() => {
    setIsLoading(true);
    CustomElement.ai(
      config.config.instruction,
      res => {
        setIsLoading(false);

        setValue(res.value);
        setError(res.error);

        if (!res.error && res.value && isGeneratingValue) {
          CustomElement.setValue(res.value);
        }
      },
      {
        includeElementCodenames: config.config.otherElementCodenamesToInclude ?? [],
        includeThisElement: !isGeneratingValue,
        job: config.config.job ?? 'analyze',
      });
  }, [config.config.instruction, config.config.job, isGeneratingValue, watchIndex, config.config.otherElementCodenamesToInclude]);

  useEffect(() => {
    CustomElement.onDisabledChanged(setIsDisabled);
  }, []);

  useEffect(() => {
    if (!config) {
      return;
    }
    const debouncedUpdate = debounce(() => {
      console.log("calling update");
      return setWatchIndex(prev => prev + 1);
    }, 1000);

    if (!isGeneratingValue) {
      CustomElement.observeThisElementChanges(debouncedUpdate);
    }

    if (config.config.otherElementCodenamesToInclude?.length) {
      CustomElement.observeElementChanges(config.config.otherElementCodenamesToInclude, debouncedUpdate);
    }
  }, [config, isGeneratingValue]);

  if (!config) {
    return null;
  }

  const placements = (
      <>
        <HeaderIcon onClick={() => setPlacement("left")}>
          <ArrowLeftIcon />
        </HeaderIcon>
        <HeaderIcon onClick={() => setPlacement("right")}>
          <ArrowRightIcon />
        </HeaderIcon>
        <HeaderIcon onClick={() => setPlacement("top")}>
          <ArrowUpIcon />
        </HeaderIcon>
        <HeaderIcon onClick={() => setPlacement("bottom")}>
          <ArrowDownIcon />
        </HeaderIcon>
      </>
  );

  return (
    <>
      {(config.config.allowReposition || config.config.title) && (
        config.config.title ? (
            <header className="flex justify-between h-5">
              {config.config.title && (
                  <strong>{config.config.title}</strong>
              )}
              {config.config.allowReposition && (
                <div className="flex gap-1 justify-start">
                  {placements}
                </div>
              )}
            </header>
        ) : config.config.allowReposition && (
            <header className="flex gap-1 justify-end h-5">
                {placements}
            </header>
        )
      )}
      <main className="mt-5 flex justify-center items-center gap-5">
        {isLoading ? <Loader>Updating value...</Loader> : null}
          {!isLoading && (error ?? (isGeneratingValue ? <Status>Value updated</Status> : value))}
      </main>
    </>
  );
};

IntegrationApp.displayName = 'IntegrationApp';

const Status = (props: Readonly<{ children: string }>) => (
    <div className="px-5 py-2 text-xs font-medium leading-none text-center text-black bg-kontent-green rounded-full w-fit">
        {props.children}
    </div>
);

const Loader = (props: Readonly<{ children: string }>) => (
  <div className="px-5 py-2 text-xs font-medium leading-none text-center text-black bg-kontent-green rounded-full animate-pulse w-fit">
    {props.children}
  </div>
);

const HeaderIcon = (props: Readonly<{ children: ReactNode; onClick: () => void }>) => (
  <div
    className="h-full p-0.5 border rounded border-kontent-orange text-kontent-orange w-5 cursor-pointer hover:bg-kontent-orange-light"
    onClick={props.onClick}
  >
    {props.children}
  </div>
);
