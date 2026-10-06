export type WorkspaceId =
  | 'home'
  | 'brand'
  | 'content'
  | 'fichas'
  | 'editorial'
  | 'geometra'
  | 'canter'
  | 'vision'
  | 'dresser'
  | 'review'
  | 'publisher';

export interface WorkspaceDefinition {
  id: WorkspaceId;
  label: string;
  purpose: string;
  modules: string[];
  vision?: string;
  status: 'foundation' | 'adapter-first' | 'new-engine';
}

export const workspaces: WorkspaceDefinition[] = [
  {
    id: 'home',
    label: 'Home',
    purpose: 'Projects, status and handoffs across the complete production system.',
    modules: ['Projects', 'Recent work', 'Jobs', 'Health'],
    status: 'foundation',
  },
  {
    id: 'brand',
    label: 'Brand',
    purpose: 'Brand strategy, operational Brand Adapter and visual direction.',
    modules: ['5 Drivers / 25 Tools', 'Brand Adapter', 'Vision DNA', 'Version compare'],
    vision: 'Produces BrandVisionProfile presets used by Content, Fichas, Vision and Dresser.',
    status: 'adapter-first',
  },
  {
    id: 'content',
    label: 'Content',
    purpose: 'Route an idea/source into the correct content contract and potential.',
    modules: ['Content Builder', 'Beta', 'Alfa', 'Visual Intent', 'Prompt quality'],
    vision: 'Visual routes and prompt constraints are created at ideation time, not added at the end.',
    status: 'adapter-first',
  },
  {
    id: 'fichas',
    label: 'Fichas',
    purpose: 'Canonical content document with provenance, revisions and production detail.',
    modules: ['Beta', 'Alfa', 'Production', 'Visual Production', 'Distribution'],
    vision: 'Each scene/slide/segment can own shot specs, references, prompts, layers and asset slots.',
    status: 'new-engine',
  },
  {
    id: 'editorial',
    label: 'Editorial',
    purpose: 'Plan content without duplicating it.',
    modules: ['Grid', 'Board', 'Timeline', 'Agenda', 'Calendar', 'Content Library', 'A1–A4'],
    status: 'adapter-first',
  },
  {
    id: 'geometra',
    label: 'Geómetra',
    purpose: 'Canonical library, validation, compilation and production projections.',
    modules: ['Library', 'Validator', 'Compiler', 'Kanban', 'Calendar', 'Lienzos'],
    status: 'adapter-first',
  },
  {
    id: 'canter',
    label: 'Canter',
    purpose: 'Source truth, transcript, alignment, source ranges, cutting and exports.',
    modules: ['Media', 'Transcript', 'Alignment', 'Cut Recipe', 'Export', 'Jobs'],
    status: 'adapter-first',
  },
  {
    id: 'vision',
    label: 'Vision',
    purpose: 'Abrxs Vision Art Creator: cinematic prompting, generation and layered assets.',
    modules: ['Quick Creator', 'Prompt Director', 'Cinema Controls', 'Reference Analyzer', 'Scene Studio', 'Vision Space', 'Layer Lab', 'Providers'],
    vision: 'Consumes BrandVisionProfile + VisualIntent + ShotSpec and emits reproducible PromptSpec/Asset/LayerPackage objects.',
    status: 'new-engine',
  },
  {
    id: 'dresser',
    label: 'Dresser',
    purpose: 'Turn an approved cut and assets into a finished, editable production.',
    modules: ['Auto Dress', 'Captions', 'B-Roll', 'X-Roll', 'Layers', 'Motion', 'Reframe', 'Audio', 'Timeline', 'Export'],
    status: 'new-engine',
  },
  {
    id: 'review',
    label: 'Review',
    purpose: 'Corrections and approvals attached to real project objects.',
    modules: ['Notes', 'With corrections', 'Approved', 'Diff', 'Audit trail'],
    status: 'new-engine',
  },
  {
    id: 'publisher',
    label: 'Publisher',
    purpose: 'Scheduling and distribution from an approved PublishPackage.',
    modules: ['Calendar', 'Platform copy', 'Metadata', 'Scheduling', 'Published status'],
    status: 'adapter-first',
  },
];
