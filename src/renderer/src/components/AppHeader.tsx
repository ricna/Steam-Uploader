interface AppHeaderProps {
  onOpenSettings: () => void
}

export function AppHeader({ onOpenSettings }: AppHeaderProps): JSX.Element {
  return (
    <header className="flex items-center justify-between px-4 pt-3 pb-2">
      <div className="flex items-center gap-2">
        <SteamGlyph />
        <span className="text-[11px] text-[#444] font-medium tracking-wide">STEAM UPLOADER</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[10px] text-[#333] font-medium tracking-widest uppercase select-none">
          Lumiric Studio
        </span>
        <button
          onClick={onOpenSettings}
          className="text-[#444] hover:text-[#888] transition-colors p-1"
          title="Settings"
          aria-label="Settings"
        >
          <SettingsGlyph />
        </button>
      </div>
    </header>
  )
}

function SteamGlyph(): JSX.Element {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="opacity-40 flex-shrink-0">
      <path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"
        fill="currentColor"
      />
    </svg>
  )
}

function SettingsGlyph(): JSX.Element {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1A1.7 1.7 0 004.6 15a1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3h0a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8v0a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  )
}
