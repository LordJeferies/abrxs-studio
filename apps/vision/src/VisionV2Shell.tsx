import { Clapperboard, FileUp, Image as ImageIcon, Layers3, Play, Settings2, Sparkles, WandSparkles } from 'lucide-react';
import { useState } from 'react';
import { FichaIntakePanel } from './FichaIntakePanel';
import { useVisionI18n } from './i18n';
import { ProfessionalPromptLab } from './ProfessionalPromptLab';
import { VisionApp } from './VisionApp';
import { XRollStudio } from './XRollStudio';

type V2View = 'home' | 'prompt' | 'ficha' | 'xroll' | 'studio';

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
          <p>{es ? 'Crea o mejora prompts, actualiza fichas del Geómetra/Content Creator, diseña XR por capas y prepara la producción antes de conectar cualquier API.' : 'Create or improve prompts, update Geómetra/Content Creator fichas, design layered XRolls and prepare production before connecting any API.'}</p>
        </div>
        <div className="v2-primary-actions">
          <button className="v2-choice primary" type="button" onClick={() => setView('prompt')}><div className="v2-choice-icon"><WandSparkles size={28}/></div><div><span className="micro">PROMPT STUDIO</span><strong>{es ? 'Crear / mejorar prompts' : 'Create / improve prompts'}</strong><p>{es ? 'Desde cero o con dirección profesional ABRAXAS.' : 'From scratch or with professional ABRAXAS direction.'}</p></div><i>→</i></button>
          <button className="v2-choice" type="button" onClick={() => setView('studio')}><div className="v2-choice-icon"><ImageIcon size={28}/></div><div><span className="micro">GENERATE / DIRECT</span><strong>{es ? 'Imagen / vídeo / storyboard' : 'Image / video / storyboard'}</strong><p>{es ? 'Usa el Director, referencias y targets. La generación sólo se habilita cuando exista un provider real.' : 'Use Director, references and targets. Generation only enables when a real provider is connected.'}</p></div><i>→</i></button>
        </div>
        <div className="v2-secondary-actions">
          <button type="button" onClick={() => setView('ficha')}><FileUp size={19}/><div><strong>{es ? 'Importar ficha' : 'Import ficha'}</strong><span>HTML · JSON · TXT</span></div></button>
          <button type="button" onClick={() => setView('xroll')}><Layers3 size={19}/><div><strong>XRoll Studio</strong><span>{es ? 'Layers · prompts · motion' : 'Layers · prompts · motion'}</span></div></button>
          <button type="button" onClick={() => setView('studio')}><Clapperboard size={19}/><div><strong>Director Studio</strong><span>{es ? 'Cámara · luz · continuidad' : 'Camera · light · continuity'}</span></div></button>
          <button type="button" onClick={() => setView('studio')}><Play size={19}/><div><strong>{es ? 'Storyboard / Carousel' : 'Storyboard / Carousel'}</strong><span>{es ? 'Narrativa visual' : 'Visual narrative'}</span></div></button>
        </div>
        <section className="v2-principle"><Sparkles size={18}/><div><strong>{es ? 'Una sola fuente de verdad' : 'One source of truth'}</strong><p>{es ? 'Vision conserva una especificación canónica y la compila a imagen, vídeo, XR, carrusel o target específico sin obligarte a reescribir la intención.' : 'Vision keeps one canonical specification and compiles it to image, video, XRoll, carousel or a target-specific dialect without forcing you to rewrite the intent.'}</p></div></section>
      </main>
    </div>;
  }

  return <div className="vision-v2-shell">
    <header className="v2-switcher">
      <button className="v2-logo" type="button" onClick={() => setView('home')}><span>V</span><div><strong>Vision V2</strong><small>Director Studio</small></div></button>
      <nav>
        <button className={view === 'prompt' ? 'active' : ''} type="button" onClick={() => setView('prompt')}><WandSparkles size={15}/>{es ? 'Prompts' : 'Prompts'}</button>
        <button className={view === 'ficha' ? 'active' : ''} type="button" onClick={() => setView('ficha')}><FileUp size={15}/>{es ? 'Fichas' : 'Fichas'}</button>
        <button className={view === 'xroll' ? 'active' : ''} type="button" onClick={() => setView('xroll')}><Layers3 size={15}/>XRoll</button>
        <button className={view === 'studio' ? 'active' : ''} type="button" onClick={() => setView('studio')}><Clapperboard size={15}/>Studio</button>
      </nav>
      <div className="v2-switcher-actions"><button type="button" onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}>{language.toUpperCase()}</button><button type="button" onClick={() => setView('studio')} title={es ? 'Configuración dentro de Studio' : 'Settings inside Studio'}><Settings2 size={16}/></button></div>
    </header>

    <main className="v2-workspace">
      {view === 'prompt' && <div className="v2-prompt-workspace"><ProfessionalPromptLab/><div className="v2-existing-core"><VisionApp/></div></div>}
      {view === 'ficha' && <FichaIntakePanel language={language} onCopy={copy}/>} 
      {view === 'xroll' && <XRollStudio language={language} onCopy={copy}/>} 
      {view === 'studio' && <VisionApp/>}
    </main>
  </div>;
}
