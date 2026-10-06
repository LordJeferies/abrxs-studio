# Abrxs Studio Workspace Interface Blueprints V1

The reference images are treated as visual/interaction grammar, not as generic decoration. Each workspace inherits the same Abrxs chrome but changes its central composition to fit its job.

## 1. Home / Projects

Reference language: light/dark file-manager screens, compact side rail, project cards, right info pane.

### Layout

```text
Rail | Project navigator | Project grid/list | Info inspector
```

- Project cards resemble premium folders, not dashboard KPI tiles.
- Search and filters live immediately above the collection.
- Recently opened, pinned and active productions are first-class.
- Inspector shows storage, assets, brand, campaign, status, recent activity and health.
- Dragging a project/folder uses the global drag language and supports spring-loaded folder hover.

### Primary actions

New Project, Import Legacy Project, Open, Duplicate, Archive, Reveal Files.

## 2. Brand Builder

Reference language: focused glass questionnaire, modular smart-home cards, support/workspace multi-pane UI.

### Layout

```text
Rail | Brand sections | Working canvas | Brand Inspector
```

Brand sections: Foundation, Audience, Positioning, Voice, Identity, Vision DNA, Rules, Brand Adapter.

The canvas uses large focused question/decision cards. Multi-step setup can become a floating Liquid Glass wizard with progress at top. Existing brand data remains visible behind it when appropriate.

### Vision DNA

A dedicated visual panel presents palette, typography, photography, camera, lens, lighting, composition, motion, graphic language, caption language, reference assets and forbidden patterns.

Presets appear as visual swatches/cards; selecting one previews downstream Reel/Carousel/Thumbnail/Video behavior before saving.

## 3. Content Builder

Reference language: Lemon-style tri-pane support app and compact workflow cards.

### Layout

```text
Rail | Case/route list | Content workspace | Routing/contract inspector
```

The central workspace feels like an intelligent guided document rather than a long form. User intent sits at the top; available sources/inputs are represented as chips/cards; proposed outputs appear as route cards.

### Core interaction

1. State intent.
2. Attach source/brand/project.
3. Builder suggests route(s).
4. User selects output type.
5. Visual Intent is generated alongside editorial intent.
6. Contract preview appears in inspector.
7. Build Ficha.

Vision controls appear contextually as `Visual route`, `Prompt preset`, `Reference`, not as a separate late-stage tool.

## 4. Ficha Studio

Reference language: clean item-detail mobile screen, right-side property inspector, progressive disclosure.

### Desktop layout

```text
Rail | Ficha outline | Canonical document | Field inspector
```

Outline groups: Identity, Source, Beta, Alfa, Production, Visual, Audio, Distribution, Review.

The central document uses generous spacing and compact status markers. Each field can show provenance, validation and revision state without visual clutter.

The inspector updates for the selected field and shows origin, revisions, validation, locks, comments and linked assets.

### Mobile

The item-detail reference becomes the model: title/metadata at top, hero/preview card, grouped information rows, activity/revision log and sticky primary action. No desktop columns compressed into phone width.

## 5. Editorial

Reference language: desktop week calendar with left navigation, pastel/semantic event blocks, floating event detail card, compact filters.

### Layout

```text
Rail | Calendars/filters/library | Board/Week/Timeline/Agenda | Content inspector
```

Top local segmented control: Board / Week / Timeline / Agenda.

Calendar uses neutral background with subtle grid. Content cards carry only sparse accent: A1–A4, brand or status. Hover reveals handles/actions; rest state remains clean.

### Smart drag

Dragging from Content Library collapses/condenses the source pane and reveals a floating day palette. Existing day columns remain valid drop targets. Drop preview displays exact insertion point/date.

### Mobile

Bottom navigation + day/agenda emphasis. Filters and inspector use sheets. Seven-column micro calendar is not used for primary scheduling.

## 6. Geómetra / Lienzos

Reference language: project/file hierarchy + node/canvas workspace + inspector.

### Geómetra library

```text
Rail | Library hierarchy | Canonical items/list | Validation inspector
```

Strong folder/document metaphor for projects, fichas, routes and compiled Lienzos.

### Lienzo

```text
Rail | Scene/section navigator | Production canvas/timeline | Inspector
```

Lienzo is a production digital twin. Central area can switch between structured timeline and spatial/section view while preserving one selection model.

Tracks/lanes can expose Script, Visual Intent, Asset Slots, B-roll, XRoll, Audio, Review markers. It should read like a production plan, not a full NLE.

## 7. Canter

Reference language: Riverside recording layout, simple waveform clip editor, Final Cut-style precision timeline.

### Layout

```text
Rail | Projects/sources | Viewer + transcript | Source inspector
                         Timeline below
```

Viewer dominates upper center. Transcript can replace or sit beside source library. Timeline occupies the full lower region.

### Timeline

- video clip thumbnails;
- waveform linked to the clip;
- word-level selection markers;
- source-range handles;
- silence markers;
- speaker lanes when useful;
- single high-contrast playhead;
- zoom scale with keyboard/trackpad shortcuts.

Canter keeps a restrained editor palette: selected cut gets a bright neutral/blue ring, rejected/invalid boundaries get semantic warning colors.

### Modes

Transcribe / Design Cuts / Cut / Review are workspace states, not separate apps.

## 8. Abrxs Vision Art Creator

Reference language: black node canvas with image and assistant nodes, Cinema-style floating parameter consoles, full-screen media preview.

### Quick mode

Centered prompt composer with reference attachments and two outputs: Image Prompt and Motion Prompt.

### Director mode

Prompt at center/bottom with pills for References, Film, Camera, Framing, Movement, Lighting, Color, Production, Layers. Each pill opens a floating Liquid Glass console containing visual presets and precise controls.

### Scene mode

Left shot/scene strip, central hero frame/preview, right continuity/identity inspector. Shots display status, take count and reference locks.

### Vision Space

Infinite dark canvas with sparse grid. Nodes are compact and media-first. Top floating control bar contains model, aspect, resolution, batch and run. Side tool rail contains create/connect/zoom/history tools.

Nodes: Prompt Director, Text, Reference, Image, Video, List/Batch, Analyze, Improve, Layer Split, Carousel, Export/Handoff.

## 9. Vision Carousel Studio

Reference language: mobile template browser, high-quality preview cards, visual design controls.

### Layout

```text
Rail | Slides / structure | Large slide preview | Design inspector
```

Slide navigator shows thumbnails. Center always previews the selected 4:5/1:1/document slide at realistic size. Inspector has Copy, Layout, Image, Typography, Brand, Layers, Output.

### Output mode switch

- Final with text
- Clean image
- Text PNG/SVG
- Background
- Foreground
- Layer package
- Prompt pack
- Canva-ready

Prompt output can include slide title/body or keep them separate depending `textMode`.

## 10. Dresser

Reference language: modern desktop video editor + Final Cut iPad + chain/timeline interaction.

### Layout

```text
Rail | Media/Studios | Viewer/Canvas | Inspector
                     Multitrack timeline below
```

Top center is the viewer. Left switches between Media, Captions, B-roll, XRoll, Layers, Audio and Templates. Right inspector changes according to selection. Timeline spans from left content boundary to inspector.

### Tracks

Video, B-roll, XRoll, Graphics, Captions, Audio, Music/SFX. Each track uses a restrained identity color from design tokens.

### Auto Dress

A floating plan panel summarizes proposed operations before execution: caption preset, B-roll slots, XRoll slots, zoom/motion, music/SFX, reframe and render target. User can accept all or inspect individual operations.

### Studio modes

Caption Studio can temporarily replace left media pane with caption presets/transcript. B-roll/XRoll Studio uses candidate cards above the timeline. Layer Studio exposes z-order and depth without leaving the main editor.

## 11. Review

Reference language: social/live media interfaces and item-detail activity logs.

### Layout

```text
Rail | Review queue | Large preview | Comments / comparison inspector
```

Central preview switches between final, previous version, split compare and overlay compare. Comments can pin to timecode, slide, asset, caption or object.

Statuses: Ready for review, With corrections, Approved. Approval actions are clear and sparse.

## 12. Publisher

Reference language: polished social/mobile preview with calendar and platform-specific cards.

### Desktop layout

```text
Rail | Channels/campaigns | Calendar/queue | Publish inspector
```

A piece can be previewed as Instagram, LinkedIn, TikTok, YouTube or other supported destinations. Inspector shows copy, title, thumbnail, date/time, destination, account and validation.

### Mobile

Media-first preview + bottom action bar. Queue/calendar becomes agenda/list. Scheduling and approval stay full-featured where provider/browser support allows.

## 13. Shared Command Palette

`⌘K` opens a small Liquid Glass command palette, not a giant modal. It searches workspaces, projects, content, actions and commands. Context actions rank above global actions.

Example commands:

- Create XRoll
- Open Prompt Director
- Generate carousel prompts
- Find Ficha
- Add to Thursday
- Transcribe source
- Auto Dress selection
- Export clean video
- Schedule piece

## 14. Jobs Drawer

Jobs is a global right-side drawer or popover showing long-running work: transcription, generation, rendering, export, sync and publishing. Each Job shows stage, progress, ETA when available, cancel/retry and scoped logs. Jobs never freeze the whole app unless the requested operation truly requires it.

## 15. Visual density modes

Desktop supports Comfortable and Compact density. Compact reduces vertical padding and row heights, not type legibility or hit-test reliability. Touch/tablet always uses comfortable/touch dimensions.
