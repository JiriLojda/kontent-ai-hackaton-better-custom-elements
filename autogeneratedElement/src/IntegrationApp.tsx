import { FC, useEffect, useState } from 'react';
import { useConfig } from './ConfigContext';

export const IntegrationApp: FC = () => {
  const config = useConfig();
  const [, setIsDisabled] = useState(config.initialIsDisabled);
  const [elementValue, setElementValue] = useState<string | undefined>(config.initialValue);
  const [watchedUpdateIndex, setWatchedUpdateIndex] = useState(0);

  // const updateWatchedElementsValue = useCallback((codenames: ReadonlyArray<string>) => {
  //   Promise.all(codenames.map(getElementValuePromise))
  //     .then(newValues => setWatchedElementsValues(prev => ({ ...prev, ...Object.fromEntries(newValues.map(o => o.value === null ? null : [o.codename, o.value]).filter(notNull)) })));
  // }, []);

  useEffect(() => {
    CustomElement.ai(
      config.config.instruction,
      res => {
        console.log("callback called in the custom element with: ", res);
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
      <h1>
        This is the result:
      </h1>
      <div>
        {elementValue}
      </div>
    </>
  );
};

IntegrationApp.displayName = 'IntegrationApp';


//   new Promise(resolve => {
//     CustomElement.getElementValue(codename, value => typeof value === "string" ? resolve({ codename, value }) : resolve({ codename, value: null }));
//   });
