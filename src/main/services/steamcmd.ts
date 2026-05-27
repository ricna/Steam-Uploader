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
    const error = `SteamCMD binary not found at ${steamcmdPath}\nRun \`npm run prepare-sdk\` to stage the bundled tooling, or set a custom path in Settings.\n`
    onLog(`Error: ${error}`)
    return { success: false, exitCode: null, error }
  }

  return new Promise<UploadResult>((resolve) => {
    const args = ['+login', username, password, '+run_app_build', appVdfPath, '+quit']
    const proc = spawn(steamcmdPath, args, {
      cwd: path.dirname(steamcmdPath),
      env: { ...process.env, STEAMCMD_NOCRASHMONITOR: '1' }
    })

    let mobileAuthShown = false
    let buildSucceeded = false
    const forward = (chunk: Buffer): void => {
      const text = stripAnsi(chunk.toString())
      onLog(text)

      const lower = text.toLowerCase()

      // Detect the canonical success marker so we can trust it even when
      // steamcmd self-updates after the upload and returns a noisy exit
      // code from the update cycle (commonly 7 or 42).
      if (
        !buildSucceeded &&
        (lower.includes('successfully finished appid') ||
          lower.includes('successfully built appid'))
      ) {
        buildSucceeded = true
      }

      if (!mobileAuthShown) {
        const wantsMobileConfirm =
          lower.includes('confirmation of login') ||
          lower.includes('mobile authenticator') ||
          lower.includes('please confirm') ||
          lower.includes('two-factor code') ||
          lower.includes('steam guard')
        if (wantsMobileConfirm) {
          mobileAuthShown = true
          onLog(
            '\n[Steam Uploader] Steam is waiting for confirmation. ' +
              'Open the Steam mobile app and approve the login attempt.\n\n'
          )
        }
      }
    }

    proc.stdout.on('data', forward)
    proc.stderr.on('data', forward)

    proc.on('close', (code) => {
      // Trust the build success marker over the exit code — steamcmd often
      // exits non-zero from a post-upload self-update cycle even though the
      // build itself was committed successfully.
      const success = buildSucceeded || code === 0
      resolve({ success, exitCode: code })
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
