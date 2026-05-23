/**
 * Credential encryption wrapper around Electron's `safeStorage`.
 *
 * On Windows this uses DPAPI; on macOS, Keychain; on Linux, libsecret
 * when available. If platform encryption is unavailable, we degrade
 * to plain storage rather than block the user — the worst case matches
 * what they'd get from a config file written by hand.
 */

import { safeStorage } from 'electron'

export function encryptPassword(plain: string): string {
  if (!plain) return ''
  try {
    if (safeStorage.isEncryptionAvailable()) {
      return safeStorage.encryptString(plain).toString('base64')
    }
  } catch {
    /* fall through */
  }
  return plain
}

export function decryptPassword(stored: string): string {
  if (!stored) return ''
  try {
    if (safeStorage.isEncryptionAvailable()) {
      return safeStorage.decryptString(Buffer.from(stored, 'base64'))
    }
  } catch {
    /* fall through */
  }
  return stored
}
