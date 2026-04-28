# Security Policy

## Supported versions

Pebble is a single-user local tool with no server, no auth, and no remote attack surface. The only "supported" version is the latest commit on `main`. Older releases are not patched.

## Reporting a vulnerability

If you find a security issue (e.g. a way for a malicious clipboard payload to escape the renderer sandbox, an Ollama-host SSRF, a privilege escalation through the global shortcut, etc.), please **do not open a public GitHub issue**. Email me directly:

**hi@artimgashi.dev**

Include:

1. A clear description of the issue.
2. Steps to reproduce, ideally with a minimal proof of concept.
3. Your assessment of impact (what an attacker could actually do).
4. Whether you'd like to be credited in the fix commit / changelog.

I'll acknowledge within a few days and aim to ship a fix or a documented workaround within two weeks for confirmed issues. For coordinated disclosure, please give me at least 30 days before going public.

## Threat model

Pebble runs entirely on the user's machine and talks only to:

- A local Ollama HTTP endpoint (default `127.0.0.1:11434`).
- The system clipboard (read + write).
- The macOS / Windows / Linux notification system.

It does **not** make outbound network requests, sync state, or call cloud APIs. If you find code in `main` that contradicts this, treat it as a security issue and report it.

The most realistic attack surface is the Ollama endpoint itself: if `OLLAMA_HOST` is set to a remote address, clipboard contents will be sent there in plaintext. Don't do that unless you control the remote host. The default of `127.0.0.1` is safe.
