/**
 * Message polish. Sends raw text to a local Ollama text model and returns
 * a rewritten version using the selected preset's system prompt.
 *
 * Default model: qwen3-coder:30b (strong writing on Apple Silicon).
 * Override via POLISH_MODEL env. Host shared with vision via OLLAMA_HOST.
 */

import { getPreset } from './presets'

const DEFAULT_MODEL = 'qwen3-coder:30b'
const HOST = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434'

export async function polishMessage(rawText: string, presetKey?: string): Promise<string> {
  const trimmed = rawText.trim()
  if (!trimmed) return ''

  const model = process.env.POLISH_MODEL || DEFAULT_MODEL
  const preset = getPreset(presetKey)

  const body = {
    model,
    messages: [
      { role: 'system', content: preset.systemPrompt },
      { role: 'user', content: trimmed }
    ],
    stream: false,
    options: { temperature: 0.3 }
  }

  let res: Response
  try {
    res = await fetch(`${HOST}/api/chat`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body)
    })
  } catch (e) {
    throw new Error(
      `Could not reach Ollama at ${HOST}. Is it running? ${e instanceof Error ? e.message : String(e)}`
    )
  }

  if (!res.ok) {
    const errText = await res.text()
    if (res.status === 404 && errText.includes('not found')) {
      throw new Error(`Ollama model "${model}" not pulled. Run: ollama pull ${model}`)
    }
    throw new Error(`Ollama polish error ${res.status}: ${errText}`)
  }

  const data = (await res.json()) as { message?: { content?: string } }
  const out = (data.message?.content ?? '').trim()
  return out
    .replace(/^```(?:[a-z]+)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .replace(/^["'`]+|["'`]+$/g, '')
    .trim()
}
