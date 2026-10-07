# Abrxs Vision V2.5 Director Studio — architecture

## Product role

Abrxs Vision is the visual-direction layer between content intent and visual generation/production.

It is not primarily an image generator and it is not a form-based prompt template system. Its primary job is to convert a source idea into an explicit, auditable visual production direction.

```text
Content Creator / Geómetra / user text / imported ficha
                         ↓
                    SOURCE TRUTH
                         ↓
                  VISION DIRECTOR
                         ↓
             ABRAXAS GENERATION SPEC
                         ↓
            provider / production compiler
                         ↓
Image · Video · XRoll · Storyboard · Carousel · Dresser
```

## Design decision: text stays text

A prompt remains readable/editable text. The application does not force the user to manage every semantic category as a permanent full-width form row.

Prompt Anatomy is an assistive overlay:

- intent
- subject
- action
- scene
- camera / optics / exposure
- composition
- light / color
- motion
- look / material / FX
- continuity
- constraints
- text
- output

The overlay can be hidden.

## V2.5 Director dimensions

The canonical visual decision library lives in `apps/vision/src/directorFinal.ts` and currently covers:

1. Shot size
2. Camera / sensor character
3. Lens / focal behavior
4. Angle / height
5. Aperture
6. Focus behavior
7. Shutter
8. Frame rate
9. White balance
10. Composition / blocking
11. Lighting
12. Camera movement
13. Subject movement
14. Environment movement
15. Look / film response
16. Atmosphere
17. Material response
18. FX / optical effects

Each option stores not only a name but also:

- short explanation
- visual effect
- emotional/tonal feel
- good-use contexts
- avoid-when guidance
- exact production prompt language
- preview metadata
- tags

This is why a non-filmmaker can use the same vocabulary as an advanced user without the interface exposing raw technical complexity all at once.

## Presets

A preset stores a combination of decisions, not a frozen prompt string.

```text
Preset
  ↓
Director selections
  ↓
GenerationSpec / prompt compilation
```

A user may:

- receive semantic recommendations from Source Truth
- apply a built-in preset
- modify individual decisions
- save a personal combination
- compile it for a different output/target without losing source intent

## Prompt compilation

`compileDirectorPrompt` keeps Source Truth separate from visual direction.

The output includes:

- ROLE / VISUAL FUNCTION
- SOURCE TRUTH
- CAMERA / OPTICS / EXPOSURE
- COMPOSITION / LOOK / MATERIAL
- LIGHT / COLOR
- MOTION / PERFORMANCE
- TEMPORAL / FRAME LOGIC
- CONTINUITY
- TEXT / GRAPHICS
- CONSTRAINTS
- OUTPUT CONTRACT

This structure is intentionally production-oriented rather than adjective-oriented.

## Prompt quality rules

Vision should prefer observable mechanisms over abstract labels.

Bad:

```text
cinematic businessman looking confused, premium lighting
```

Better direction:

```text
decision-maker seated at a real work table with three visually equivalent proposals;
his hand moves toward one proposal, stops before commitment, then returns;
85mm portrait compression; motivated soft side key with controlled negative fill;
one restrained push-in; protect subject identity, scene geography and key-light direction
```

Quality criteria:

- source truth preserved
- observable action
- specific scene mechanism
- clear focal hierarchy
- motivated camera/lens
- motivated lighting
- physically plausible motion
- continuity
- constraints
- output contract

## Image vs video vs XRoll

### Image

One decisive frame. Motion directions should not be added merely because the catalog contains motion options.

### Video

One coherent temporal unit should prefer:

- one primary camera move
- one readable subject action
- physically plausible environment motion
- stable identity/geometry
- clear end state

### XRoll

XRoll direction must be layer-aware:

- background
- midground
- hero subject/object
- foreground
- graphics/text layer where useful

Layers only exist when they perform a narrative/explanatory function. Parallax should communicate depth rather than decorate the frame.

## Visual references / Playground

The V2.5 Playground uses one reference scene to compare decisions A/B.

It is designed to answer:

- what changes?
- how does it feel?
- when should I use it?
- when should I avoid it?
- what exact prompt language corresponds to it?

2D/CSS focal comparisons are explicitly educational approximations. True camera re-projection requires scene/depth information and should move to WebGL/Three.js only when depth/layer data exists.

## AI Copilot

Copilot is not the owner of project state.

```text
User request
   ↓
LLM reasoning
   ↓
validated structured proposal
   ↓
UI shows patch
   ↓
user Apply
   ↓
project state changes
```

V2.5 structured actions include exact catalog IDs. Invalid options are filtered before they reach state.

Copilot never launches generation or spend.

## Provider architecture

Roles are independent:

```text
Assistant
Analyzer
Image Generator
Video Generator
Local Workflow Provider
```

One project can use different providers for each role.

Built-in routes include NVIDIA/Gemini and local/CLI integrations. Custom providers can be defined as OpenAI-compatible, Anthropic-compatible or Generic REST.

Security policy:

- no master secret in committed frontend code
- no persistent public-PWA master key in localStorage
- custom browser BYOK defaults to session-only
- persistent PWA credentials use a server-side gateway/secret manager
- generic REST generation is not enabled until a request/response adapter is explicitly implemented and tested

## PWA / Tauri split

The same frontend/core is shared.

PWA can perform reliable browser/cloud-safe functions:

- Director
- prompt compilation
- presets
- Prompt Anatomy
- Fichas
- XRoll planning
- Storyboard / Carousel
- cloud Copilot when gateway/provider is configured

Desktop adds native capabilities:

- Keychain
- filesystem
- process spawn
- FFmpeg
- Gemini CLI
- Higgsfield CLI
- ComfyUI localhost
- local MCP/runtime

## MCP

MCP uses application/core services, not click automation.

General server:

`apps/vision/mcp/server.ts`

Director V2.5 server:

`apps/vision/mcp/director-server.ts`

Professional compiler:

`apps/vision/mcp/professional-server.ts`

Director server is intentionally non-generative so Claude Code/Codex can direct and compile safely without accidental spend.

## Preserved modules

V2.5 must not regress:

- Ficha Intake
- XRoll Studio
- Storyboard
- Carousel
- Content Bridge
- Analyzer
- provider registry
- target compilers
- Firebase gateway
- legacy V2 professional tools
- PWA/offline core
- Tauri desktop
- CLI/MCP

## Release gates

The release is considered stable only after:

```bash
npm run vision:typecheck
npm run vision:smoke
npm run vision:v2:smoke
npm run vision:v25:smoke
npm run vision:assistant:smoke
npm run vision:mcp:smoke
npm run vision:director:mcp:smoke
npm run vision:pro:mcp:smoke
npm run vision:build
npm run vision:desktop:check
npm run vision:desktop:build
```

and GitHub Pages + release artifact complete successfully.

## Status vocabulary

When documenting provider/features, use:

- **implemented and validated**
- **prepared but not connected**
- **planned**

Do not turn UI presence into a false claim of runtime capability.
