import { FC, ReactNode, useEffect, useLayoutEffect, useState } from 'react';
import { useConfig } from './ConfigContext';
import { ArrowDownIcon, ArrowLeftIcon, ArrowRightIcon, ArrowUpIcon } from "@heroicons/react/24/solid";
import { useAutoResize } from './useAutoResize';
import { debounce } from './utils/debounce';

export const IntegrationApp: FC = () => {
  const config = useConfig();
  const [, setIsDisabled] = useState(config.initialIsDisabled);
  const [elementValue, setElementValue] = useState<string | undefined>(config.initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const [watchIndex, setWatchIndex] = useState(0);
  const [placement, setPlacement] = useState(config.config.initialPlacement);

  useAutoResize(elementValue);

  useLayoutEffect(() => {
    if (!placement) {
      return;
    }

    CustomElement.setPlacement(placement);
  }, [placement]);

  useEffect(() => {
    setIsLoading(true);
    CustomElement.ai(
      config.config.instruction,
      res => {
        setIsLoading(false);
        setElementValue(res.value ?? res.error);
      },
      {
        includeElementCodenames: config.config.otherElementCodenamesToInclude,
        includeThisElement: true,
      });
  }, [config.config.instruction, watchIndex, config.config.otherElementCodenamesToInclude]);

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
    CustomElement.observeThisElementChanges(debouncedUpdate);

    if (config.config.otherElementCodenamesToInclude.length) {
      CustomElement.observeElementChanges(config.config.otherElementCodenamesToInclude, debouncedUpdate);
    }
  }, [config]);

  if (!config) {
    return null;
  }

  return (
    <>
      {config.config.allowReposition && (
        <header className="flex gap-2 justify-end h-5">
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
        </header>
      )}
      <main className="mt-5 flex justify-center items-center gap-5">
        {isLoading ? <Loader>"Waiting for AI..."</Loader> : null}
        {!isLoading && elementValue}
      </main>
    </>
  );
};

IntegrationApp.displayName = 'IntegrationApp';

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