import { useMemo, useState } from 'react';
import type { WorkspaceId } from './workspaces';
import { workspaces } from './workspaces';

const statusLabels = {
  foundation: 'Foundation',
  'adapter-first': 'Legacy adapter',
  'new-engine': 'New engine',
} as const;

export function App() {
  const [activeId, setActiveId] = useState<WorkspaceId>('home');
  const active = useMemo(
    () => workspaces.find((workspace) => workspace.id === activeId) ?? workspaces[0],
    [activeId],
  );

  return (
    <div className="studio-shell">
      <aside className="sidebar" aria-label="Abrxs Studio workspaces">
        <div className="brand-block">
          <div className="brand-mark">A</div>
          <div>
            <strong>Abrxs Studio</strong>
            <span>0.1 Foundation</span>
          </div>
        </div>

        <nav className="workspace-nav">
          {workspaces.map((workspace) => (
            <button
              key={workspace.id}
              type="button"
              className={workspace.id === activeId ? 'nav-item active' : 'nav-item'}
              onClick={() => setActiveId(workspace.id)}
            >
              <span>{workspace.label}</span>
              <i aria-hidden="true" />
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <span className="health-dot" />
          Core foundation
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">WORKSPACE</p>
            <h1>{active.label}</h1>
          </div>
          <div className="topbar-actions">
            <button type="button" className="ghost-button">Jobs</button>
            <button type="button" className="primary-button">New project</button>
          </div>
        </header>

        <section className="hero-panel">
          <div>
            <span className={`status-chip ${active.status}`}>{statusLabels[active.status]}</span>
            <h2>{active.purpose}</h2>
            {active.vision && <p className="vision-note">Vision integration · {active.vision}</p>}
          </div>
          <div className="contract-flow" aria-label="Canonical production flow">
            <span>Brand</span><b>→</b><span>Content</span><b>→</b><span>Ficha</span><b>→</b><span>Editorial</span><b>→</b><span>Produce</span>
          </div>
        </section>

        <section className="module-grid" aria-label={`${active.label} modules`}>
          {active.modules.map((module, index) => (
            <article className="module-card" key={module}>
              <div className="module-number">{String(index + 1).padStart(2, '0')}</div>
              <h3>{module}</h3>
              <p>Contract-first module. Implementation lands without creating parallel project state.</p>
              <button type="button" disabled>Foundation</button>
            </article>
          ))}
        </section>

        {active.id === 'home' && (
          <section className="system-map">
            <div>
              <p className="eyebrow">CANONICAL PIECE</p>
              <h2>One identity, multiple professional views.</h2>
            </div>
            <div className="pipeline">
              {['BRAND', 'CONTENT', 'FICHA', 'EDITORIAL', 'GEÓMETRA', 'CANTER', 'VISION', 'DRESSER', 'REVIEW', 'PUBLISHER'].map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
