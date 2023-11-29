import { FC, useEffect, useState } from 'react';
import { Button } from './Button';
import { useConfig } from './ConfigContext';
import { useAutoResize } from './useAutoResize';
import { debounce } from './utils/debounce';

export const IntegrationApp: FC = () => {
  const config = useConfig();
  const [, setIsDisabled] = useState(config.initialIsDisabled);
  const [elementValue, setElementValue] = useState<string | undefined>(config.initialValue);
  const [watchedUpdateIndex, setWatchedUpdateIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useAutoResize(elementValue);

  useEffect(() => {
    if (watchedUpdateIndex === 0) {
      return;
    }

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
        includeElementCodenames: config.config.elementCodenamesToInclude,
      });
  }, [config.config.elementCodenamesToInclude, config.config.instruction, watchedUpdateIndex]);

  useEffect(() => {
    CustomElement.onDisabledChanged(setIsDisabled);
  }, []);

  useEffect(() => {
    if (!config) {
      return;
    }
    const debouncedUpdate = debounce(() => setWatchedUpdateIndex(prev => prev + 1), 1000);
    CustomElement.observeElementChanges(config.config.elementCodenamesToInclude ?? [], debouncedUpdate);
  }, [config]);

  if (!config) {
    return null;
  }

  return (
    <>
      <main className="mt-5 flex justify-center items-center gap-5">
        {isLoading ? <Loader>"Waiting for AI..."</Loader> : null}
        {!elementValue && !isLoading && (
          <Button onClick={() => setWatchedUpdateIndex(prev => prev + 1)}>
            Generate value
          </Button>
        )}
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
