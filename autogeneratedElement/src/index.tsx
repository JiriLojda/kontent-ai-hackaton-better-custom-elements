import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from './ConfigContext';
import { EnsureKontentAsParent } from "./EnsureKontentAsParent";
import { IntegrationApp } from './IntegrationApp';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Cannot find the root element. Please, check your html.');
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <EnsureKontentAsParent>
      <ConfigProvider>
        <IntegrationApp />
      </ConfigProvider>
    </EnsureKontentAsParent>
  </React.StrictMode>
);
