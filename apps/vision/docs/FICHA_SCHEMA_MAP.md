# Vision V2 · Ficha Schema Map

This document records the **structural patterns** observed in the JOC Story Editor examples used to design Vision V2 Ficha Intake. The original production content is not copied into this public repository.

## Why this map exists

Vision must improve the prompt that belongs to the correct production unit. It must not flatten a ficha into one generic prompt or overwrite editorial/source-truth fields.

The imported HTML is treated as a container around canonical JSON. Vision does not execute the imported JavaScript/HTML.

## Family A · Story Editor R5

Observed structure:

```text
HTML
└── <script type="application/json" id="seed">
    └── root
        ├── schema
        ├── collection
        ├── pieces[]
        │   ├── title / thesis / objective / scene / visual_system
        │   ├── cover
        │   │   └── prompt_override
        │   └── parts[]
        │       ├── role / text / visual / composition / continuity
        │       ├── prompt_override
        │       └── assets[]
        │           ├── category / family / description / purpose
        │           ├── state_a / state_b / motion / sound
        │           └── prompt_override
        └── standards / analysis / other editorial metadata
```

The Story Editor UI already separates:

- Ficha;
- Visual;
- Imagen;
- Montaje;
- Audio;
- Copy;
- Editar.

The image/asset inspector exposes the current prompt and prompt override fields. Vision V2 therefore treats these paths as prompt slots rather than trying to generate one replacement prompt for the entire HTML.

## Family B · Story Editor R10.1

Observed structure:

```text
HTML
└── <script type="application/json" id="app-data">
    └── DATA
        ├── schemaVersion
        ├── projectId
        └── pieces[]
            ├── cover
            │   └── prompt
            ├── staticProduction.items[]
            │   └── visual
            │       ├── prompt
            │       ├── promptNoText
            │       └── promptWithText
            └── timeline / events / XR / B-roll
                └── asset
                    ├── prompt
                    ├── promptNoText
                    └── promptWithText
```

The R10.1 editor uses `promptNoText` as the principal generation prompt for many assets and keeps `promptWithText` as a separate composition path where applicable.

Batch exports gather multiple independent assets and explicitly request separate output files rather than a collage/contact sheet. Vision must preserve this contract.

## Common prompt-bearing keys

Vision V2 currently scans recursively for:

```text
prompt
prompt_override
promptNoText
promptWithText
compositionPrompt
```

The recursive approach matters because prompt-bearing objects can live in parts, assets, cover objects, static productions, carousels or nested XR structures.

## Context captured for every prompt slot

Vision attempts to attach nearby structured context without changing it:

```text
title / headline / label
thesis
objective / standard_requirement / intention
role / function / category / family / xrFamily
visual / shortDescription
description
composition / layout
continuity
purpose / visual_function
visual_system
```

This context is shown next to the prompt so the user can understand **what the prompt belongs to** before improving it.

## Patch rule

The core safe operation is:

```text
original prompt field
       ↓
Vision candidate
       ↓
manual review/edit
       ↓
stage FichaPromptPatch
       ↓
export new file
```

A patch contains:

```json
{
  "slotId": "pieces/3/parts/4/assets/0/prompt_override",
  "before": "original prompt",
  "after": "approved Vision prompt"
}
```

For HTML, the exporter serializes the updated canonical JSON back into the same JSON script block while preserving the rest of the HTML canvas.

## What Vision must not change during prompt-only mode

Unless the user explicitly chooses a wider production rebuild, prompt-only mode must not alter:

- title;
- thesis;
- source truth;
- transcript/source ranges;
- exact approved copy;
- CTA/resource content;
- editorial status;
- timestamps;
- asset IDs;
- route IDs;
- motion/sound timing;
- inclusion/selection state;
- HTML application code.

## XRoll relationship

Existing XR objects may already provide:

- family;
- purpose;
- state A;
- state B;
- motion;
- SFX/sound plan;
- duration/offset;
- asset IDs;
- visual function;
- acceptance criteria;
- one or more image prompts.

Vision should **enrich** that structure. If the imported XR already has states/timing, the XRoll Studio must treat them as locks/defaults instead of replacing them with a generic animation.

Future bridge operation:

```text
Imported XR object
      ↓
Convert/Open in XRoll Studio
      ↓
choose layer plan / preset / target
      ↓
compile master + per-layer prompts
      ↓
write approved prompt fields back to the same XR/asset slots
```

## Versioning

The parser is intentionally schema-tolerant, but support is still explicit. New Story Editor schemas should be added to fixtures/smoke tests before claiming round-trip compatibility.
