# Pebble — Agent Instructions

<!-- Single source of truth for AI coding agents. CLAUDE.md is a symlink. -->

## Overview

Pebble is a **personal text-polish tool**. Menu-bar-only macOS Electron app. Press a global shortcut → clipboard text gets rewritten by a local LLM (Ollama) → polished version is back on the clipboard. The user picks a preset (Polish / Concise / Formal / Friendly / Fix typos / Bullets / Prompt enhance).

This is single-user software. No cloud, no telemetry, no auth, no users besides the engineer running it.

## Architecture

- **Framework:** Electron 39 + Vite 7 + React 19 + TypeScript.
- **One window:** small frameless always-on-top panel anchored top-right of the active display, hides on blur.
- **Tray icon** in the macOS menu bar — click to toggle panel, right-click for menu.
- **Global shortcut** (default `Cmd+Alt+P`, override via `PEBBLE_POLISH_SHORTCUT`): reads clipboard → runs current preset → writes polished text back → native notification.
- **Provider:** Ollama HTTP at `127.0.0.1:11434`, default model `qwen3-coder:30b` (override via `POLISH_MODEL`). No cloud fallback.
- **No screen capture, no vision, no TTS, no overlays.** All of that was removed when the project pivoted from "AI buddy for elders" to a personal polish tool.

## Key Files

| File | Purpose |
|------|---------|
| `src/main/index.ts` | Tray, panel window, IPC handlers, global shortcut, notifications. |
| `src/main/polish.ts` | Ollama chat call. Pulls system prompt from the selected preset. |
| `src/main/presets.ts` | Preset definitions. Single array of `{key, label, description, systemPrompt}`. First entry is the default. |
| `src/preload/index.ts` | Bridge: `window.pebble.{polish, getPresets, quit}`. |
| `src/renderer/src/App.tsx` | Renders the panel shell + Polish component + footer. |
| `src/renderer/src/Polish.tsx` | Preset dropdown, textarea, polish button. Persists last preset to localStorage. |
| `src/renderer/src/assets/main.css` | All styles, vanilla CSS. |

## Build & Run

```bash
npm install
cp .env.example .env
npm run dev
npm run typecheck
npm run build:mac          # dist/pebble-1.0.0.dmg + dist/mac-arm64/pebble.app
```

Install (personal, unsigned):

```bash
killall pebble 2>/dev/null
rm -rf /Applications/pebble.app
ditto dist/mac-arm64/pebble.app /Applications/pebble.app
xattr -cr /Applications/pebble.app
codesign --force --deep --sign - /Applications/pebble.app
open /Applications/pebble.app
```

The codesign re-ad-hoc step is mandatory; without it macOS 15+ refuses to launch (`Library not loaded ... different Team IDs`).

## Conventions

- TypeScript strict. No `any` unless documented.
- Names: clarity > concision. `presetKey`, not `pk`.
- Comments explain *why*, not *what*. Mark non-obvious bridges (`setActivationPolicy('accessory')`, `setIgnoreMouseEvents`, etc.).
- Vanilla CSS in v1. No Tailwind/shadcn — the surface is too small to justify it.
- Renderer must only call `window.pebble.*`. Never import `electron` from renderer.
- Adding a preset = append to the `POLISH_PRESETS` array. The dropdown renders from that array via IPC; no UI changes needed.

## Adding a preset

```ts
// src/main/presets.ts
{
  key: 'unique-stable-key',     // persisted in localStorage; never rename
  label: 'Short label',          // shown on the button
  description: 'One-line hint',  // shown in dropdown
  systemPrompt: `...`            // include BASE_RULES at the end
}
```

That's it. No renderer or IPC changes.

## Do NOT

- Do not re-introduce screen capture, vision, TTS, or cursor overlays. They were removed deliberately.
- Do not add cloud providers (Gemini, Anthropic, OpenAI). The whole point is local + private.
- Do not run `npm run dev` from agent code — it spawns a window the user must interact with.
- Do not commit `.env`.
- Do not use `gemini-2.5-pro` or any other paid model. We're Ollama-only.

## Self-Update

When changes affect architecture, key files, build flow, or conventions, update this file. Skip updates for trivial fixes.
