import { FC, useEffect, useLayoutEffect, useState } from 'react';
import { useConfig } from './ConfigContext';
import { useAutoResize } from './useAutoResize';
import { debounce } from './utils/debounce';

export const IntegrationApp: FC = () => {
  const config = useConfig();
  const [, setIsDisabled] = useState(config.initialIsDisabled);
  const [elementValue, setElementValue] = useState<string | undefined>(config.initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const [watchIndex, setWatchIndex] = useState(0);

  useAutoResize(elementValue);

  useLayoutEffect(() => {
    CustomElement.setPlacement(config.config.initialPlacement ?? "bottom-side");
  }, [config.config.initialPlacement]);

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
        includeElementCodenames: config.config.compareWith,
        includeThisElement: true,
      });
  }, [config.config.instruction, watchIndex, config.config.compareWith]);

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
    }, 2000);
    CustomElement.observeThisElementChanges(debouncedUpdate);
    CustomElement.observeElementChanges(config.config.compareWith, debouncedUpdate);
  }, [config]);

  if (!config) {
    return null;
  }

  return (
    <>
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
