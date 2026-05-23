/**
 * Stages the SteamCMD tooling into resources/ for packaging.
 *
 * Resolution order:
 *   1. STEAM_SDK_ROOT env var pointing at a Steamworks SDK checkout
 *   2. ../SteamSDK or ./SteamSDK relative to the project
 *   3. Public Valve CDN download (the official SteamCMD bootstrapper)
 *
 * Option (3) makes the project buildable by anyone — no Steamworks
 * partner account or manual SDK download required. The bootstrapper
 * fetches the rest of its own files on first run.
 */

const fs = require('node:fs')
const path = require('node:path')
const https = require('node:https')
const { execSync } = require('node:child_process')

const ROOT = path.join(__dirname, '..')
const TARGET_DIR = path.join(ROOT, 'resources', 'steam-sdk')
const BUILDER_DIR = path.join(TARGET_DIR, 'builder')

const SDK_SUBDIRS = {
  win32: ['sdk', 'tools', 'ContentBuilder'],
  darwin: ['sdk', 'tools', 'builder_osx'],
  linux: ['sdk', 'tools', 'builder_linux']
}

const STEAMCMD_PUBLIC_URLS = {
  win32: 'https://steamcdn-a.akamaihd.net/client/installer/steamcmd.zip',
  darwin: 'https://steamcdn-a.akamaihd.net/client/installer/steamcmd_osx.tar.gz',
  linux: 'https://steamcdn-a.akamaihd.net/client/installer/steamcmd_linux.tar.gz'
}

const DEFAULT_SDK_ROOTS = [
  path.join(ROOT, '..', 'SteamSDK'),
  path.join(ROOT, 'SteamSDK')
]

const targetPlatform = process.env.SDK_TARGET_PLATFORM || process.platform

function findLocalSdkRoot() {
  if (process.env.STEAM_SDK_ROOT && fs.existsSync(process.env.STEAM_SDK_ROOT)) {
    return process.env.STEAM_SDK_ROOT
  }
  return DEFAULT_SDK_ROOTS.find((p) => fs.existsSync(p))
}

function copyTree(source, dest) {
  fs.mkdirSync(dest, { recursive: true })
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const src = path.join(source, entry.name)
    const dst = path.join(dest, entry.name)
    if (entry.isSymbolicLink()) continue
    if (entry.isDirectory()) copyTree(src, dst)
    else fs.copyFileSync(src, dst)
  }
}

function totalSizeMB(dir) {
  let total = 0
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) total += totalSizeMB(full) * 1024 * 1024
    else total += fs.statSync(full).size
  }
  return total / (1024 * 1024)
}

function copyFromLocalSdk(sdkRoot) {
  const subdirSegments = SDK_SUBDIRS[targetPlatform] || SDK_SUBDIRS.win32
  const sourceDir = path.join(sdkRoot, ...subdirSegments)
  if (!fs.existsSync(sourceDir)) {
    console.warn(`[prepare-sdk] Expected SDK subdir not found: ${sourceDir}`)
    return false
  }

  if (targetPlatform === 'win32') {
    copyTree(path.join(sourceDir, 'builder'), BUILDER_DIR)
    const scriptsSource = path.join(sourceDir, 'scripts')
    if (fs.existsSync(scriptsSource)) {
      copyTree(scriptsSource, path.join(TARGET_DIR, 'scripts'))
    }
  } else {
    copyTree(sourceDir, BUILDER_DIR)
  }

  return true
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest)
    https
      .get(url, (response) => {
        if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          downloadFile(response.headers.location, dest).then(resolve, reject)
          return
        }
        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode} downloading ${url}`))
          return
        }
        response.pipe(file)
        file.on('finish', () => file.close(() => resolve()))
      })
      .on('error', (err) => {
        fs.unlink(dest, () => reject(err))
      })
  })
}

async function downloadFromValveCDN() {
  const url = STEAMCMD_PUBLIC_URLS[targetPlatform]
  if (!url) {
    throw new Error(`No public SteamCMD download URL for platform "${targetPlatform}"`)
  }

  fs.mkdirSync(BUILDER_DIR, { recursive: true })
  const ext = url.endsWith('.zip') ? 'zip' : 'tar.gz'
  const archivePath = path.join(BUILDER_DIR, `steamcmd.${ext}`)

  console.log(`[prepare-sdk] Downloading SteamCMD from ${url}…`)
  await downloadFile(url, archivePath)

  console.log('[prepare-sdk] Extracting…')
  if (ext === 'zip') {
    if (process.platform === 'win32') {
      execSync(
        `powershell -NoProfile -Command "Expand-Archive -Path '${archivePath}' -DestinationPath '${BUILDER_DIR}' -Force"`,
        { stdio: 'inherit' }
      )
    } else {
      execSync(`unzip -o "${archivePath}" -d "${BUILDER_DIR}"`, { stdio: 'inherit' })
    }
  } else {
    execSync(`tar -xzf "${archivePath}" -C "${BUILDER_DIR}"`, { stdio: 'inherit' })
  }

  fs.unlinkSync(archivePath)
}

async function main() {
  fs.rmSync(TARGET_DIR, { recursive: true, force: true })

  const sdkRoot = findLocalSdkRoot()
  if (sdkRoot) {
    console.log(`[prepare-sdk] Using local SDK at ${sdkRoot}`)
    if (copyFromLocalSdk(sdkRoot)) {
      console.log(`[prepare-sdk] ${targetPlatform} bundle ready (${totalSizeMB(TARGET_DIR).toFixed(1)} MB)`)
      return
    }
  }

  console.log('[prepare-sdk] No local SDK found — fetching SteamCMD from Valve CDN.')
  await downloadFromValveCDN()
  console.log(`[prepare-sdk] ${targetPlatform} bundle ready (${totalSizeMB(TARGET_DIR).toFixed(1)} MB)`)
}

main().catch((err) => {
  console.error('[prepare-sdk] Error:', err.message)
  process.exit(1)
})
