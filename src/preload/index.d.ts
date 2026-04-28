export interface PolishPresetSummary {
  key: string
  label: string
  description: string
}

declare global {
  interface Window {
    pebble: {
      quit: () => Promise<void>
      polish: (rawText: string, presetKey?: string) => Promise<string>
      getPresets: () => Promise<PolishPresetSummary[]>
    }
  }
}

export {}
