/**
 * Preload script.
 *
 * Bridges renderer ↔ main IPC through a contextIsolated `window.api`
 * object. The shape exposed here MUST match `ElectronAPI` in
 * `src/shared/api.ts` — the renderer consumes that contract.
 */

import { contextBridge, ipcRenderer } from 'electron'
import type { ElectronAPI } from '../shared/api'
import type {
  AppConfig,
  FileFilter,
  UploadRequest
} from '../shared/types'

const api: ElectronAPI = {
  config: {
    get: () => ipcRenderer.invoke('config:get'),
    save: (config: AppConfig) => ipcRenderer.invoke('config:save', config)
  },

  steam: {
    lookupApp: (appId: string) => ipcRenderer.invoke('steam:lookup-app', appId),
    upload: (request: UploadRequest) => ipcRenderer.invoke('steam:upload', request),
    onUploadLog: (callback) => {
      const listener = (_event: Electron.IpcRendererEvent, line: string): void => callback(line)
      ipcRenderer.on('steam:upload-log', listener)
      return () => ipcRenderer.removeListener('steam:upload-log', listener)
    }
  },

  sdk: {
    getInfo: () => ipcRenderer.invoke('sdk:get-info'),
    checkForUpdates: () => ipcRenderer.invoke('sdk:check-updates')
  },

  dialog: {
    selectFolder: () => ipcRenderer.invoke('dialog:select-folder'),
    selectFile: (filters?: FileFilter[]) => ipcRenderer.invoke('dialog:select-file', filters)
  },

  app: {
    getBuildInfo: () => ipcRenderer.invoke('app:get-build-info')
  }
}

if (process.contextIsolated) {
  contextBridge.exposeInMainWorld('api', api)
} else {
  // Fallback for cases where contextIsolation is disabled (should not happen).
  ;(window as unknown as { api: ElectronAPI }).api = api
}
