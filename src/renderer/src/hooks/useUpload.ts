import { useCallback, useEffect, useRef, useState } from 'react'
import type { UploadRequest } from '../../../shared/types'
import { api } from '../lib/api'

export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error'

export interface UseUpload {
  status: UploadStatus
  logs: string[]
  upload: (request: UploadRequest) => Promise<void>
  clearLogs: () => void
}

export function useUpload(): UseUpload {
  const [status, setStatus] = useState<UploadStatus>('idle')
  const [logs, setLogs] = useState<string[]>([])
  const unlistenRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    unlistenRef.current = api.steam.onUploadLog((line) => {
      setLogs((prev) => [...prev, line])
    })
    return () => unlistenRef.current?.()
  }, [])

  const upload = useCallback(async (request: UploadRequest) => {
    setStatus('uploading')
    setLogs([])
    const result = await api.steam.upload(request)
    setStatus(result.success ? 'success' : 'error')
  }, [])

  const clearLogs = useCallback(() => setLogs([]), [])

  return { status, logs, upload, clearLogs }
}
