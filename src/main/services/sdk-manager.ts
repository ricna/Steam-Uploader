/**
 * SDK Manager — resolves the path to SteamCMD and tracks its version.
 *
 * Steam Uploader ships the SteamCMD binary plus the ContentBuilder
 * tools as part of its distribution (see resources/steam-sdk/). On
 * each launch SteamCMD checks Valve's servers for updates and refreshes
 * itself, so the bundled copy stays current without any work from us.
 */

import { app } from 'electron'
import fs from 'node:fs'
import path from 'node:path'
import { spawn } from 'node:child_process'

const STEAMCMD_BINARY = process.platform === 'win32' ? 'steamcmd.exe' : 'steamcmd.sh'
const SDK_RESOURCE_DIR = 'steam-sdk'

export interface SdkInfo {
  steamcmdPath: string
  isBundled: boolean
  version: string | null
  lastUpdatedAt: string | null
}

interface CachedVersion {
  version: string
  lastUpdatedAt: string
}

let cached: CachedVersion | null = null

/**
 * Resolves the path to the bundled SteamCMD binary. Falls back to a
 * dev-mode path that points at the SDK living next to the project when
 * the resources directory has not been populated yet.
 */
export function getBundledSteamcmdPath(): string {
  const resourcesRoot = app.isPackaged
    ? path.join(process.resourcesPath, SDK_RESOURCE_DIR)
    : path.join(app.getAppPath(), 'resources', SDK_RESOURCE_DIR)

  const bundlerSubdir = path.join(resourcesRoot, 'builder')
  return path.join(bundlerSubdir, STEAMCMD_BINARY)
}

export function resolveSteamcmdPath(override?: string): string {
  if (override && fs.existsSync(override)) return override
  return getBundledSteamcmdPath()
}

export function getSdkInfo(override?: string): SdkInfo {
  const steamcmdPath = resolveSteamcmdPath(override)
  return {
    steamcmdPath,
    isBundled: !override || !fs.existsSync(override),
    version: cached?.version ?? null,
    lastUpdatedAt: cached?.lastUpdatedAt ?? null
  }
}

/**
 * Runs `steamcmd +quit` so the binary self-updates against Valve's
 * servers, then parses the build identifier from its banner output.
 *
 * SteamCMD prints a line like:
 *   `Steam Console Client (c) Valve Corporation - version 1747432548`
 * We capture that number and treat it as the SDK version.
 */
export async function checkForSdkUpdates(override?: string): Promise<SdkInfo> {
  const steamcmdPath = resolveSteamcmdPath(override)
  if (!fs.existsSync(steamcmdPath)) {
    return {
      steamcmdPath,
      isBundled: !override,
      version: null,
      lastUpdatedAt: null
    }
  }

  const version = await runAndParseVersion(steamcmdPath)
  if (version) {
    cached = { version, lastUpdatedAt: new Date().toISOString() }
  }

  return {
    steamcmdPath,
    isBundled: !override || !fs.existsSync(override),
    version: cached?.version ?? null,
    lastUpdatedAt: cached?.lastUpdatedAt ?? null
  }
}

function runAndParseVersion(steamcmdPath: string): Promise<string | null> {
  return new Promise((resolve) => {
    const proc = spawn(steamcmdPath, ['+quit'], {
      cwd: path.dirname(steamcmdPath),
      env: { ...process.env, STEAMCMD_NOCRASHMONITOR: '1' }
    })

    let buffer = ''
    const timeout = setTimeout(() => {
      proc.kill()
      resolve(parseVersion(buffer))
    }, 60_000)

    proc.stdout.on('data', (chunk) => { buffer += chunk.toString() })
    proc.stderr.on('data', (chunk) => { buffer += chunk.toString() })
    proc.on('close', () => {
      clearTimeout(timeout)
      resolve(parseVersion(buffer))
    })
    proc.on('error', () => {
      clearTimeout(timeout)
      resolve(null)
    })
  })
}

function parseVersion(output: string): string | null {
  const match = output.match(/version\s+(\d{8,})/i)
  return match ? match[1] : null
}
