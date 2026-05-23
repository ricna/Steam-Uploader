/**
 * IPC handler registry.
 *
 * Wires renderer requests to the services that fulfill them. Every
 * input that crosses this boundary is validated; every output is a
 * value typed by the shared API contract.
 */

import { BrowserWindow, dialog, ipcMain } from 'electron'
import path from 'node:path'

import type {
  AppConfig,
  BuildInfo,
  FileFilter,
  SdkInfo,
  SteamAppLookup,
  UploadRequest,
  UploadResult
} from '../../shared/types'

import { loadConfig, saveConfig } from '../services/config-store'
import { lookupApp } from '../services/steam-api'
import { runUpload } from '../services/steamcmd'
import { writeBuildScripts } from '../services/vdf'
import {
  checkForSdkUpdates,
  getSdkInfo,
  resolveSteamcmdPath
} from '../services/sdk-manager'

import {
  validateBranch,
  validatePath,
  validateSteamId,
  validateUsername,
  ValidationError
} from '../lib/validation'

import { APP_VERSION, BUILD_ID, BUILD_DATE } from '../build-info'

interface SetupOptions {
  getMainWindow: () => BrowserWindow | null
}

export function registerIpcHandlers(options: SetupOptions): void {
  const sendLog = (line: string): void => {
    options.getMainWindow()?.webContents.send('steam:upload-log', line)
  }

  ipcMain.handle('config:get', (): AppConfig => loadConfig())

  ipcMain.handle('config:save', (_event, config: AppConfig) => {
    saveConfig(config)
  })

  ipcMain.handle('steam:lookup-app', async (_event, appId: string): Promise<SteamAppLookup> => {
    try {
      const safeId = validateSteamId(appId, 'App ID')
      return await lookupApp(safeId)
    } catch {
      return { success: false }
    }
  })

  ipcMain.handle(
    'steam:upload',
    async (_event, request: UploadRequest): Promise<UploadResult> => {
      try {
        const config = loadConfig()
        const app = config.apps.find((a) => a.appId === request.appId)
        if (!app) throw new ValidationError('Selected app not found in config')

        const username = validateUsername(config.credentials.username)
        const password = config.credentials.password
        if (!password) throw new ValidationError('Steam password is required')

        const branch = validateBranch(request.branch)
        const appId = validateSteamId(app.appId, 'App ID')

        const depots = app.depots.map((depot) => ({
          id: validateSteamId(depot.id, 'Depot ID'),
          contentPath: validatePath(depot.contentPath, 'Content folder')
        }))

        const steamcmdPath = resolveSteamcmdPath(config.steamcmdPathOverride)
        const builderRoot = path.dirname(steamcmdPath)
        const scriptsDir = path.join(builderRoot, '..', 'scripts')
        const outputDir = path.join(builderRoot, '..', 'output')

        const { appVdfPath } = writeBuildScripts({
          appId,
          description: `Steam Uploader build ${BUILD_ID}`,
          outputPath: outputDir,
          branch,
          preview: Boolean(request.preview),
          depots,
          scriptsDir
        })

        sendLog(`[Steam Uploader] Starting upload for ${app.name} (App ${appId})\n`)
        return await runUpload({
          steamcmdPath,
          username,
          password,
          appVdfPath,
          onLog: sendLog
        })
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        sendLog(`[Steam Uploader] ${message}\n`)
        return { success: false, exitCode: null, error: message }
      }
    }
  )

  ipcMain.handle('sdk:get-info', (): SdkInfo => {
    const config = loadConfig()
    return getSdkInfo(config.steamcmdPathOverride)
  })

  ipcMain.handle('sdk:check-updates', async (): Promise<SdkInfo> => {
    const config = loadConfig()
    return checkForSdkUpdates(config.steamcmdPathOverride)
  })

  ipcMain.handle('dialog:select-folder', async (): Promise<string | null> => {
    const result = await dialog.showOpenDialog({ properties: ['openDirectory'] })
    return result.canceled ? null : result.filePaths[0]
  })

  ipcMain.handle(
    'dialog:select-file',
    async (_event, filters?: FileFilter[]): Promise<string | null> => {
      const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: filters ?? [{ name: 'Executables', extensions: ['exe'] }]
      })
      return result.canceled ? null : result.filePaths[0]
    }
  )

  ipcMain.handle('app:get-build-info', (): BuildInfo => ({
    version: APP_VERSION,
    buildId: BUILD_ID,
    buildDate: BUILD_DATE
  }))
}
