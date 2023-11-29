import React, { FC, ReactElement, useContext, useEffect, useState } from "react";
import { findMissingStringProps } from "./utils/findMissingStringProp";

type Props = Readonly<{
  children: ReactElement | ReactElement[] | null;
}>;

export const ConfigProvider: FC<Props> = props => {
  const [config, setConfig] = useState<Config | null>(null);

  useEffect(() => {
    CustomElement.init((element) => {
      if (!isValidConfig(element.config)) {
        throw new Error(`Invalid element config, the following properties are missing or invalid ${findMissingStringProps(Object.keys(emptyConfig.config))(element.config).join(", ")}`);
      }

      setConfig({
        config: { initialPlacement: "bottom-side", ...element.config },
        initialValue: element.value,
        initialIsDisabled: element.disabled,
      });
    });
  }, []);

  if (!config) {
    return null;
  }

  return (
    <Context.Provider value={config}>
      {props.children}
    </Context.Provider>
  );
};

ConfigProvider.displayName = "ConfigProvider";

export type Config = Readonly<{
  config: Readonly<{
    instruction: string;
    initialPlacement?: CustomElementExtensionPlacement;
    compareWith: ReadonlyArray<string>;
  }>;
  initialValue: string;
  initialIsDisabled: boolean;
}>;

const emptyConfig: Config = {
  config: {
    instruction: "",
    initialPlacement: "right",
    compareWith: [],
  },
  initialValue: "",
  initialIsDisabled: false,
};

const Context = React.createContext<Config>(emptyConfig);

export const useConfig = () => useContext(Context);

// const isValidConfig = (c: Readonly<Record<string, unknown>> | null): c is Config["config"] =>
//   !findMissingStringProps(Object.keys(emptyConfig.config))(c).length;

const isValidConfig = (c: Readonly<Record<string, unknown>> | null): c is Config["config"] => true
