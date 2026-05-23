/**
 * IPC contract between the renderer and the main process.
 *
 * The preload script exposes an object matching this interface as
 * `window.api`. The renderer should consume it exclusively through
 * the typed `api` helper in `src/renderer/src/lib/api.ts`.
 */

import type {
  AppConfig,
  BuildInfo,
  FileFilter,
  SdkInfo,
  SteamAppLookup,
  UploadRequest,
  UploadResult
} from './types'

export interface ElectronAPI {
  config: {
    get(): Promise<AppConfig>
    save(config: AppConfig): Promise<void>
  }

  steam: {
    lookupApp(appId: string): Promise<SteamAppLookup>
    upload(request: UploadRequest): Promise<UploadResult>
    onUploadLog(callback: (line: string) => void): () => void
  }

  sdk: {
    getInfo(): Promise<SdkInfo>
    checkForUpdates(): Promise<SdkInfo>
  }

  dialog: {
    selectFolder(): Promise<string | null>
    selectFile(filters?: FileFilter[]): Promise<string | null>
  }

  app: {
    getBuildInfo(): Promise<BuildInfo>
  }
}

declare global {
  interface Window {
    api: ElectronAPI
  }
}
