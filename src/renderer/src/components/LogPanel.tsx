import { useEffect, useRef, useState } from 'react'
import type { UploadStatus } from '../hooks/useUpload'

interface LogPanelProps {
  logs: string[]
  status: UploadStatus
  onClear: () => void
}

export function LogPanel({ logs, status, onClear }: LogPanelProps): JSX.Element | null {
  const endRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(logs.join(''))
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard not available — silently ignore */
    }
  }

  if (logs.length === 0) return null

  return (
    <div className="flex-1 min-h-0 bg-[#090909] border border-[#1a1a1a] rounded-xl overflow-hidden flex flex-col">
      <StatusHeader status={status} onClear={onClear} onCopy={handleCopy} copied={copied} />
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

interface StatusHeaderProps {
  status: UploadStatus
  onClear: () => void
  onCopy: () => void
  copied: boolean
}

function StatusHeader({ status, onClear, onCopy, copied }: StatusHeaderProps): JSX.Element {
  const config = HEADER_STATES[status]
  return (
    <div
      className={`flex items-center justify-between px-4 py-2.5 border-b ${config.bg} ${config.border}`}
    >
      <div className="flex items-center gap-2.5">
        <StatusIcon status={status} />
        <span className={`text-xs font-medium ${config.text}`}>{config.label}</span>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onCopy}
          className="text-xs text-[#888] hover:text-[#bbb] transition-colors flex items-center gap-1.5"
          title="Copy entire log to clipboard"
        >
          {copied ? (
            <>
              <CheckGlyph /> Copied
            </>
          ) : (
            <>
              <CopyGlyph /> Copy
            </>
          )}
        </button>
        <button
          onClick={onClear}
          className="text-xs text-[#888] hover:text-[#bbb] transition-colors"
        >
          Clear
        </button>
      </div>
    </div>
  )
}

function CopyGlyph(): JSX.Element {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
      <rect x="8" y="8" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  )
}

function CheckGlyph(): JSX.Element {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" className="text-[#ff8c42]">
      <path
        d="M20 6L9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const HEADER_STATES: Record<UploadStatus, { label: string; bg: string; border: string; text: string }> = {
  idle: {
    label: 'Output Log',
    bg: '',
    border: 'border-[#1a1a1a]',
    text: 'text-[#999]'
  },
  uploading: {
    label: 'Uploading to Steam…',
    bg: 'bg-[#0a2030]',
    border: 'border-[#1a3a52]',
    text: 'text-[#5fc5e8]'
  },
  success: {
    label: 'Upload successful',
    bg: 'bg-[#1f1408]',
    border: 'border-[#5c2f10]',
    text: 'text-[#ff8c42]'
  },
  error: {
    label: 'Upload failed — see log below',
    bg: 'bg-[#1a0a0a]',
    border: 'border-[#3a1010]',
    text: 'text-[#f44336]'
  }
}

function StatusIcon({ status }: { status: UploadStatus }): JSX.Element {
  if (status === 'success') {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-[#ff8c42]">
        <path
          d="M20 6L9 17l-5-5"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }
  if (status === 'error') {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-[#f44336]">
        <path
          d="M18 6L6 18M6 6l12 12"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    )
  }
  if (status === 'uploading') {
    return (
      <svg className="animate-spin w-3.5 h-3.5 text-[#5fc5e8]" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
        <path
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          fill="currentColor"
          className="opacity-75"
        />
      </svg>
    )
  }
  return <div className="w-1.5 h-1.5 rounded-full bg-[#888]" />
}

function lineColor(line: string): string {
  const lower = line.toLowerCase()
  if (lower.includes('error') || lower.includes('fail')) return 'text-[#f44336]'
  if (lower.includes('success') || lower.includes('complete')) return 'text-[#ff8c42]'
  if (line.startsWith('[Steam Uploader]')) return 'text-[#888]'
  return ''
}
