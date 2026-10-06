# Abrxs Studio Frontend System V1

## Objective

Abrxs Studio is Desktop-first and must feel like a professional native production suite rather than a collection of web dashboards. The UI is monochrome by default (black, white and neutral grays), with sparse semantic/accent color and media-driven color. Liquid Glass is a control/navigation material, not a blanket card style.

The same design system supports Desktop, iPad/tablet, Web/PWA and compact mobile adaptations. Desktop remains the canonical production target.

## Visual grammar extracted from the reference set

The supplied references consistently use the following patterns:

1. **Media-first content** — imagery, video or the current artifact dominates the screen. Chrome recedes.
2. **One strong navigation axis** — slim icon rail or sidebar on desktop, bottom/tab navigation on compact mobile.
3. **Contextual secondary navigation** — horizontal thumbnails, segmented controls, breadcrumbs or local tabs appear only when needed.
4. **Large-radius grouped surfaces** — 18–30 px outer radii, 8–16 px nested controls, very small border contrast.
5. **Strong hierarchy through scale, not decoration** — one primary title, compact metadata, muted labels, bold selected values.
6. **Inspector pattern** — selected object details live in a trailing panel instead of expanding every card inline.
7. **Floating actions** — contextual toolbars, sheets and controls float over content and can use real glass.
8. **Precise timeline language** — clips are blocks with visible handles, waveforms/thumbnails, track identity and a single unambiguous playhead.
9. **Progressive disclosure** — simple default surface, advanced controls in panels/popovers/inspectors.
10. **Consistent rounded geometry** — rectangles, pills and circles follow a small radius system instead of arbitrary radii.

## Canonical desktop composition

Most professional workspaces use a four-zone composition:

```text
┌──────────────────────────────────────────────────────────────┐
│ Native titlebar / global toolbar                            │
├──────┬───────────────────┬──────────────────────┬────────────┤
│ Rail │ Navigator/Library │ Primary workspace    │ Inspector  │
│ 56px │ 180–280px         │ fluid minmax(0,1fr) │ 300–380px  │
└──────┴───────────────────┴──────────────────────┴────────────┘
```

Not every workspace needs all panes. Panes disappear before the primary workspace becomes cramped. Apple split-view guidance is followed: current selection remains obvious, panes can be resized/hidden, and tertiary/inspector panes collapse first.

### Window behavior

- Native movable/resizable window.
- Full-screen supported.
- Sidebar and inspector independently collapsible.
- Pane widths persisted per workspace.
- Minimum productive width around 900 px for full multi-pane mode.
- Compact desktop hides inspector into a floating panel/sheet before changing core information architecture.
- Keyboard navigation and shortcuts are first-class.

## Navigation

### Global rail

56 px compact rail, inspired by the narrow sidebars in the references.

- Home / Projects
- Brand
- Content
- Fichas
- Editorial
- Geómetra
- Canter
- Vision
- Dresser
- Review
- Publisher

Selected workspace gets a filled monochrome capsule plus one optional accent indicator. Labels appear in expanded mode or tooltip.

### Local navigator

Each workspace may expose a second pane for hierarchy, assets, documents, shots, clips, campaigns or folders. Maximum two visible hierarchy levels before moving deeper detail to the central content pane.

## Top toolbar

52 px default height. Leading: sidebar toggle + location/title. Center: workspace-specific primary controls. Trailing: search, jobs, collaboration/status, inspector toggle and primary action.

Toolbar controls collapse into an overflow menu as width decreases. Critical commands remain accessible through menu/keyboard even when hidden visually.

## Inspector

Trailing inspector defaults to 320 px and expands to 380 px for dense editors.

Inspector sections:

- Selection identity
- Status / validation
- Primary properties
- Visual / timing / generation controls
- Provenance / revision
- Comments / review when relevant

Sections use disclosure groups. Simple adjustments use sliders, segmented controls, steppers and toggles. The inspector updates instantly when selection changes.

## Surfaces

### Base content surfaces

Do **not** apply WebGL glass to calendars, timelines, list rows, thumbnails, document grids or dense editors. Use opaque/near-opaque surfaces with 1 px low-contrast borders and extremely subtle inner highlights.

### Liquid Glass surfaces

Real `@ybouane/liquidglass` is reserved for:

- titlebar-adjacent floating toolbar groups;
- command palette;
- compact floating inspectors;
- quick-create panel;
- Prompt Director floating window;
- contextual tool palette over media/canvas;
- bottom/mobile dock;
- modal/sheet chrome where the captured scene is small and controlled.

Liquid Glass roots must stay small and shallow. Glass elements are direct children of their root. Avoid many WebGL contexts. Dynamic/video capture is used only where necessary; one-shot visual changes call `markChanged()` instead of permanent `data-dynamic` recapture.

Fallback material:

```css
background: rgba(20,20,23,.54);
backdrop-filter: blur(28px) saturate(145%);
border: 1px solid rgba(255,255,255,.16);
box-shadow: 0 18px 54px rgba(0,0,0,.34),
            inset 0 1px 0 rgba(255,255,255,.08);
```

The fallback is not considered equivalent to the WebGL effect; it is used for unsupported/low-power contexts and large surfaces.

## Color

Base UI remains neutral. Color serves one of four functions only:

1. active workspace or brand accent;
2. semantic state (success/warning/error/info);
3. timeline track identity;
4. content/media itself.

Avoid rainbow dashboards. A screen normally has one dominant accent plus semantic statuses.

## Typography

System/SF family. Default desktop body is 13 px, secondary labels 11–12 px, controls 12–13 px, section titles 15–18 px, document/workspace titles 22–30 px. Hero/onboarding titles may use 34–56 px. Tight tracking is reserved for large display text, not body copy.

## Motion system

Motion is functional and short.

- hover: 90–150 ms;
- press/release: 90–150 ms;
- popover/menu: 150–220 ms;
- inspector/sidebar geometry: 220–280 ms;
- sheet/modal: 280–360 ms;
- large canvas mode switch: 300–420 ms.

Use transform and opacity where possible. Layout-affecting animation is limited to pane resizing and deliberate editor transitions. Respect `prefers-reduced-motion`.

### Drag and drop

Every drag interaction follows the same language:

1. pointer threshold before drag so clicks remain clicks;
2. pointer capture;
3. source becomes slightly translucent without disappearing;
4. floating ghost scales to ~1.02 and gains `--abrxs-drag-ring`;
5. legal targets receive a subtle accent wash and insertion marker;
6. auto-scroll occurs near pane/timeline edges;
7. drop is optimistic in UI, then persisted;
8. failed persistence rolls back with a compact error toast;
9. cancel/Escape returns with a short spring-like transform;
10. no full-document MutationObserver is used for drag state.

Large lists/timelines virtualize off-screen items. Pointer-move work is scheduled through animation frames and avoids React state churn per pixel.

## Interaction quality bar

- No action appears blocked unless work is genuinely blocking.
- Immediate optimistic feedback for local edits.
- Long work becomes an explicit Job with progress/cancel/retry/error.
- Skeletons are used for initial remote content; spinners only for small scoped actions.
- Empty states explain the next useful action.
- Errors stay near the failed object and are recoverable.
- Autosave never hides failure.
- Undo/redo is available in editors and visual workflows.
- Focus states are visible for keyboard users.
- Context menus are real contextual actions, not duplicate navigation menus.

## Responsive adaptation

### Wide desktop >= 1280
Full rail + navigator + primary + inspector.

### Compact desktop 960–1279
Navigator can collapse to rail; inspector floats or collapses; main editor remains structurally unchanged.

### Tablet 720–959
One persistent primary pane, optional overlay navigator/inspector. Touch targets >= 44 px. Timelines keep horizontal scrolling rather than crushing tracks.

### Mobile < 720
No compressed four-pane desktop. Use:

- top context bar;
- primary content;
- bottom/tab navigation;
- bottom sheets for inspectors and filters;
- horizontally scrollable contextual media/shot strips;
- one primary action per screen.

Use safe areas, `100dvh` and `visualViewport` handling. Dense 7-column desktop calendars become agenda/day/compact week views rather than microscopic columns.

## Performance budget

- target 60 fps for pointer/drag/timeline scrubbing;
- avoid rerendering the full workspace for selection changes;
- store transient drag/playhead state outside expensive document trees;
- lazy-load heavy workspace engines;
- use workers/native services for waveform extraction, media probe and expensive transforms;
- use thumbnails/proxies for large video sources;
- cancel obsolete async work;
- cache derived media metadata;
- never run full DOM capture or WebGL glass over a media timeline/calendar grid.

## Accessibility

- keyboard-accessible workspace navigation;
- clear focus ring;
- semantic labels for icons;
- accent color is never the only state indicator;
- sufficient contrast on glass and media backgrounds;
- reduced motion/transparency alternatives;
- target sizes >= 44 px in touch contexts.
