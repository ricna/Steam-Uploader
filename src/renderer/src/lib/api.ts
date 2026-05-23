/**
 * Typed accessor for the IPC API exposed by the preload script.
 * Use this in place of `window.api` so the type contract is enforced
 * at the call site.
 */

import type { ElectronAPI } from '../../../shared/api'

export const api: ElectronAPI = window.api
