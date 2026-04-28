import { useEffect, useRef, useState } from 'react'
import type { PolishPresetSummary } from '../../preload'

type Status = 'idle' | 'working' | 'done' | 'error'

const STORAGE_KEY = 'pebble:lastPresetKey'

export default function Polish(): React.JSX.Element {
  const [text, setText] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [presets, setPresets] = useState<PolishPresetSummary[]>([])
  const [presetKey, setPresetKey] = useState<string>(
    () => localStorage.getItem(STORAGE_KEY) || 'default'
  )
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    window.pebble.getPresets().then(setPresets)
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, presetKey)
  }, [presetKey])

  const run = async (): Promise<void> => {
    if (!text.trim() || status === 'working') return
    setStatus('working')
    setErrorMessage('')
    try {
      const polished = await window.pebble.polish(text, presetKey)
      setText(polished)
      setStatus('done')
      setTimeout(() => setStatus('idle'), 1500)
      requestAnimationFrame(() => textareaRef.current?.select())
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : String(e))
      setStatus('error')
    }
  }

  const activePreset = presets.find((p) => p.key === presetKey)

  return (
    <div className="polish-root">
      <div className="preset-row">
        <select
          className="preset-select"
          value={presetKey}
          onChange={(e) => setPresetKey(e.target.value)}
          disabled={status === 'working'}
          title={activePreset?.description}
        >
          {presets.map((p) => (
            <option key={p.key} value={p.key}>
              {p.label} — {p.description}
            </option>
          ))}
        </select>
      </div>
      <textarea
        ref={textareaRef}
        className="polish-textarea"
        placeholder="Paste a message — I'll fix the grammar and clean it up."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') run()
        }}
        disabled={status === 'working'}
      />
      <button
        className={`polish-button ${status}`}
        onClick={run}
        disabled={status === 'working' || !text.trim()}
      >
        {status === 'idle' && `✨  ${activePreset?.label ?? 'Polish'} (⌘↵)`}
        {status === 'working' && '✍️  Polishing…'}
        {status === 'done' && '✅  Copied to clipboard'}
        {status === 'error' && '⚠️  Try again'}
      </button>
      {status === 'error' && <div className="error">{errorMessage}</div>}
    </div>
  )
}
