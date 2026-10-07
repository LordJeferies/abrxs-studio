import React from 'react';
import ReactDOM from 'react-dom/client';
import '@abrxs/design-system/tokens.css';
import './styles.css';
import './v02.css';
import './v03.css';
import './v04.css';
import './v05.css';
import './v06.css';
import './v07.css';
import './v2stable.css';
import './v2learning.css';
import './v2prompt.css';
import './v2copilot.css';
import { VisionI18nProvider } from './i18n';
import { registerVisionPwa } from './pwa';
import { VisionV2Shell } from './VisionV2Shell';

registerVisionPwa();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <VisionI18nProvider>
      <VisionV2Shell />
    </VisionI18nProvider>
  </React.StrictMode>,
);
