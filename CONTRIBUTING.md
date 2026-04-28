# Contributing to Pebble

Thanks for your interest. Pebble is a small, opinionated personal tool that I'm sharing publicly — happy to take PRs, but the bar is "does this make Pebble better at being a fast local-LLM polish tool" rather than "does this add a feature." Read this whole file before opening anything non-trivial.

## Quick start

```bash
git clone https://github.com/<your-fork>/pebble.git
cd pebble
npm install
cp .env.example .env       # adjust model / shortcut / host if you want
npm run dev
```

You'll need:

- Node.js 20+
- [Ollama](https://ollama.com) running on `127.0.0.1:11434`
- A chat-capable Ollama model pulled (default `qwen3-coder:30b`; lighter alternatives in the README)

## Before you open a PR

1. `npm run typecheck` — must pass.
2. `npm run lint` — must pass.
3. Run the app locally and verify the change with the **exact preset / shortcut path** you touched. Type-clean code with broken UX is not a contribution.
4. Keep the diff small and the commit history clean. One concern per PR.

## Code style

- TypeScript strict, no `any` unless the comment explains why.
- Names: clarity > concision. `presetKey`, not `pk`. `userQuestion`, not `q`.
- Comments explain **why**, not **what**. Don't restate the code.
- Vanilla CSS in `src/renderer/src/assets/main.css`. No Tailwind, no shadcn, no styled-components — the surface is too small to justify a system.
- The renderer talks to the main process **only** through `window.pebble.*`. Don't import `electron` from the renderer.

## Adding a preset

This is the easiest way to contribute. Append an entry to `POLISH_PRESETS` in `src/main/presets.ts`:

```ts
{
  key: 'unique-stable-key',     // persisted in localStorage; never rename
  label: 'Short label',
  description: 'One-line hint',
  systemPrompt: `... ${BASE_RULES}`,
}
```

The dropdown renders from this array via IPC; no UI or preload changes needed.

Quality bar for a preset prompt:

- Preserves the user's intent — never invents constraints, examples, or audiences.
- Output discipline — instructs the model to emit only the rewritten text, no preamble or markdown fences.
- Stays under ~400 tokens so smaller local models can follow it reliably.
- Tested end-to-end with at least `qwen3-coder:30b` (or whatever you have). Show input → output examples in the PR description.

## What's likely to be rejected

- Cloud LLM providers (Gemini, OpenAI, Anthropic). Pebble is local-only by design.
- Re-introduction of screen capture, vision, TTS, or cursor overlays. They were removed deliberately — see git history.
- Big UI frameworks (Tailwind, shadcn, Radix, Chakra). The whole UI is one panel; vanilla CSS handles it.
- Telemetry, analytics, auto-update, or anything that phones home.
- "AI buddy / agent / chat" features. This is a polish tool, not a chatbot.

## What's welcome

- New presets (with input/output examples).
- Better preset prompts that survive evals on multiple local models.
- Cross-platform fixes (Windows/Linux are best-effort right now; PRs that improve them are great).
- Smaller bundle size, faster startup, better tray UX.
- Documentation improvements.
- Bug fixes with a clear repro.

## Reporting bugs

Open an issue with:

1. macOS / Windows / Linux version.
2. Ollama version (`ollama --version`) and the model you used.
3. Exact steps to reproduce.
4. Terminal output if there's an error.

## Reporting security issues

Don't open a public issue — see [SECURITY.md](SECURITY.md).
