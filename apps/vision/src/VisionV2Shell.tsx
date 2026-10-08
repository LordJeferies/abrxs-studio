import {
  BookOpen,
  Bot,
  Clapperboard,
  FileUp,
  Home,
  Layers3,
  Settings2,
  Sparkles,
  WandSparkles,
} from 'lucide-react';
import { useState } from 'react';
import { CinemaLearnV26 } from './CinemaLearnV26';
import { CustomProviderSettings } from './CustomProviderSettings';
import { DirectorStudioFinal } from './DirectorStudioFinal';
import { DirectorStudioV26 } from './DirectorStudioV26';
import { FichaIntakePanel } from './FichaIntakePanel';
import { useVisionI18n } from './i18n';
import { ProfessionalPromptLab } from './ProfessionalPromptLab';
import { PromptAnatomy } from './PromptAnatomy';
import { VisionAISettings } from './VisionAISettings';
import { VisionApp } from './VisionApp';
import { VisionCopilot } from './VisionCopilot';
import { VisionFirebaseSettings } from './VisionFirebaseSettings';
import { XRollStudio } from './XRollStudio';

type V2View = 'home' | 'prompt' | 'ficha' | 'xroll' | 'learn' | 'assistant' | 'settings' | 'studio';

function copy(value: string) {
  void navigator.clipboard.writeText(value).catch(() => undefined);
}

export function VisionV2Shell() {
  const { language, setLanguage } = useVisionI18n();
  const es = language === 'es';
  const [view, setView] = useState<V2View>('prompt');

  const title = view === 'prompt' ? 'Director' : view === 'assistant' ? 'Copilot' : view === 'ficha' ? 'Fichas' : view === 'xroll' ? 'XRoll' : view === 'learn' ? 'References' : view === 'studio' ? 'Studio' : view === 'settings' ? 'Settings' : 'Vision';

  return <div className="vision-v26-app">
    <aside className="v26-global-rail" aria-label="Vision navigation">
      <button className="v26-global-logo" type="button" onClick={() => setView('home')} aria-label="Abrxs Vision home"><span>V</span></button>

      <nav>
        <button className={view === 'home' ? 'active' : ''} type="button" onClick={() => setView('home')} title={es ? 'Inicio' : 'Home'}><Home size={20}/><span>{es ? 'Inicio' : 'Home'}</span></button>
        <button className={view === 'prompt' ? 'active' : ''} type="button" onClick={() => setView('prompt')} title="Director"><WandSparkles size={20}/><span>Director</span></button>
        <button className={view === 'assistant' ? 'active' : ''} type="button" onClick={() => setView('assistant')} title="Copilot"><Bot size={20}/><span>Copilot</span></button>
        <button className={view === 'ficha' ? 'active' : ''} type="button" onClick={() => setView('ficha')} title="Fichas"><FileUp size={20}/><span>Fichas</span></button>
        <button className={view === 'xroll' ? 'active' : ''} type="button" onClick={() => setView('xroll')} title="XRoll"><Layers3 size={20}/><span>XRoll</span></button>
        <button className={view === 'learn' ? 'active' : ''} type="button" onClick={() => setView('learn')} title={es ? 'Referencias' : 'References'}><BookOpen size={20}/><span>Refs</span></button>
        <button className={view === 'studio' ? 'active' : ''} type="button" onClick={() => setView('studio')} title="Studio"><Clapperboard size={20}/><span>Studio</span></button>
      </nav>

      <div className="v26-global-bottom">
        <button className="v26-language-button" type="button" onClick={() => setLanguage(language === 'es' ? 'en' : 'es')} title={es ? 'Cambiar idioma' : 'Change language'}>{language.toUpperCase()}</button>
        <button className={view === 'settings' ? 'active' : ''} type="button" onClick={() => setView('settings')} title={es ? 'Conexiones y ajustes' : 'Connections and settings'}><Settings2 size={20}/><span>{es ? 'Ajustes' : 'Settings'}</span></button>
      </div>
    </aside>

    <section className="v26-global-main">
      <header className="v26-global-topbar">
        <div><span>ABRAXS VISION</span><strong>{title}</strong></div>
        <div><small>V2.6</small><span className="v26-status-dot"/> <em>{es ? 'Source Truth protegido' : 'Source Truth protected'}</em></div>
      </header>

      <main className="v26-route-content">
        {view === 'home' && <section className="v26-home">
          <div className="v26-home-hero"><span className="micro">ABRAXS VISION V2.6</span><h1>{es ? 'Un espacio visual. Una decisión a la vez.' : 'One visual workspace. One decision at a time.'}</h1><p>{es ? 'Director es el punto de entrada. Pega una idea, compara la cámara técnicamente, revisa referencias reales y compila el prompt sin perder Source Truth.' : 'Director is the entry point. Paste an idea, compare camera choices technically, inspect real references and compile the prompt without losing Source Truth.'}</p><button className="v26-primary" onClick={() => setView('prompt')}><WandSparkles size={16}/>{es ? 'Abrir Director' : 'Open Director'}</button></div>
          <div className="v26-home-tools"><button onClick={() => setView('assistant')}><Bot size={20}/><span><strong>Copilot</strong><small>{es ? 'Analizar y proponer cambios' : 'Analyse and propose changes'}</small></span></button><button onClick={() => setView('learn')}><BookOpen size={20}/><span><strong>{es ? 'Referencias' : 'References'}</strong><small>{es ? 'Mismo motor de cámara que Director' : 'Same camera engine as Director'}</small></span></button><button onClick={() => setView('studio')}><Sparkles size={20}/><span><strong>Studio</strong><small>{es ? 'Preparar producción' : 'Prepare production'}</small></span></button></div>
        </section>}

        {view === 'prompt' && <div className="v26-director-route">
          <DirectorStudioV26 language={language} onOpenCopilot={() => setView('assistant')} onOpenStudio={() => setView('studio')}/>
          <details className="v26-legacy-tools">
            <summary><Sparkles size={14}/><span><strong>{es ? 'Herramientas avanzadas / compatibilidad V2.5' : 'Advanced / V2.5 compatibility tools'}</strong><small>{es ? 'Abre sólo si necesitas el Director clásico o el compilador por bloques.' : 'Open only if you need the classic Director or block compiler.'}</small></span></summary>
            <DirectorStudioFinal language={language} onOpenCopilot={() => setView('assistant')} onOpenStudio={() => setView('studio')}/>
            <div className="v2-prompt-workspace"><div className="v2-prompt-tools"><ProfessionalPromptLab/></div><PromptAnatomy language={language} onCopy={copy}/></div>
          </details>
        </div>}

        {view === 'assistant' && <VisionCopilot language={language} onOpenSettings={() => setView('settings')} onOpenPromptStudio={() => setView('prompt')} onOpenXRoll={() => setView('xroll')}/>} 
        {view === 'settings' && <div className="vision-v2-settings-stack"><VisionAISettings language={language}/><CustomProviderSettings language={language}/><VisionFirebaseSettings language={language}/></div>} 
        {view === 'ficha' && <FichaIntakePanel language={language} onCopy={copy}/>} 
        {view === 'xroll' && <XRollStudio language={language} onCopy={copy}/>} 
        {view === 'learn' && <CinemaLearnV26 language={language}/>} 
        {view === 'studio' && <VisionApp/>}
      </main>
    </section>
  </div>;
}
