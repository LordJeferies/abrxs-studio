# Legacy source migration map

Abrxs Studio does not vendor all legacy applications wholesale. Existing engines are audited and moved behind explicit adapters.

## First-party ABRXS sources

| Source | What to preserve | Target |
|---|---|---|
| `LordJeferies/Abrxs_os_v1` | Canon, Brand Builder logic, Content Builder routing, Geómetra kernel concepts, Lienzo semantics | Brand, Content, Fichas, Geómetra, Contracts |
| `LordJeferies/Abrxs-Canter` | media handling, word-level transcript, alignment, source truth, cut/export engine, queues/jobs | Canter |
| `LordJeferies/editorial-os` | content grid, states, scheduling, responsive planning concepts | Editorial |
| `LordJeferies/editorial-emulator` | Board/Timeline/Agenda, flexible week, content library, drag/drop, scenario planning | Editorial |

## Migration method

```text
legacy code
  ↓ audit
extract domain behavior
  ↓
legacy adapter
  ↓
versioned Abrxs contract
  ↓
new workspace UI
```

No legacy runtime is loaded inside the new application just to reuse a feature.

## External references

External open-source projects are references or selectively reused only after license review. Each actual code adaptation must be recorded with source path, license and reason. Architecture ideas alone do not require vendoring code.

Relevant families already identified include VideoFlow, Diffusion Studio, Vibe Workflow, MoneyPrinterTurbo, Higgsfield prompt skills, OpenChatCut, CutScript, OpusClip video tools, yft-design and others documented during product research.
