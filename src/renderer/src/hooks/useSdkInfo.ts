import { useCallback, useEffect, useState } from 'react'
import type { SdkInfo } from '../../../shared/types'
import { api } from '../lib/api'

export interface UseSdkInfo {
  info: SdkInfo | null
  checking: boolean
  checkForUpdates: () => Promise<void>
}

export function useSdkInfo(): UseSdkInfo {
  const [info, setInfo] = useState<SdkInfo | null>(null)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    api.sdk.getInfo().then(setInfo).catch(() => setInfo(null))
  }, [])

  const checkForUpdates = useCallback(async () => {
    setChecking(true)
    try {
      const next = await api.sdk.checkForUpdates()
      setInfo(next)
    } finally {
      setChecking(false)
    }
  }, [])

  return { info, checking, checkForUpdates }
}
