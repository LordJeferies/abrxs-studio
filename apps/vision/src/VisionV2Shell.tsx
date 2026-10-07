import { BookOpen, Bot, Clapperboard, FileUp, Image as ImageIcon, Layers3, Settings2, Sparkles, WandSparkles } from 'lucide-react';
import { useState } from 'react';
import { CinemaPlaygroundFinal } from './CinemaPlaygroundFinal';
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
  const [view, setView] = useState<V2View>('home');

  if (view === 'home') {
    return <div className="vision-v2-home">
      <header className="v2-welcome-top"><div><span className="micro">ABRXS</span><strong>Vision Art Creator <em>V2.6</em></strong></div><div className="v2-language"><button className={language === 'es' ? 'active' : ''} type="button" onClick={() => setLanguage('es')}>ES</button><button className={language === 'en' ? 'active' : ''} type="button" onClick={() => setLanguage('en')}>EN</button></div></header>
      <main className="v2-welcome-main">
        <div className="v2-hero">
          <span className="micro">VISION V2.6 · DIRECTOR INTELLIGENCE</span>
          <h1>{es ? 'Escribe la idea. Vision entiende y dirige.' : 'Write the idea. Vision understands and directs.'}</h1>
          <p>{es ? 'Pega Source Truth. Vision analiza intención, sujeto, acción y prioridades visuales; propone decisiones explicadas; te deja compararlas; y compila un prompt ABRAXAS sin reemplazar la idea original.' : 'Paste Source Truth. Vision analyses intent, subject, action and visual priorities; proposes explainable decisions; lets you compare them; and compiles an ABRAXAS prompt without replacing the original idea.'}</p>
        </div>
        <div className="v2-primary-actions">
          <button className="v2-choice primary" type="button" onClick={() => setView('prompt')}><div className="v2-choice-icon"><WandSparkles size={28}/></div><div><span className="micro">VISION DIRECTOR</span><strong>{es ? 'Entender → comparar → dirigir' : 'Understand → compare → direct'}</strong><p>{es ? 'Source Intelligence, recomendaciones explicadas, Reference Engine, Prompt Anatomy con leyenda y compilación de producción.' : 'Source Intelligence, explainable recommendations, Reference Engine, Prompt Anatomy legend and production compilation.'}</p></div><i>→</i></button>
          <button className="v2-choice" type="button" onClick={() => setView('assistant')}><div className="v2-choice-icon"><Bot size={28}/></div><div><span className="micro">VISION COPILOT</span><strong>{es ? 'Pensar y dirigir con IA' : 'Think and direct with AI'}</strong><p>{es ? 'NVIDIA NIM o Gemini para revisar, explicar y proponer patches que tú apruebas.' : 'NVIDIA NIM or Gemini to review, explain and propose patches that you approve.'}</p></div><i>→</i></button>
        </div>
        <div className="v2-secondary-actions">
          <button type="button" onClick={() => setView('studio')}><ImageIcon size={19}/><div><strong>{es ? 'Producción / Studio' : 'Production / Studio'}</strong><span>{es ? 'Imagen · video · storyboard · providers' : 'Image · video · storyboard · providers'}</span></div></button>
          <button type="button" onClick={() => setView('ficha')}><FileUp size={19}/><div><strong>{es ? 'Importar ficha' : 'Import ficha'}</strong><span>HTML · JSON · TXT</span></div></button>
          <button type="button" onClick={() => setView('xroll')}><Layers3 size={19}/><div><strong>XRoll Studio</strong><span>Layers · prompts · motion</span></div></button>
          <button type="button" onClick={() => setView('learn')}><BookOpen size={19}/><div><strong>Cinema Playground</strong><span>{es ? 'Laboratorio avanzado de comparación' : 'Advanced comparison lab'}</span></div></button>
        </div>
        <section className="v2-principle"><Sparkles size={18}/><div><strong>{es ? 'Una sola intención. Muchas salidas.' : 'One intent. Many outputs.'}</strong><p>{es ? 'Source Truth permanece separada de la dirección. Vision propone. Tú aplicas. Target compilers traducen. Generación sólo ocurre mediante providers reales y confirmados.' : 'Source Truth stays separate from direction. Vision proposes. You apply. Target compilers translate. Generation only happens through real confirmed providers.'}</p></div></section>
      </main>
    </div>;
  }

  return <div className="vision-v2-shell">
    <header className="v2-switcher">
      <button className="v2-logo" type="button" onClick={() => setView('home')}><span>V</span><div><strong>Vision V2.6</strong><small>Director Intelligence</small></div></button>
      <nav>
        <button className={view === 'prompt' ? 'active' : ''} type="button" onClick={() => setView('prompt')}><WandSparkles size={15}/>Director</button>
        <button className={view === 'assistant' ? 'active' : ''} type="button" onClick={() => setView('assistant')}><Bot size={15}/>Copilot</button>
        <button className={view === 'ficha' ? 'active' : ''} type="button" onClick={() => setView('ficha')}><FileUp size={15}/>Fichas</button>
        <button className={view === 'xroll' ? 'active' : ''} type="button" onClick={() => setView('xroll')}><Layers3 size={15}/>XRoll</button>
        <button className={view === 'learn' ? 'active' : ''} type="button" onClick={() => setView('learn')}><BookOpen size={15}/>{es ? 'Aprender' : 'Learn'}</button>
        <button className={view === 'studio' ? 'active' : ''} type="button" onClick={() => setView('studio')}><Clapperboard size={15}/>Studio</button>
      </nav>
      <div className="v2-switcher-actions"><button type="button" onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}>{language.toUpperCase()}</button><button className={view === 'settings' ? 'active' : ''} type="button" onClick={() => setView('settings')} title={es ? 'Conexiones y API keys' : 'Connections and API keys'}><Settings2 size={16}/></button></div>
    </header>

    <main className="v2-workspace">
      {view === 'prompt' && <div className="v25-prompt-route">
        <DirectorStudioV26 language={language} onOpenCopilot={() => setView('assistant')} onOpenStudio={() => setView('studio')}/>
        <details className="v25-advanced-compiler">
          <summary><Sparkles size={15}/><span><strong>{es ? 'Herramientas V2 / V2.5 conservadas' : 'Preserved V2 / V2.5 tools'}</strong><small>{es ? 'Director V2.5 original, compilador avanzado y Prompt Anatomy clásico siguen disponibles para compatibilidad y comparación.' : 'Original V2.5 Director, advanced compiler and classic Prompt Anatomy remain available for compatibility and comparison.'}</small></span></summary>
          <DirectorStudioFinal language={language} onOpenCopilot={() => setView('assistant')} onOpenStudio={() => setView('studio')}/>
          <div className="v2-prompt-workspace"><div className="v2-prompt-tools"><ProfessionalPromptLab/></div><PromptAnatomy language={language} onCopy={copy}/></div>
        </details>
      </div>}
      {view === 'assistant' && <VisionCopilot language={language} onOpenSettings={() => setView('settings')} onOpenPromptStudio={() => setView('prompt')} onOpenXRoll={() => setView('xroll')}/>} 
      {view === 'settings' && <div className="vision-v2-settings-stack"><VisionAISettings language={language}/><CustomProviderSettings language={language}/><VisionFirebaseSettings language={language}/></div>} 
      {view === 'ficha' && <FichaIntakePanel language={language} onCopy={copy}/>} 
      {view === 'xroll' && <XRollStudio language={language} onCopy={copy}/>} 
      {view === 'learn' && <CinemaPlaygroundFinal language={language}/>} 
      {view === 'studio' && <VisionApp/>}
    </main>
  </div>;
}
