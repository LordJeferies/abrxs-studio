import { compileProfessionalPrompt, type ProfessionalPromptPacket } from './professionalPromptEngine';
import { defaults, type DirectorState } from './promptEngine';
import type { GenerationIntent, GenerationMode, GenerationTargetId, VisualReference } from './skillEngine';
import { compileXRoll, type XRollSpec } from './xrollEngine';

export type ContentPromptEngine = 'basic' | 'vision';

export type ContentVisualIntent = {
  contentId: string;
  title?: string;
  thesis: string;
  objective?: string;
  visualIntent?: string;
  visualFunction?: string;
  format?: string;
  platform?: string;
  brandPresetId?: string;
  promptDraft?: string;
  subject?: string;
  environment?: string;
  action?: string;
  references?: VisualReference[];
  outputLanguage?: 'auto' | 'es' | 'en';
  xroll?: {
    enabled?: boolean;
    duration?: number;
    layers?: number;
    style?: string;
  };
};

export type ContentVisionRequest = {
  engine: ContentPromptEngine;
  visual: ContentVisualIntent;
  target?: GenerationTargetId;
  mode?: GenerationMode;
  intent?: GenerationIntent;
  directorOverrides?: Partial<DirectorState>;
};

export type VisionContentPackage = {
  schema: 'abrxs.vision.content-bridge.v2';
  contentId: string;
  engine: ContentPromptEngine;
  sourcePrompt?: string;
  director: DirectorState;
  prompt?: ProfessionalPromptPacket;
  xroll?: XRollSpec;
  handoff: {
    contentCreator: string[];
    dresser: string[];
  };
};

function aspectForFormat(format?: string) {
  const value = String(format ?? '').toLowerCase();
  if (value.includes('vertical') || value.includes('reel') || value.includes('short') || value.includes('9:16')) return '9:16';
  if (value.includes('carousel') || value.includes('4:5')) return '4:5';
  if (value.includes('horizontal') || value.includes('youtube') || value.includes('16:9')) return '16:9';
  return defaults.aspect;
}

function directorFromVisual(visual: ContentVisualIntent, overrides?: Partial<DirectorState>): DirectorState {
  return {
    ...defaults,
    idea: visual.visualIntent || visual.thesis || visual.promptDraft || defaults.idea,
    subject: visual.subject || defaults.subject,
    environment: visual.environment || defaults.environment,
    action: visual.action || defaults.action,
    visualFunction: visual.visualFunction || visual.objective || visual.thesis,
    aspect: aspectForFormat(visual.format),
    brandPreset: visual.brandPresetId || defaults.brandPreset,
    outputLanguage: visual.outputLanguage || defaults.outputLanguage,
    ...overrides,
  };
}

export function compileContentVision(request: ContentVisionRequest): VisionContentPackage {
  const visual = request.visual;
  const director = directorFromVisual(visual, request.directorOverrides);
  if (request.engine === 'basic') {
    return {
      schema: 'abrxs.vision.content-bridge.v2',
      contentId: visual.contentId,
      engine: 'basic',
      sourcePrompt: visual.promptDraft,
      director,
      handoff: {
        contentCreator: ['Keep the current prompt draft as authored by Content Creator.'],
        dresser: ['No Vision production package was requested.'],
      },
    };
  }

  const mode = request.mode ?? (visual.xroll?.enabled ? 'text-to-video' : 'text-to-image');
  const target = request.target ?? 'generic-production';
  const intent = request.intent ?? (visual.xroll?.enabled ? 'social-visual' : 'editorial-visual');
  const prompt = compileProfessionalPrompt({
    director,
    target,
    mode,
    intent,
    references: visual.references,
    brief: {
      objective: visual.objective || visual.visualIntent || visual.thesis,
      mustHave: [visual.subject, visual.visualFunction, visual.format].filter(Boolean).join('; '),
      outputRequirements: `Content ${visual.contentId}; format ${visual.format || 'inherit'}; platform ${visual.platform || 'inherit'}. Preserve editorial truth and return a downstream-ready package.`,
      referenceInstructions: 'Use references only for their assigned role. A style/light reference must not overwrite identity or source truth.',
    },
  });

  const xroll = visual.xroll?.enabled
    ? compileXRoll({
        idea: visual.visualIntent || visual.thesis,
        duration: visual.xroll.duration,
        layerCount: visual.xroll.layers,
        style: visual.xroll.style,
        aspect: director.aspect,
        brand: visual.brandPresetId || 'current Brand Vision',
        camera: `${director.focal} · ${director.framing} · ${director.angle}`,
        motion: director.movement,
      })
    : undefined;

  return {
    schema: 'abrxs.vision.content-bridge.v2',
    contentId: visual.contentId,
    engine: 'vision',
    sourcePrompt: visual.promptDraft,
    director,
    prompt,
    xroll,
    handoff: {
      contentCreator: [
        'Store the canonical Vision package next to the content ficha rather than replacing thesis/source-truth fields.',
        'Expose the approved target prompt and QA status in the Visual/Vision section.',
        'Keep promptDraft for audit/history even after Vision approval.',
      ],
      dresser: xroll
        ? ['Use XRoll layer IDs, motion spec, timing, output contract and editable typography policy.']
        : ['Use the production spec, continuity and output contract as downstream visual finishing guidance.'],
    },
  };
}
