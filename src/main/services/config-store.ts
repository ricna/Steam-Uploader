/**
 * Typed wrapper around `electron-store`.
 *
 * The store persists to JSON in the user's appData folder. Credentials
 * are encrypted via `credentials.ts` before being written here.
 */

import Store from 'electron-store'
import type { AppConfig } from '../../shared/types'
import { decryptPassword, encryptPassword } from './credentials'

const DEFAULT_CONFIG: AppConfig = {
  credentials: { username: '', password: '' },
  apps: []
}

const store = new Store<{ config: AppConfig }>({
  defaults: { config: DEFAULT_CONFIG }
})

export function loadConfig(): AppConfig {
  const raw = store.get('config', DEFAULT_CONFIG)
  return {
    ...raw,
    credentials: {
      username: raw.credentials?.username ?? '',
      password: decryptPassword(raw.credentials?.password ?? '')
    }
  }
}

export function saveConfig(config: AppConfig): void {
  store.set('config', {
    ...config,
    credentials: {
      username: config.credentials.username ?? '',
      password: encryptPassword(config.credentials.password ?? '')
    }
  })
}
