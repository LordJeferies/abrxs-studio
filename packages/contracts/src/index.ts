import { z } from 'zod';

export const Id = z.string().min(1);
export const IsoDate = z.string().min(1);

export const BrandVisionProfileSchema = z.object({
  contract: z.literal('abrxs.brand-vision-profile.v1'),
  id: Id,
  brandId: Id,
  name: z.string().min(1),
  palette: z.array(z.string()).default([]),
  typography: z.array(z.string()).default([]),
  photographyLanguage: z.array(z.string()).default([]),
  cinematicLanguage: z.array(z.string()).default([]),
  preferredCameraLanguage: z.array(z.string()).default([]),
  lightingLanguage: z.array(z.string()).default([]),
  compositionLanguage: z.array(z.string()).default([]),
  motionLanguage: z.array(z.string()).default([]),
  graphicLanguage: z.array(z.string()).default([]),
  forbiddenPatterns: z.array(z.string()).default([]),
  promptPresets: z.record(z.string(), z.string()).default({}),
  updatedAt: IsoDate,
});

export const VisualIntentSchema = z.object({
  contract: z.literal('abrxs.visual-intent.v1'),
  id: Id,
  contentId: Id,
  purpose: z.string().min(1),
  message: z.string().default(''),
  routes: z.array(z.object({
    id: Id,
    label: z.string(),
    description: z.string(),
    selected: z.boolean().default(false),
  })).default([]),
  brandVisionProfileId: Id.optional(),
  locks: z.array(z.string()).default([]),
  forbiddenChanges: z.array(z.string()).default([]),
});

export const SourceRangeSchema = z.object({
  start: z.number().nonnegative(),
  end: z.number().positive(),
  speaker: z.string().optional(),
});

export const SourceTruthSchema = z.object({
  contract: z.literal('abrxs.source-truth.v1'),
  id: Id,
  mediaSourceId: Id,
  language: z.array(z.string()).default([]),
  duration: z.number().nonnegative(),
  wordLevelUri: z.string().optional(),
  transcriptUri: z.string().optional(),
  speakers: z.array(z.string()).default([]),
});

export const ShotSpecSchema = z.object({
  contract: z.literal('abrxs.shot-spec.v1'),
  id: Id,
  visualIntentId: Id.optional(),
  subject: z.string().default(''),
  environment: z.string().default(''),
  framing: z.string().default('auto'),
  angle: z.string().default('auto'),
  camera: z.string().default('auto'),
  lens: z.string().default('auto'),
  focalLength: z.string().default('auto'),
  aperture: z.string().default('auto'),
  movement: z.array(z.string()).default([]),
  lighting: z.string().default('auto'),
  palette: z.array(z.string()).default([]),
  directorLocks: z.array(z.string()).default([]),
});

export const PromptSpecSchema = z.object({
  contract: z.literal('abrxs.prompt-spec.v1'),
  id: Id,
  shotSpecId: Id.optional(),
  baseDirection: z.string().min(1),
  imagePrompt: z.string().default(''),
  motionPrompt: z.string().default(''),
  negativePrompt: z.string().default(''),
  providerTarget: z.string().default('prompt-only'),
  directorLocks: z.array(z.string()).default([]),
  enhancementMode: z.enum(['clean', 'cinematic', 'photoreal', 'commercial', 'editorial', 'motion', 'provider-optimized']).default('clean'),
});

export const AssetSchema = z.object({
  contract: z.literal('abrxs.asset.v1'),
  id: Id,
  kind: z.enum(['image', 'video', 'audio', 'text', 'graphic', 'layer-package', 'other']),
  uri: z.string().min(1),
  source: z.enum(['local', 'generated', 'stock', 'uploaded', 'legacy']),
  version: z.number().int().positive().default(1),
  parentAssetId: Id.optional(),
  promptSpecId: Id.optional(),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export const LayerPackageSchema = z.object({
  contract: z.literal('abrxs.layer-package.v1'),
  id: Id,
  compositeAssetId: Id.optional(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  layers: z.array(z.object({
    id: Id,
    role: z.enum(['background', 'midground', 'subject', 'foreground', 'text', 'graphic', 'effect', 'other']),
    assetId: Id,
    zIndex: z.number().int(),
    transparent: z.boolean().default(false),
    motionHint: z.string().optional(),
  })).default([]),
  depthAssetId: Id.optional(),
});

export const FichaSchema = z.object({
  contract: z.literal('abrxs.ficha.v1'),
  id: Id,
  canonicalId: Id,
  projectId: Id,
  brandId: Id.optional(),
  title: z.string().min(1),
  stage: z.enum(['beta', 'alfa', 'omega']).default('beta'),
  type: z.string().default(''),
  family: z.string().default(''),
  lot: z.string().default(''),
  editorialOrder: z.enum(['A1', 'A2', 'A3', 'A4']).optional(),
  sourceTruthId: Id.optional(),
  sourceRanges: z.array(SourceRangeSchema).default([]),
  visualIntentIds: z.array(Id).default([]),
  shotSpecIds: z.array(Id).default([]),
  assetSlotIds: z.array(Id).default([]),
  status: z.enum(['draft', 'ready-for-review', 'with-corrections', 'approved', 'scheduled', 'published']).default('draft'),
  provenance: z.record(z.string(), z.unknown()).default({}),
});

export const EditorialPlacementSchema = z.object({
  contract: z.literal('abrxs.editorial-placement.v1'),
  id: Id,
  fichaId: Id,
  date: IsoDate,
  platform: z.array(z.string()).default([]),
  order: z.enum(['A1', 'A2', 'A3', 'A4']).optional(),
  state: z.enum(['confirmation', 'corrections', 'ready', 'scheduled', 'published']).default('confirmation'),
});

export const DressProjectSchema = z.object({
  contract: z.literal('abrxs.dress-project.v1'),
  id: Id,
  fichaId: Id.optional(),
  sourceAssetId: Id,
  duration: z.number().nonnegative(),
  tracks: z.array(z.object({
    id: Id,
    kind: z.enum(['video', 'overlay', 'caption', 'graphic', 'music', 'sfx', 'voice']),
    clips: z.array(z.object({
      id: Id,
      assetId: Id.optional(),
      start: z.number().nonnegative(),
      end: z.number().positive(),
      type: z.string(),
      status: z.enum(['planned', 'generated', 'approved', 'disabled']).default('planned'),
      params: z.record(z.string(), z.unknown()).default({}),
    })).default([]),
  })).default([]),
  brandVisionProfileId: Id.optional(),
  revision: z.number().int().nonnegative().default(0),
});

export const PublishPackageSchema = z.object({
  contract: z.literal('abrxs.publish-package.v1'),
  id: Id,
  fichaId: Id,
  finalAssetId: Id,
  platforms: z.array(z.string()).min(1),
  copies: z.record(z.string(), z.string()).default({}),
  metadata: z.record(z.string(), z.unknown()).default({}),
  scheduledAt: IsoDate.optional(),
});

export const JobSchema = z.object({
  contract: z.literal('abrxs.job.v1'),
  id: Id,
  type: z.string().min(1),
  state: z.enum(['queued', 'running', 'waiting-approval', 'completed', 'failed', 'cancelled']),
  progress: z.number().min(0).max(1).default(0),
  stage: z.string().default(''),
  error: z.string().optional(),
  createdAt: IsoDate,
  updatedAt: IsoDate,
});

export type BrandVisionProfile = z.infer<typeof BrandVisionProfileSchema>;
export type VisualIntent = z.infer<typeof VisualIntentSchema>;
export type SourceTruth = z.infer<typeof SourceTruthSchema>;
export type ShotSpec = z.infer<typeof ShotSpecSchema>;
export type PromptSpec = z.infer<typeof PromptSpecSchema>;
export type Asset = z.infer<typeof AssetSchema>;
export type LayerPackage = z.infer<typeof LayerPackageSchema>;
export type Ficha = z.infer<typeof FichaSchema>;
export type EditorialPlacement = z.infer<typeof EditorialPlacementSchema>;
export type DressProject = z.infer<typeof DressProjectSchema>;
export type PublishPackage = z.infer<typeof PublishPackageSchema>;
export type Job = z.infer<typeof JobSchema>;
