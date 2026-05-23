/**
 * Thin client over Steam's public storefront API.
 *
 * Used to fetch the canonical name and header image for an App ID
 * when the user adds a new app. No authentication required — this
 * endpoint serves the same data the Steam store website uses.
 */

import { net } from 'electron'
import type { SteamAppLookup } from '../../shared/types'

const STORE_API = 'https://store.steampowered.com/api/appdetails'
const MAX_RESPONSE_BYTES = 64 * 1024
const MAX_NAME_LENGTH = 128

export function lookupApp(appId: string): Promise<SteamAppLookup> {
  return new Promise((resolve) => {
    const request = net.request(`${STORE_API}?appids=${appId}&filters=basic`)
    let buffer = ''

    request.on('response', (response) => {
      response.on('data', (chunk: Buffer) => {
        if (buffer.length < MAX_RESPONSE_BYTES) buffer += chunk.toString()
      })
      response.on('end', () => resolve(parseLookupResponse(buffer, appId)))
    })

    request.on('error', () => resolve({ success: false }))
    request.end()
  })
}

function parseLookupResponse(body: string, appId: string): SteamAppLookup {
  try {
    const json = JSON.parse(body)
    const entry = json[appId]
    if (!entry?.success || !entry.data) return { success: false }
    return {
      success: true,
      name: String(entry.data.name).slice(0, MAX_NAME_LENGTH),
      iconUrl: entry.data.header_image
    }
  } catch {
    return { success: false }
  }
}
