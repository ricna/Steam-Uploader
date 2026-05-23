import { useEffect, useRef } from 'react'
import type { UploadStatus } from '../hooks/useUpload'

interface LogPanelProps {
  logs: string[]
  status: UploadStatus
  onClear: () => void
}

export function LogPanel({ logs, status, onClear }: LogPanelProps): JSX.Element | null {
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  if (logs.length === 0) return null

  return (
    <div className="flex-1 min-h-0 bg-[#090909] border border-[#1a1a1a] rounded-xl overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1a1a1a]">
        <div className="flex items-center gap-2">
          <StatusDot status={status} />
          <span className="text-xs text-[#999]">Output Log</span>
        </div>
        <button
          onClick={onClear}
          className="text-xs text-[#888] hover:text-[#bbb] transition-colors"
        >
          Clear
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 font-mono text-xs text-[#bbb] leading-relaxed">
        {logs.map((line, i) => (
          <span key={i} className={lineColor(line)}>
            {line}
          </span>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  )
}

function StatusDot({ status }: { status: UploadStatus }): JSX.Element {
  const color =
    status === 'success'
      ? 'bg-[#4caf50]'
      : status === 'error'
        ? 'bg-[#f44336]'
        : status === 'uploading'
          ? 'bg-[#f5a623] animate-pulse'
          : 'bg-[#333]'
  return <div className={`w-1.5 h-1.5 rounded-full ${color}`} />
}

function lineColor(line: string): string {
  const lower = line.toLowerCase()
  if (lower.includes('error') || lower.includes('fail')) return 'text-[#f44336]'
  if (lower.includes('success') || lower.includes('complete')) return 'text-[#4caf50]'
  if (line.startsWith('[Steam Uploader]')) return 'text-[#888]'
  return ''
}
