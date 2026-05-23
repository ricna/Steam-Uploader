import { useEffect, useState } from 'react'
import type { BuildInfo } from '../../../shared/types'
import { api } from '../lib/api'

export function useBuildInfo(): BuildInfo | null {
  const [info, setInfo] = useState<BuildInfo | null>(null)
  useEffect(() => {
    api.app.getBuildInfo().then(setInfo).catch(() => setInfo(null))
  }, [])
  return info
}
