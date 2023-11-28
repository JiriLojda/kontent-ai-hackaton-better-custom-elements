import { FC, useCallback, useEffect, useState } from 'react';
import { useConfig } from './ConfigContext';
import { notNull } from './utils/typeguards';

export const IntegrationApp: FC = () => {
  const config = useConfig();
  const [, setIsDisabled] = useState(config.initialIsDisabled);
  const [elementValue, setElementValue] = useState<string | undefined>(config.initialValue);
  const [, setWatchedElementsValues] = useState(Object.fromEntries(config.config.elementCodenamesToInclude.map(c => [c, ""])));

  const updateWatchedElementsValue = useCallback((codenames: ReadonlyArray<string>) => {
    Promise.all(codenames.map(getElementValuePromise))
      .then(newValues => setWatchedElementsValues(prev => ({ ...prev, ...Object.fromEntries(newValues.map(o => o.value === null ? null : [o.codename, o.value]).filter(notNull)) })));
  }, []);

  useEffect(() => {
    CustomElement.ai(
      config.config.instruction,
      res => setElementValue(res.value ?? res.error),
      {
        includeElementCodenames: config.config.elementCodenamesToInclude,
      });
  }, [config.config.elementCodenamesToInclude, config.config.instruction]);

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
    CustomElement.observeElementChanges(config.config.elementCodenamesToInclude, updateWatchedElementsValue);
  }, [config, updateWatchedElementsValue]);

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

const getElementValuePromise = (codename: string): Promise<Readonly<{ codename: string; value: string | null }>> =>
  new Promise(resolve => {
    CustomElement.getElementValue(codename, value => typeof value === "string" ? resolve({ codename, value }) : resolve({ codename, value: null }));
  });
