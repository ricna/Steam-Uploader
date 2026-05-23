/**
 * Types shared between the main process, preload, and renderer.
 *
 * Keep this file free of runtime imports — it must remain consumable
 * from any context (Node, Electron main, browser renderer).
 */

export interface Depot {
  id: string
  contentPath: string
}

export interface SteamApp {
  appId: string
  name: string
  iconUrl?: string
  depots: Depot[]
}

export interface Credentials {
  username: string
  password: string
}

export interface AppConfig {
  credentials: Credentials
  apps: SteamApp[]
  /** Optional override. When unset, the bundled SteamCMD is used. */
  steamcmdPathOverride?: string
}

export interface BuildInfo {
  version: string
  buildId: string
  buildDate: string
}

export interface SdkInfo {
  /** Resolved path to the steamcmd binary in use (bundled or override). */
  steamcmdPath: string
  /** Whether the binary in use is the bundled one. */
  isBundled: boolean
  /** Parsed SteamCMD version string (e.g. "1747432548"). */
  version: string | null
  /** ISO timestamp of the last successful update check. */
  lastUpdatedAt: string | null
}

export interface UploadRequest {
  appId: string
  branch: string
  preview: boolean
}

export interface UploadResult {
  success: boolean
  exitCode: number | null
  error?: string
}

export interface SteamAppLookup {
  success: boolean
  name?: string
  iconUrl?: string
}

export interface FileFilter {
  name: string
  extensions: string[]
}
