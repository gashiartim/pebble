import 'dotenv/config'
import {
  app,
  shell,
  BrowserWindow,
  ipcMain,
  screen,
  clipboard,
  globalShortcut,
  Notification,
  Tray,
  Menu,
  nativeImage
} from 'electron'
import { join } from 'path'
import { electronApp, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { polishMessage } from './polish'
import { POLISH_PRESETS } from './presets'

let panelWindow: BrowserWindow | null = null
let tray: Tray | null = null

// Last-used preset, updated by the renderer. The global shortcut reads
// this so Cmd+Opt+P uses whatever preset you picked last.
let lastPresetKey: string = POLISH_PRESETS[0].key

function createPanelWindow(): void {
  const { workArea } = screen.getPrimaryDisplay()
  const width = 360
  const height = 300
  panelWindow = new BrowserWindow({
    width,
    height,
    x: workArea.x + workArea.width - width - 24,
    y: workArea.y + 24,
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    show: false,
    hasShadow: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  panelWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })

  // Hide on blur so the panel disappears the moment user clicks elsewhere.
  panelWindow.on('blur', () => panelWindow?.hide())
  panelWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  const url =
    is.dev && process.env['ELECTRON_RENDERER_URL']
      ? process.env['ELECTRON_RENDERER_URL']
      : `file://${join(__dirname, '../renderer/index.html')}`
  panelWindow.loadURL(url)
}

function togglePanel(): void {
  if (!panelWindow) return
  if (panelWindow.isVisible()) {
    panelWindow.hide()
  } else {
    // Re-position to top-right of current display in case user moved displays.
    const cursor = screen.getCursorScreenPoint()
    const display = screen.getDisplayNearestPoint(cursor)
    const [w, h] = panelWindow.getSize()
    panelWindow.setBounds({
      x: display.workArea.x + display.workArea.width - w - 24,
      y: display.workArea.y + 24,
      width: w,
      height: h
    })
    panelWindow.show()
    panelWindow.focus()
  }
}

function createTray(): void {
  const image = nativeImage.createFromPath(icon).resize({ width: 18, height: 18 })
  image.setTemplateImage(true)
  tray = new Tray(image)
  tray.setToolTip('Pebble — Cmd+Opt+P to polish clipboard')

  const menu = Menu.buildFromTemplate([
    {
      label: 'Polish clipboard',
      accelerator: 'CommandOrControl+Alt+P',
      click: () => runGlobalPolish()
    },
    { type: 'separator' },
    { label: 'Show panel', click: () => panelWindow?.show() },
    { type: 'separator' },
    { label: 'Quit Pebble', click: () => app.quit() }
  ])
  tray.setContextMenu(menu)
  tray.on('click', () => togglePanel())
}

function registerIpc(): void {
  ipcMain.handle('pebble:quit', () => app.quit())

  ipcMain.handle(
    'pebble:polish',
    async (_e, args: { rawText: string; presetKey?: string }) => {
      if (args.presetKey) lastPresetKey = args.presetKey
      const polished = await polishMessage(args.rawText, args.presetKey)
      if (polished) clipboard.writeText(polished)
      return polished
    }
  )

  ipcMain.handle('pebble:get-presets', () => POLISH_PRESETS)
}

function notify(title: string, body: string): void {
  if (!Notification.isSupported()) return
  new Notification({ title, body, silent: true }).show()
}

/**
 * Global polish shortcut: read clipboard, run through the local model,
 * write the polished text back. Default Cmd+Opt+P. Override with
 * PEBBLE_POLISH_SHORTCUT env (Electron Accelerator format).
 */
async function runGlobalPolish(): Promise<void> {
  const raw = clipboard.readText()
  if (!raw.trim()) {
    notify('Pebble — nothing to polish', 'Copy some text first (Cmd+C), then press the shortcut again.')
    return
  }
  notify('Pebble', `Polishing… (${lastPresetKey})`)
  try {
    const polished = await polishMessage(raw, lastPresetKey)
    if (polished) {
      clipboard.writeText(polished)
      notify('✅ Polished', 'New text is on your clipboard. Paste with Cmd+V.')
    } else {
      notify('Pebble', 'No output produced.')
    }
  } catch (e) {
    notify('Pebble — error', e instanceof Error ? e.message : String(e))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.pebble.helper')

  // Menu-bar-only on macOS: no dock icon, no app menu in the system bar.
  if (process.platform === 'darwin') {
    app.setActivationPolicy('accessory')
  }

  registerIpc()
  createPanelWindow()
  createTray()

  const shortcut = process.env.PEBBLE_POLISH_SHORTCUT || 'CommandOrControl+Alt+P'
  const ok = globalShortcut.register(shortcut, runGlobalPolish)
  if (!ok) {
    console.warn(`[pebble] Could not register global shortcut "${shortcut}" — already in use by another app?`)
  } else {
    console.log(`[pebble] Polish shortcut: ${shortcut}`)
  }

  app.on('activate', () => {
    if (!panelWindow) createPanelWindow()
  })
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

// We live in the menu bar; never auto-quit.
app.on('window-all-closed', () => {
  // intentionally empty — quit only via tray menu.
})
