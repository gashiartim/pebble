# Changelog

All notable changes to Pebble are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project adheres to [Semantic Versioning](https://semver.org/).

## [1.1.0] — 2026-04-29

### Added

- **Translate preset (EN ↔ SQ)** — auto-detects source language and translates between English and Albanian. Aware of Albanian diacritics (ë, ç) and standard Albanian register.

### Changed

- All presets now preserve the input language strictly. Pasting Albanian no longer drifts toward English. Diacritics are preserved exactly.

## [1.0.1] — 2026-04-29

### Fixed

- Pebble no longer appears in the macOS Cmd+Tab application switcher or the dock. `LSUIElement: true` is now baked into `Info.plist` at build time; the runtime `setActivationPolicy('accessory')` call alone applied too late and let the app slip into the switcher on launch.

## [1.0.0] — 2026-04-28

First public release.

### Added

- Menu-bar-only macOS app (no dock icon).
- Floating panel anchored top-right with a single Polish surface.
- Preset dropdown with seven presets: Polish, Concise, Formal, Friendly, Fix typos only, Bullets, Prompt enhance.
- Last-selected preset persisted to renderer localStorage.
- Global shortcut (default `Cmd+Alt+P`) — reads clipboard, runs current preset, writes polished text back, fires native notification.
- Local-only LLM via Ollama HTTP. Default model `qwen3-coder:30b`; configurable via `POLISH_MODEL`.
- Configurable Ollama host via `OLLAMA_HOST`.
- Configurable shortcut via `PEBBLE_POLISH_SHORTCUT`.
- macOS, Windows, and Linux build targets via electron-builder.
