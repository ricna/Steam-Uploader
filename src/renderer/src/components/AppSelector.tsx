import { useState } from 'react'
import type { SteamApp } from '../../../shared/types'

interface AppSelectorProps {
  apps: SteamApp[]
  selectedAppId: string
  onSelect: (appId: string) => void
  onAddApp: () => void
}

export function AppSelector({
  apps,
  selectedAppId,
  onSelect,
  onAddApp
}: AppSelectorProps): JSX.Element {
  const [open, setOpen] = useState(false)
  const selected = apps.find((a) => a.appId === selectedAppId)

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <button
          className="w-full flex items-center gap-3 bg-[#1a1a1a] hover:bg-[#222] border border-[#2a2a2a] rounded-xl px-4 py-3 transition-colors text-left"
          onClick={() => setOpen((o) => !o)}
        >
          <AppIcon iconUrl={selected?.iconUrl} />
          <div className="flex-1 min-w-0">
            {selected ? (
              <>
                <div className="font-medium text-sm text-white truncate">{selected.name}</div>
                <div className="text-xs text-[#555] mt-0.5">App ID {selected.appId}</div>
              </>
            ) : (
              <span className="text-[#555] text-sm">No app selected</span>
            )}
          </div>
          <ChevronIcon open={open} />
        </button>

        {open && apps.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden z-50 shadow-2xl">
            {apps.map((app) => (
              <button
                key={app.appId}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-[#222] transition-colors text-left ${
                  app.appId === selectedAppId ? 'bg-[#1e2a1e]' : ''
                }`}
                onClick={() => {
                  onSelect(app.appId)
                  setOpen(false)
                }}
              >
                <AppIcon iconUrl={app.iconUrl} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white truncate">{app.name}</div>
                  <div className="text-xs text-[#555]">App ID {app.appId}</div>
                </div>
                {app.appId === selectedAppId && (
                  <div className="w-1.5 h-1.5 rounded-full bg-[#4caf50] flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={onAddApp}
        className="flex items-center justify-center bg-[#1a1a1a] hover:bg-[#222] border border-[#2a2a2a] rounded-xl px-3 py-3 transition-colors text-[#888] hover:text-white"
        title="Add app"
        aria-label="Add app"
      >
        <PlusIcon />
      </button>
    </div>
  )
}

function AppIcon({ iconUrl }: { iconUrl?: string }): JSX.Element {
  if (iconUrl) {
    return <img src={iconUrl} alt="" className="w-8 h-5 rounded object-cover flex-shrink-0" />
  }
  return <div className="w-8 h-5 rounded bg-[#2a2a2a] flex-shrink-0" />
}

function ChevronIcon({ open }: { open: boolean }): JSX.Element {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      className={`text-[#555] flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
    >
      <path d="M7 10l5 5 5-5z" fill="currentColor" />
    </svg>
  )
}

function PlusIcon(): JSX.Element {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M12 4v16m-8-8h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
