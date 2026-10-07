import { BookOpen, Bot, Clapperboard, FileUp, Image as ImageIcon, Layers3, Settings2, Sparkles, WandSparkles } from 'lucide-react';
import { useState } from 'react';
import { CinemaPlayground } from './CinemaPlayground';
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
      <header className="v2-welcome-top"><div><span className="micro">ABRXS</span><strong>Vision Art Creator <em>V2</em></strong></div><div className="v2-language"><button className={language === 'es' ? 'active' : ''} type="button" onClick={() => setLanguage('es')}>ES</button><button className={language === 'en' ? 'active' : ''} type="button" onClick={() => setLanguage('en')}>EN</button></div></header>
      <main className="v2-welcome-main">
        <div className="v2-hero">
          <span className="micro">VISION V2 · DIRECTOR STUDIO</span>
          <h1>{es ? '¿Qué quieres crear hoy?' : 'What do you want to create today?'}</h1>
          <p>{es ? 'Crea o mejora prompts, conversa con Vision Copilot, actualiza fichas, diseña XR por capas y prepara la producción antes de ejecutar cualquier provider.' : 'Create or improve prompts, talk to Vision Copilot, update fichas, design layered XRolls and prepare production before executing any provider.'}</p>
        </div>
        <div className="v2-primary-actions">
          <button className="v2-choice primary" type="button" onClick={() => setView('prompt')}><div className="v2-choice-icon"><WandSparkles size={28}/></div><div><span className="micro">PROMPT STUDIO</span><strong>{es ? 'Crear / mejorar prompts' : 'Create / improve prompts'}</strong><p>{es ? 'Desde cero, Prompt Anatomy o con dirección profesional ABRAXAS.' : 'From scratch, Prompt Anatomy or professional ABRAXAS direction.'}</p></div><i>→</i></button>
          <button className="v2-choice" type="button" onClick={() => setView('assistant')}><div className="v2-choice-icon"><Bot size={28}/></div><div><span className="micro">VISION COPILOT</span><strong>{es ? 'Pensar y dirigir con IA' : 'Think and direct with AI'}</strong><p>{es ? 'NVIDIA NIM o Gemini para revisar prompts, sugerir referencias y proponer cambios que tú apruebas.' : 'NVIDIA NIM or Gemini to review prompts, suggest references and propose changes that you approve.'}</p></div><i>→</i></button>
        </div>
        <div className="v2-secondary-actions">
          <button type="button" onClick={() => setView('studio')}><ImageIcon size={19}/><div><strong>{es ? 'Crear / generar' : 'Create / generate'}</strong><span>{es ? 'Imagen · video · storyboard' : 'Image · video · storyboard'}</span></div></button>
          <button type="button" onClick={() => setView('ficha')}><FileUp size={19}/><div><strong>{es ? 'Importar ficha' : 'Import ficha'}</strong><span>HTML · JSON · TXT</span></div></button>
          <button type="button" onClick={() => setView('xroll')}><Layers3 size={19}/><div><strong>XRoll Studio</strong><span>Layers · prompts · motion</span></div></button>
          <button type="button" onClick={() => setView('learn')}><BookOpen size={19}/><div><strong>Cinema Playground</strong><span>{es ? 'Aprender viendo' : 'Learn visually'}</span></div></button>
        </div>
        <section className="v2-principle"><Sparkles size={18}/><div><strong>{es ? 'Una sola fuente de verdad' : 'One source of truth'}</strong><p>{es ? 'Copilot propone. Director/Prompt Studio conservan la intención. Creator ejecuta. Ningún modelo escribe silenciosamente sobre tu proyecto ni gasta créditos sin una acción explícita.' : 'Copilot proposes. Director/Prompt Studio preserve intent. Creator executes. No model silently overwrites your project or spends credits without an explicit action.'}</p></div></section>
      </main>
    </div>;
  }

  return <div className="vision-v2-shell">
    <header className="v2-switcher">
      <button className="v2-logo" type="button" onClick={() => setView('home')}><span>V</span><div><strong>Vision V2</strong><small>Director Studio</small></div></button>
      <nav>
        <button className={view === 'prompt' ? 'active' : ''} type="button" onClick={() => setView('prompt')}><WandSparkles size={15}/>Prompts</button>
        <button className={view === 'assistant' ? 'active' : ''} type="button" onClick={() => setView('assistant')}><Bot size={15}/>Copilot</button>
        <button className={view === 'ficha' ? 'active' : ''} type="button" onClick={() => setView('ficha')}><FileUp size={15}/>Fichas</button>
        <button className={view === 'xroll' ? 'active' : ''} type="button" onClick={() => setView('xroll')}><Layers3 size={15}/>XRoll</button>
        <button className={view === 'learn' ? 'active' : ''} type="button" onClick={() => setView('learn')}><BookOpen size={15}/>{es ? 'Aprender' : 'Learn'}</button>
        <button className={view === 'studio' ? 'active' : ''} type="button" onClick={() => setView('studio')}><Clapperboard size={15}/>Studio</button>
      </nav>
      <div className="v2-switcher-actions"><button type="button" onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}>{language.toUpperCase()}</button><button className={view === 'settings' ? 'active' : ''} type="button" onClick={() => setView('settings')} title={es ? 'Conexiones y API keys' : 'Connections and API keys'}><Settings2 size={16}/></button></div>
    </header>

    <main className="v2-workspace">
      {view === 'prompt' && <div className="v2-prompt-workspace"><div className="v2-prompt-tools"><div><span className="micro">PROMPT STUDIO</span><h1>{es ? 'Construye, entiende y mejora el prompt.' : 'Build, understand and improve the prompt.'}</h1><p>{es ? 'Prompt Anatomy separa el texto por función; Professional Prompt Lab compila el brief completo al target que elijas.' : 'Prompt Anatomy separates text by function; Professional Prompt Lab compiles the complete brief for your selected target.'}</p></div><ProfessionalPromptLab/></div><PromptAnatomy language={language} onCopy={copy}/></div>}
      {view === 'assistant' && <VisionCopilot language={language} onOpenSettings={() => setView('settings')} onOpenPromptStudio={() => setView('prompt')} onOpenXRoll={() => setView('xroll')}/>} 
      {view === 'settings' && <div className="vision-v2-settings-stack"><VisionAISettings language={language}/><VisionFirebaseSettings language={language}/></div>} 
      {view === 'ficha' && <FichaIntakePanel language={language} onCopy={copy}/>} 
      {view === 'xroll' && <XRollStudio language={language} onCopy={copy}/>} 
      {view === 'learn' && <CinemaPlayground language={language}/>} 
      {view === 'studio' && <VisionApp/>}
    </main>
  </div>;
}
