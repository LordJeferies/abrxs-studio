import React from 'react';
import ReactDOM from 'react-dom/client';
import '@abrxs/design-system/tokens.css';
import './styles.css';
import './v02.css';
import './v03.css';
import './v04.css';
import './v05.css';
import './v06.css';
import { VisionI18nProvider } from './i18n';
import { ProfessionalPromptLab } from './ProfessionalPromptLab';
import { registerVisionPwa } from './pwa';
import { VisionApp } from './VisionApp';

registerVisionPwa();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <VisionI18nProvider>
      <VisionApp />
      <ProfessionalPromptLab />
    </VisionI18nProvider>
  </React.StrictMode>,
);
