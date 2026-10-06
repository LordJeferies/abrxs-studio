# Abrxs Studio platform targets

## Primary product target: Desktop

Abrxs Studio is Desktop-first. The macOS/Windows desktop application is the canonical production environment because the most demanding workspaces need local files, FFmpeg, Whisper, native dialogs, large media, local caching, hardware acceleration, Keychain/credential storage and long-running background jobs.

Desktop must package its frontend locally. It must never require GitHub Pages or a remote web shell in order to launch.

## Web/PWA target: adapted companion, full where practical

The web/PWA uses the same domain contracts, design system and application services where safe, but exposes only capabilities that are reliable in a browser. A workspace can be fully available on web when it does not depend on privileged local media or unsafe secret handling.

### Expected platform coverage

| Workspace | Desktop | Web/PWA |
| --- | --- | --- |
| Home / Projects | Full | Full |
| Brand Builder | Full | Full |
| Content Builder | Full | Full |
| Ficha Studio | Full | Full |
| Editorial | Full | Full |
| Geómetra library / validation / planning | Full | Full or near-full |
| Lienzos | Full | Full when assets are browser-accessible |
| Canter | Full local engine | Review / light operations / remote-job control |
| Vision Prompt Director | Full | Full |
| Vision Carousel Studio | Full | Full for prompt/layout/generation through safe providers |
| Vision local providers / heavy generation | Full | Capability-dependent |
| Dresser captions / review / light edits | Full | Partial-to-full where browser media APIs are sufficient |
| Dresser full multitrack / local render | Full | Adapted |
| Review | Full | Full |
| Publisher | Full | Full |
| MCP / local automation | Full | Server-backed only |
| Doctor | Full machine diagnostics | Browser capability diagnostics |

## Capability-driven UX

The UI must not pretend every target has the same capabilities. Features are resolved through a capability layer, for example:

```ts
interface RuntimeCapabilities {
  platform: 'desktop' | 'web' | 'pwa';
  localFilesystem: boolean;
  ffmpeg: boolean;
  whisper: boolean;
  nativeSecrets: boolean;
  localRender: boolean;
  backgroundJobs: boolean;
  webCodecs: boolean;
}
```

A missing capability changes the available action or hands work off to Desktop; it does not create a second project model.

## Stability principles

1. Desktop is the reference environment for production-critical media work.
2. Web/PWA is not a remote wrapper around Desktop and Desktop is not a wrapper around a hosted page.
3. Both targets share contracts, domain logic and reusable UI components.
4. Native services live behind application-service interfaces.
5. Secrets stay in native secure storage on Desktop or in a trusted backend for web.
6. Heavy local media operations never depend on Service Workers.
7. Web can be richer over time without forcing browser constraints onto the Desktop architecture.
