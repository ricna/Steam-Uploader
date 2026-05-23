/**
 * Packaging step.
 *
 * Composes:
 *   1. The compiled main/preload/renderer output in `out/`
 *   2. The bundled SteamCMD tree in `resources/steam-sdk/`
 * into a redistributable Electron app under `release/`.
 *
 * Produces both an unpacked directory and a portable ZIP. On Windows
 * we run from PowerShell's Compress-Archive; on other platforms we
 * skip the ZIP step and let CI handle it.
 */

const { packager } = require('@electron/packager')
const fs = require('node:fs')
const path = require('node:path')
const { execSync } = require('node:child_process')

const ROOT = path.join(__dirname, '..')
const RELEASE_DIR = path.join(ROOT, 'release')
const RESOURCES_DIR = path.join(ROOT, 'resources')
const ICON_PATH = path.join(RESOURCES_DIR, 'icon.ico')

function readPackage() {
  return JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'))
}

function describePlatform() {
  switch (process.platform) {
    case 'darwin':
      return { name: 'mac', arch: 'arm64' }
    case 'linux':
      return { name: 'linux', arch: 'x64' }
    default:
      return { name: 'win', arch: 'x64' }
  }
}

async function buildAppPackage(pkg) {
  fs.mkdirSync(RELEASE_DIR, { recursive: true })

  const target = describePlatform()
  const hasIcon = fs.existsSync(ICON_PATH)
  if (!hasIcon) {
    console.log('[package] No resources/icon.ico — using Electron default icon.')
  }

  const options = {
    dir: ROOT,
    name: 'Steam Uploader',
    out: RELEASE_DIR,
    overwrite: true,
    asar: true,
    prune: true,
    icon: hasIcon ? ICON_PATH : undefined,
    appVersion: pkg.version,
    appCopyright: 'Copyright © Lumiric Studio',
    win32metadata: {
      CompanyName: 'Lumiric Studio',
      FileDescription: 'Steam Uploader — Open-source Steam build uploader',
      ProductName: 'Steam Uploader',
      InternalName: 'steam-uploader'
    },
    extraResource: [path.join(RESOURCES_DIR, 'steam-sdk')],
    ignore: [
      /^\/src/,
      /^\/scripts/,
      /^\/\.github/,
      /^\/release/,
      /^\/resources(\/|$)/,
      /\.map$/,
      /\.ts$/,
      /tsconfig.*\.json$/,
      /electron\.vite\.config/,
      /tailwind\.config/,
      /postcss\.config/,
      /README/i,
      /LICENSE/
    ]
  }

  const [appDir] = await packager(options)
  console.log(`[package] App built → ${appDir}`)
  return { appDir, target }
}

function zipDirectory(srcDir, zipPath) {
  if (process.platform !== 'win32') return false
  try {
    execSync(
      `powershell -NoProfile -Command "Compress-Archive -Path '${srcDir}' -DestinationPath '${zipPath}' -Force"`,
      { stdio: 'inherit' }
    )
    return true
  } catch (err) {
    console.warn('[package] ZIP creation failed:', err.message)
    return false
  }
}

async function main() {
  const pkg = readPackage()
  console.log(`\n[package] Building Steam Uploader v${pkg.version} for ${process.platform}…\n`)

  if (!fs.existsSync(path.join(RESOURCES_DIR, 'steam-sdk'))) {
    console.warn(
      '[package] WARNING: resources/steam-sdk/ is missing. Run `npm run prepare-sdk` first.'
    )
  }

  const { appDir, target } = await buildAppPackage(pkg)

  const zipName = `SteamUploader-${pkg.version}-${target.name}-${target.arch}.zip`
  const zipPath = path.join(RELEASE_DIR, zipName)
  const zipped = zipDirectory(appDir, zipPath)

  console.log('\n[package] Done.')
  console.log(`  App folder: ${appDir}`)
  if (zipped) console.log(`  ZIP:        ${zipPath}`)
  console.log()
}

main().catch((err) => {
  console.error('[package] Error:', err.message)
  process.exit(1)
})
