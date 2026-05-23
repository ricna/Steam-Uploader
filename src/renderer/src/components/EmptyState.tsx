interface EmptyStateProps {
  onAddApp: () => void
}

export function EmptyState({ onAddApp }: EmptyStateProps): JSX.Element {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
      <div className="w-12 h-12 rounded-2xl bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[#999]">
          <path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
            fill="currentColor"
          />
        </svg>
      </div>
      <div>
        <div className="text-sm text-[#bbb] font-medium">No apps configured</div>
        <div className="text-xs text-[#888] mt-1">Click + to add your first Steam app</div>
      </div>
      <button
        onClick={onAddApp}
        className="text-xs text-[#ff8c42] hover:text-[#ffa15c] transition-colors"
      >
        Add App →
      </button>
    </div>
  )
}
