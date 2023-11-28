import { FC, useEffect, useState } from 'react';
import { useConfig } from './ConfigContext';

export const IntegrationApp: FC = () => {
  const config = useConfig();
  const [, setIsDisabled] = useState(config.initialIsDisabled);
  const [elementValue, setElementValue] = useState<string | undefined>(config.initialValue);
  const [watchedUpdateIndex, setWatchedUpdateIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

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
      },
      {
        includeElementCodenames: config.config.elementCodenamesToInclude,
      });
  }, [config.config.elementCodenamesToInclude, config.config.instruction, watchedUpdateIndex]);

  useEffect(() => {
    CustomElement.setHeight(500);
  }, []);

  useEffect(() => {
    CustomElement.onDisabledChanged(setIsDisabled);
  }, []);

  useEffect(() => {
    if (!config) {
      return;
    }
    CustomElement.observeElementChanges(config.config.elementCodenamesToInclude, () => setWatchedUpdateIndex(prev => prev + 1));
  }, [config]);

  // const updateValue = (newValue: string) => {
  //   CustomElement.setValue(newValue);
  //   setElementValue(newValue);
  // };

  if (!config) {
    return null;
  }

  return (
    <>
      <main>
        {isLoading ? <Loader>"Waiting for AI..."</Loader> : null}
        {elementValue}
      </main>
    </>
  );
};

IntegrationApp.displayName = 'IntegrationApp';

const Loader = (props: Readonly<{ children: string }>) => (
  <div className="flex items-center justify-center w-56 h-56 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
    <div className="px-3 py-1 text-xs font-medium leading-none text-center text-blue-800 bg-blue-200 rounded-full animate-pulse dark:bg-blue-900 dark:text-blue-200">
      {props.children}
    </div>
  </div>
);

//   new Promise(resolve => {
//     CustomElement.getElementValue(codename, value => typeof value === "string" ? resolve({ codename, value }) : resolve({ codename, value: null }));
//   });
