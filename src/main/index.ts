/**
 * Steam Uploader — Electron main process entry point.
 *
 * Created by Lumiric Studio. MIT licensed.
 *
 * Responsibilities:
 *   - Create and own the application window
 *   - Wire IPC handlers (see ./ipc/handlers.ts)
 *   - Apply security defaults to every renderer window
 */

import { app, BrowserWindow, shell, screen } from 'electron'
import path from 'node:path'
import { is } from '@electron-toolkit/utils'

import { registerIpcHandlers } from './ipc/handlers'

const WINDOW_WIDTH = 960
const WINDOW_HEIGHT = 700

let mainWindow: BrowserWindow | null = null

function createMainWindow(): BrowserWindow {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize

  const window = new BrowserWindow({
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    minWidth: 800,
    minHeight: 600,
    x: Math.round((width - WINDOW_WIDTH) / 2),
    y: Math.round((height - WINDOW_HEIGHT) / 2),
    show: true,
    autoHideMenuBar: true,
    title: 'Steam Uploader',
    backgroundColor: '#0f0f0f',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
      allowRunningInsecureContent: false
    }
  })

  // Open external links in the user's default browser rather than a new
  // Electron window — keeps the renderer isolated from arbitrary navigation.
  window.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  window.webContents.on('will-navigate', (event, url) => {
    const allowed = url.startsWith('http://localhost') || url.startsWith('file://')
    if (!allowed) event.preventDefault()
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    window.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    window.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  return window
}

app.whenReady().then(() => {
  registerIpcHandlers({ getMainWindow: () => mainWindow })
  mainWindow = createMainWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createMainWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
