import { FC, ReactNode, useEffect, useLayoutEffect, useState } from 'react';
import { useConfig } from './ConfigContext';
import { useAutoResize } from './useAutoResize';
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/solid";

export const IntegrationApp: FC = () => {
  const config = useConfig();
  const [, setIsDisabled] = useState(config.initialIsDisabled);
  const [elementValue, setElementValue] = useState<string | undefined>(config.initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const [placement, setPlacement] = useState(config.config.initialPlacement);
  const [watchedElementValue, setWatchedElementValue] = useState<string | null>(null);
  console.log("placement: ", placement);

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
        if (res.value && !res.error) {
          CustomElement.setValue(res.value);
        }
      },
      {
        includeElementCodenames: [],
        includeThisElement: true,
      });
  }, [config.config.instruction, watchedElementValue]);

  useEffect(() => {
    CustomElement.onDisabledChanged(setIsDisabled);
  }, []);

  useEffect(() => {
    if (!config) {
      return;
    }
    CustomElement.observeThisElementChanges(() => CustomElement.getThisElementValue(setWatchedElementValue));
  }, [config]);

  if (!config) {
    return null;
  }

  return (
    <>
      <header className="flex justify-end h-5 w-5">
        <HeaderIcon onClick={() => setPlacement("left")}>
          <ArrowLeftIcon />
        </HeaderIcon>
        <HeaderIcon onClick={() => setPlacement("right")}>
          <ArrowRightIcon />
        </HeaderIcon>
      </header>
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
  <div className="h-full border-2 rounded border-kontent-orange text-kontent-orange">
    {props.children}
  </div>
);
