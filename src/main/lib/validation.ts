/**
 * Input validation utilities for IPC boundaries.
 *
 * The renderer is treated as untrusted: every value that crosses the
 * IPC boundary must be validated here before being passed to OS calls,
 * file system operations, or subprocess arguments.
 */

import path from 'node:path'

const NUMERIC_ID = /^\d{1,20}$/
const SAFE_USERNAME = /^[\w\-.@]+$/
const SAFE_BRANCH = /^[a-zA-Z0-9_-]*$/

export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export function validateSteamId(value: unknown, label = 'ID'): string {
  if (typeof value !== 'string' && typeof value !== 'number') {
    throw new ValidationError(`${label} must be a number`)
  }
  const str = String(value).trim()
  if (!NUMERIC_ID.test(str)) {
    throw new ValidationError(`${label} must be numeric`)
  }
  return str
}

export function validateUsername(value: unknown): string {
  if (typeof value !== 'string') throw new ValidationError('Username must be a string')
  const trimmed = value.trim()
  if (trimmed.length === 0) throw new ValidationError('Username is required')
  if (trimmed.length > 64) throw new ValidationError('Username is too long')
  if (!SAFE_USERNAME.test(trimmed)) {
    throw new ValidationError('Username contains invalid characters')
  }
  return trimmed
}

export function validateBranch(value: unknown): string {
  if (typeof value !== 'string') return ''
  const trimmed = value.trim().slice(0, 64)
  if (!SAFE_BRANCH.test(trimmed)) {
    throw new ValidationError('Branch name contains invalid characters')
  }
  return trimmed
}

export function validatePath(value: unknown, label = 'Path'): string {
  if (typeof value !== 'string') throw new ValidationError(`${label} must be a string`)
  if (value.length === 0) throw new ValidationError(`${label} is required`)
  if (value.length > 512) throw new ValidationError(`${label} is too long`)
  const normalized = path.normalize(value)
  if (normalized.includes('..')) {
    throw new ValidationError(`${label} contains an invalid traversal segment`)
  }
  return normalized
}
