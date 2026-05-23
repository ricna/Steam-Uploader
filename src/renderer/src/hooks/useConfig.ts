import { useCallback, useEffect, useState } from 'react'
import type { AppConfig } from '../../../shared/types'
import { api } from '../lib/api'

const EMPTY_CONFIG: AppConfig = {
  credentials: { username: '', password: '' },
  apps: []
}

export interface UseConfig {
  config: AppConfig
  loading: boolean
  save: (next: AppConfig) => Promise<void>
  patch: (partial: Partial<AppConfig>) => Promise<void>
}

export function useConfig(): UseConfig {
  const [config, setConfig] = useState<AppConfig>(EMPTY_CONFIG)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.config.get().then((loaded) => {
      setConfig(loaded)
      setLoading(false)
    })
  }, [])

  const save = useCallback(async (next: AppConfig) => {
    setConfig(next)
    await api.config.save(next)
  }, [])

  const patch = useCallback(async (partial: Partial<AppConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...partial }
      void api.config.save(next)
      return next
    })
  }, [])

  return { config, loading, save, patch }
}
