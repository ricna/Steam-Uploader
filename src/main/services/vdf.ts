/**
 * VDF (Valve Data File) generator.
 *
 * Produces the `app_build_*.vdf` and `depot_build_*.vdf` files that
 * SteamCMD's `+run_app_build` consumes. We escape backslashes in paths
 * because the VDF format treats `\` as an escape character.
 */

import fs from 'node:fs'
import path from 'node:path'
import type { Depot } from '../../shared/types'

export interface VdfWriteOptions {
  appId: string
  description: string
  outputPath: string
  branch: string
  preview: boolean
  depots: Depot[]
  scriptsDir: string
}

export interface GeneratedVdfPaths {
  appVdfPath: string
  depotVdfPaths: string[]
}

const VDF_FILE_MODE = 0o600

export function writeBuildScripts(options: VdfWriteOptions): GeneratedVdfPaths {
  fs.mkdirSync(options.scriptsDir, { recursive: true })
  fs.mkdirSync(options.outputPath, { recursive: true })

  const depotVdfPaths = options.depots.map((depot) => {
    const filePath = path.join(options.scriptsDir, `depot_${depot.id}.vdf`)
    fs.writeFileSync(filePath, renderDepotVdf(depot), { mode: VDF_FILE_MODE })
    return filePath
  })

  const appVdfPath = path.join(options.scriptsDir, `app_${options.appId}.vdf`)
  fs.writeFileSync(
    appVdfPath,
    renderAppVdf({
      appId: options.appId,
      description: options.description,
      outputPath: options.outputPath,
      branch: options.branch,
      preview: options.preview,
      depots: options.depots,
      depotVdfPaths
    }),
    { mode: VDF_FILE_MODE }
  )

  return { appVdfPath, depotVdfPaths }
}

function renderDepotVdf(depot: Depot): string {
  return [
    '"DepotBuildConfig"',
    '{',
    `\t"DepotID" "${depot.id}"`,
    `\t"contentroot" "${escapePath(depot.contentPath)}"`,
    '\t"FileMapping"',
    '\t{',
    '\t\t"LocalPath" "*"',
    '\t\t"DepotPath" "."',
    '\t\t"recursive" "1"',
    '\t}',
    '\t"FileExclusion" "*.pdb"',
    '}'
  ].join('\n')
}

interface AppVdfContext {
  appId: string
  description: string
  outputPath: string
  branch: string
  preview: boolean
  depots: Depot[]
  depotVdfPaths: string[]
}

function renderAppVdf(ctx: AppVdfContext): string {
  const depotEntries = ctx.depots
    .map((depot, i) => `\t\t"${depot.id}" "${escapePath(ctx.depotVdfPaths[i])}"`)
    .join('\n')

  return [
    '"appbuild"',
    '{',
    `\t"appid" "${ctx.appId}"`,
    `\t"desc" "${ctx.description}"`,
    `\t"buildoutput" "${escapePath(ctx.outputPath)}"`,
    '\t"contentroot" ""',
    `\t"setlive" "${ctx.branch}"`,
    `\t"preview" "${ctx.preview ? '1' : '0'}"`,
    '\t"local" ""',
    '\t"depots"',
    '\t{',
    depotEntries,
    '\t}',
    '}'
  ].join('\n')
}

function escapePath(p: string): string {
  return p.replace(/\\/g, '\\\\')
}
