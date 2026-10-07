import { BookOpen, Bot, Clapperboard, FileUp, Image as ImageIcon, Layers3, Settings2, Sparkles, WandSparkles } from 'lucide-react';
import { useState } from 'react';
import { CinemaPlayground } from './CinemaPlayground';
import { CustomProviderSettings } from './CustomProviderSettings';
import { DirectorStudioFinal } from './DirectorStudioFinal';
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
      <header className="v2-welcome-top"><div><span className="micro">ABRXS</span><strong>Vision Art Creator <em>V2.5</em></strong></div><div className="v2-language"><button className={language === 'es' ? 'active' : ''} type="button" onClick={() => setLanguage('es')}>ES</button><button className={language === 'en' ? 'active' : ''} type="button" onClick={() => setLanguage('en')}>EN</button></div></header>
      <main className="v2-welcome-main">
        <div className="v2-hero">
          <span className="micro">VISION V2.5 · DIRECTOR STUDIO</span>
          <h1>{es ? 'Escribe la idea. Vision dirige.' : 'Write the idea. Vision directs.'}</h1>
          <p>{es ? 'Un mejorador y director visual: pega el texto base de una imagen, video o XR; selecciona decisiones cinematográficas viendo referencias; y deja que Vision construya un prompt ABRAXAS profesional sin perder la intención original.' : 'A visual prompt improver and director: paste the base text for an image, video or XR; choose cinematic decisions through visual references; and let Vision build a professional ABRAXAS prompt without losing the original intent.'}</p>
        </div>
        <div className="v2-primary-actions">
          <button className="v2-choice primary" type="button" onClick={() => setView('prompt')}><div className="v2-choice-icon"><WandSparkles size={28}/></div><div><span className="micro">VISION DIRECTOR</span><strong>{es ? 'Texto base → prompt dirigido' : 'Base text → directed prompt'}</strong><p>{es ? 'Cámara, lente, exposición, foco, composición, iluminación, movimiento, look, materiales, atmósfera y FX con referencias, presets y explicaciones.' : 'Camera, lens, exposure, focus, composition, lighting, movement, look, materials, atmosphere and FX with references, presets and explanations.'}</p></div><i>→</i></button>
          <button className="v2-choice" type="button" onClick={() => setView('assistant')}><div className="v2-choice-icon"><Bot size={28}/></div><div><span className="micro">VISION COPILOT</span><strong>{es ? 'Pensar y dirigir con IA' : 'Think and direct with AI'}</strong><p>{es ? 'NVIDIA NIM o Gemini para revisar, explicar y proponer patches que tú apruebas.' : 'NVIDIA NIM or Gemini to review, explain and propose patches that you approve.'}</p></div><i>→</i></button>
        </div>
        <div className="v2-secondary-actions">
          <button type="button" onClick={() => setView('studio')}><ImageIcon size={19}/><div><strong>{es ? 'Producción / Studio' : 'Production / Studio'}</strong><span>{es ? 'Imagen · video · storyboard · providers' : 'Image · video · storyboard · providers'}</span></div></button>
          <button type="button" onClick={() => setView('ficha')}><FileUp size={19}/><div><strong>{es ? 'Importar ficha' : 'Import ficha'}</strong><span>HTML · JSON · TXT</span></div></button>
          <button type="button" onClick={() => setView('xroll')}><Layers3 size={19}/><div><strong>XRoll Studio</strong><span>Layers · prompts · motion</span></div></button>
          <button type="button" onClick={() => setView('learn')}><BookOpen size={19}/><div><strong>Cinema Playground</strong><span>{es ? 'Aprender comparando' : 'Learn by comparing'}</span></div></button>
        </div>
        <section className="v2-principle"><Sparkles size={18}/><div><strong>{es ? 'Una sola intención. Muchas salidas.' : 'One intent. Many outputs.'}</strong><p>{es ? 'GenerationSpec mantiene la fuente de verdad. Director mejora. Copilot propone. Target compilers traducen. Creator ejecuta sólo cuando existe un provider real y tú lo confirmas.' : 'GenerationSpec remains the source of truth. Director improves. Copilot proposes. Target compilers translate. Creator executes only when a real provider exists and you confirm it.'}</p></div></section>
      </main>
    </div>;
  }

  return <div className="vision-v2-shell">
    <header className="v2-switcher">
      <button className="v2-logo" type="button" onClick={() => setView('home')}><span>V</span><div><strong>Vision V2.5</strong><small>Director Studio</small></div></button>
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
        <DirectorStudioFinal language={language} onOpenCopilot={() => setView('assistant')} onOpenStudio={() => setView('studio')}/>
        <details className="v25-advanced-compiler">
          <summary><Sparkles size={15}/><span><strong>{es ? 'Compilador avanzado ABRAXAS' : 'Advanced ABRAXAS compiler'}</strong><small>{es ? 'Herramientas V2 conservadas: brief estructurado, target compiler y Prompt Anatomy por bloques.' : 'Preserved V2 tools: structured brief, target compiler and block Prompt Anatomy.'}</small></span></summary>
          <div className="v2-prompt-workspace"><div className="v2-prompt-tools"><ProfessionalPromptLab/></div><PromptAnatomy language={language} onCopy={copy}/></div>
        </details>
      </div>}
      {view === 'assistant' && <VisionCopilot language={language} onOpenSettings={() => setView('settings')} onOpenPromptStudio={() => setView('prompt')} onOpenXRoll={() => setView('xroll')}/>} 
      {view === 'settings' && <div className="vision-v2-settings-stack"><VisionAISettings language={language}/><CustomProviderSettings language={language}/><VisionFirebaseSettings language={language}/></div>} 
      {view === 'ficha' && <FichaIntakePanel language={language} onCopy={copy}/>} 
      {view === 'xroll' && <XRollStudio language={language} onCopy={copy}/>} 
      {view === 'learn' && <CinemaPlayground language={language}/>} 
      {view === 'studio' && <VisionApp/>}
    </main>
  </div>;
}
