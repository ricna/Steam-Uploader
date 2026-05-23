import { useState } from 'react'
import type { SteamApp } from '../../../shared/types'
import { api } from '../lib/api'
import { Modal } from './Modal'

interface AddAppModalProps {
  onAdd: (app: SteamApp) => void
  onClose: () => void
}

interface FetchedApp {
  name: string
  iconUrl?: string
}

export function AddAppModal({ onAdd, onClose }: AddAppModalProps): JSX.Element {
  const [appId, setAppId] = useState('')
  const [fetching, setFetching] = useState(false)
  const [fetched, setFetched] = useState<FetchedApp | null>(null)
  const [error, setError] = useState('')
  const [depotId, setDepotId] = useState('')

  const handleLookup = async (): Promise<void> => {
    if (!appId.trim()) return
    setFetching(true)
    setError('')
    setFetched(null)
    try {
      const result = await api.steam.lookupApp(appId.trim())
      if (result.success && result.name) {
        setFetched({ name: result.name, iconUrl: result.iconUrl })
        setDepotId(String(Number(appId.trim()) + 1))
      } else {
        setError('App not found on Steam. Check the App ID and try again.')
      }
    } finally {
      setFetching(false)
    }
  }

  const handleAdd = (): void => {
    if (!fetched) return
    const finalDepotId = depotId || String(Number(appId) + 1)
    onAdd({
      appId: appId.trim(),
      name: fetched.name,
      iconUrl: fetched.iconUrl,
      depots: [{ id: finalDepotId, contentPath: '' }]
    })
  }

  return (
    <Modal
      title="Add Steam App"
      maxWidth="max-w-sm"
      onClose={onClose}
      footer={
        <>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-[#2a2a2a] text-sm text-[#aaa] hover:text-[#888] hover:border-[#333] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={!fetched}
            className="flex-1 py-2.5 rounded-xl bg-[#1a4a1a] hover:bg-[#1f5a1f] border border-[#2a6a2a] text-sm text-[#4caf50] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Add App
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <label className="text-xs text-[#999] block mb-1.5">App ID</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={appId}
              onChange={(e) => {
                setAppId(e.target.value.replace(/\D/g, ''))
                setFetched(null)
                setError('')
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
              placeholder="e.g. 480"
              className="flex-1 bg-[#0f0f0f] border border-[#1e1e1e] rounded-lg px-3 py-2.5 text-sm text-[#ccc] placeholder-[#666] focus:outline-none focus:border-[#333] transition-colors font-mono"
            />
            <button
              onClick={handleLookup}
              disabled={!appId || fetching}
              className="px-4 py-2.5 rounded-lg bg-[#1a1a1a] hover:bg-[#222] border border-[#2a2a2a] text-xs text-[#bbb] hover:text-[#999] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {fetching ? <Spinner /> : 'Look up'}
            </button>
          </div>
          <p className="text-xs text-[#888] mt-1.5">
            Find this on partner.steamgames.com or your Steam store page URL.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-[#1a0a0a] border border-[#3a1010] rounded-lg px-3 py-2.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-[#f44336] flex-shrink-0">
              <path
                d="M12 2L2 20h20L12 2zm0 13h-0.01M12 10v4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <span className="text-xs text-[#f44336]">{error}</span>
          </div>
        )}

        {fetched && (
          <>
            <div className="bg-[#0f1a0f] border border-[#1e3a1e] rounded-xl p-4 flex items-center gap-3">
              {fetched.iconUrl && (
                <img
                  src={fetched.iconUrl}
                  alt=""
                  className="w-16 h-10 rounded object-cover flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">{fetched.name}</div>
                <div className="text-xs text-[#aaa] mt-0.5">App ID {appId}</div>
              </div>
              <CheckIcon />
            </div>

            <div>
              <label className="text-xs text-[#999] block mb-1.5">Depot ID</label>
              <input
                type="text"
                value={depotId}
                onChange={(e) => setDepotId(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-[#0f0f0f] border border-[#1e1e1e] rounded-lg px-3 py-2.5 text-sm text-[#ccc] font-mono focus:outline-none focus:border-[#333] transition-colors"
              />
              <p className="text-xs text-[#888] mt-1.5">
                Default is App ID + 1. Change only if your depot ID differs.
              </p>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}

function Spinner(): JSX.Element {
  return (
    <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}

function CheckIcon(): JSX.Element {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-[#4caf50] flex-shrink-0">
      <path
        d="M20 6L9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
