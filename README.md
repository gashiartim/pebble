# Pebble

> Menu-bar text-polish tool that rewrites your clipboard with a local Ollama model. One global shortcut, seven presets, zero cloud.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Electron](https://img.shields.io/badge/Electron-39-47848F)](https://www.electronjs.org/)
[![Ollama](https://img.shields.io/badge/Ollama-required-000)](https://ollama.com)
[![Platform](https://img.shields.io/badge/macOS%20%7C%20Windows%20%7C%20Linux-supported-blue)]()

Pebble lives in your menu bar. Press **Cmd+Alt+P** anywhere on your machine and whatever's on your clipboard gets rewritten by a local LLM — fix grammar, make it concise, formalize for an email, convert to bullets, or sharpen a vague prompt before sending it to an LLM. Polished text replaces the clipboard. `Cmd+V` to paste.

Nothing leaves your machine. No accounts, no telemetry, no cloud API.

---

## Features

- 🪨 **One global shortcut** — `Cmd+Alt+P` (configurable). Works in any app.
- 🎛 **Preset dropdown** — Polish, Concise, Formal, Friendly, Fix typos, Bullets, Prompt enhance. Last selection persists across sessions and is what the global shortcut uses.
- 🔒 **100% local** — talks only to Ollama on `127.0.0.1`. No cloud fallback.
- 🍎 **Menu-bar only** — no dock icon, no main window. Hides on blur.
- 🌍 **Cross-platform** — macOS (primary), Windows, Linux.
- 🧱 **Tiny code surface** — Electron + React + ~600 lines of TypeScript. Easy to fork and modify.

## Requirements

- Node.js **20+**
- [Ollama](https://ollama.com) running locally
- A chat-capable Ollama model (default: `qwen3-coder:30b`)

## Install (from source)

```bash
git clone https://github.com/gashiartim/pebble.git
cd pebble
npm install
cp .env.example .env

# Pull a model — default is qwen3-coder:30b
ollama pull qwen3-coder:30b

npm run dev
```

## Build a distributable

```bash
npm run build:mac      # → dist/Pebble-1.0.0.dmg
npm run build:win      # → dist/Pebble-1.0.0-setup.exe
npm run build:linux    # → dist/Pebble-1.0.0.AppImage
```

The `.dmg` is unsigned (no Apple Developer ID). Personal-install on macOS:

```bash
ditto dist/mac-arm64/Pebble.app /Applications/Pebble.app
xattr -cr /Applications/Pebble.app
codesign --force --deep --sign - /Applications/Pebble.app
open /Applications/Pebble.app
```

The `codesign` step is required on macOS 15+ — without it the embedded Electron Framework's ad-hoc signature mismatches the main binary's and the app refuses to launch (`Library not loaded ... different Team IDs`).

## Configuration

All env vars are optional — Pebble has sane defaults baked in. Override in `.env`:

```env
OLLAMA_HOST=http://127.0.0.1:11434          # default
POLISH_MODEL=qwen3-coder:30b                # any chat-capable Ollama model
PEBBLE_POLISH_SHORTCUT=CommandOrControl+Alt+P
```

### Recommended models

| Model | Size | Quality | Speed (M-series) |
|-------|------|---------|------------------|
| `qwen3-coder:30b` | 18 GB | Best (default) | Fast |
| `qwen2.5:14b` | 9 GB | Very good | Faster |
| `llama3.1:8b` | 5 GB | Good | Fastest |
| `gemma4:latest` (8B) | 9.6 GB | Good | Fast |

Smaller models still work for short messages but lose nuance on longer rewrites and on the **Prompt enhance** preset (which depends on instruction-following discipline).

## Usage

### Global shortcut (the way most people use it)

1. Copy text in any app (`Cmd+C`).
2. Press **`Cmd+Alt+P`**.
3. Wait ~1–3 seconds for the "✅ Polished" notification.
4. Paste with `Cmd+V`.

The shortcut uses whichever preset you last picked in the panel.

### Panel UI

Click the menu-bar icon to open the panel. Pick a preset from the dropdown, paste text in the textarea, hit **`⌘↵`** (or click the button). The polished result replaces the textarea content and is auto-copied to your clipboard.

### Presets

| Preset | What it does |
|--------|-------------|
| **Polish** | Clean grammar and style, keep tone |
| **Concise** | Same meaning, fewer words |
| **Formal** | Business / client-facing email tone |
| **Friendly** | Casual, warm — Slack / team |
| **Fix typos only** | Minimal change, preserves voice |
| **Bullets** | Rewrite as a bullet list |
| **Prompt enhance** | Sharpen a vague LLM prompt |

Adding your own preset is one append to `src/main/presets.ts` — see [CONTRIBUTING.md](CONTRIBUTING.md).

## Architecture

| File | Purpose |
|------|---------|
| `src/main/index.ts` | Electron main: tray, panel window, IPC, global shortcut, notifications. |
| `src/main/polish.ts` | Ollama chat call with the selected preset's system prompt. |
| `src/main/presets.ts` | Preset definitions. Single array — first entry is the default. |
| `src/preload/index.ts` | Bridge: `window.pebble.{polish, getPresets, quit}`. |
| `src/renderer/src/Polish.tsx` | Preset dropdown + textarea + button. |

## Contributing

PRs welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) for the bar and the no-go list (no cloud LLMs, no Tailwind, no telemetry, etc.).

By contributing you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## Security

See [SECURITY.md](SECURITY.md) for vulnerability reporting.

## License

[MIT](LICENSE) — do whatever you want with it, just keep the copyright notice.
