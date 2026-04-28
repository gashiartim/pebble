import { contextBridge, ipcRenderer } from 'electron'

export interface PolishPresetSummary {
  key: string
  label: string
  description: string
}

const pebble = {
  quit: () => ipcRenderer.invoke('pebble:quit'),
  polish: (rawText: string, presetKey?: string) =>
    ipcRenderer.invoke('pebble:polish', { rawText, presetKey }) as Promise<string>,
  getPresets: () => ipcRenderer.invoke('pebble:get-presets') as Promise<PolishPresetSummary[]>
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('pebble', pebble)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore
  window.pebble = pebble
}
