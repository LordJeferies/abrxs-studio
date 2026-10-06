import React from 'react';
import ReactDOM from 'react-dom/client';
import '@abrxs/design-system/tokens.css';
import './styles.css';
import './v02.css';
import { App } from './App';
import { registerVisionPwa } from './pwa';

registerVisionPwa();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
