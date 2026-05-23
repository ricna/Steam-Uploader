/**
 * SteamCMD process runner.
 *
 * Wraps the spawn of the bundled SteamCMD binary with the right
 * arguments for an authenticated app build, and forwards every line
 * of stdout/stderr to the caller for live log streaming.
 */

import { spawn } from 'node:child_process'
import path from 'node:path'
import fs from 'node:fs'
import type { UploadResult } from '../../shared/types'

const ANSI_ESCAPE = /\x1b\[[0-9;]*[mGKHF]/g

export interface RunUploadOptions {
  steamcmdPath: string
  username: string
  password: string
  appVdfPath: string
  onLog: (line: string) => void
}

export async function runUpload(options: RunUploadOptions): Promise<UploadResult> {
  const { steamcmdPath, username, password, appVdfPath, onLog } = options

  if (!fs.existsSync(steamcmdPath)) {
    return {
      success: false,
      exitCode: null,
      error: `SteamCMD binary not found at ${steamcmdPath}`
    }
  }

  return new Promise<UploadResult>((resolve) => {
    const args = ['+login', username, password, '+run_app_build', appVdfPath, '+quit']
    const proc = spawn(steamcmdPath, args, {
      cwd: path.dirname(steamcmdPath),
      env: { ...process.env, STEAMCMD_NOCRASHMONITOR: '1' }
    })

    const forward = (chunk: Buffer): void => {
      onLog(stripAnsi(chunk.toString()))
    }

    proc.stdout.on('data', forward)
    proc.stderr.on('data', forward)

    proc.on('close', (code) => {
      resolve({ success: code === 0, exitCode: code })
    })

    proc.on('error', (err) => {
      onLog(`Error: ${err.message}\n`)
      resolve({ success: false, exitCode: null, error: err.message })
    })
  })
}

function stripAnsi(text: string): string {
  return text.replace(ANSI_ESCAPE, '')
}
