interface SetupBannerProps {
  onClick: () => void
}

export function SetupBanner({ onClick }: SetupBannerProps): JSX.Element {
  return (
    <div
      className="mx-4 mb-2 px-4 py-2.5 bg-[#0a2030] border border-[#1a3a52] rounded-lg flex items-center gap-3 cursor-pointer hover:bg-[#0f2a3d] transition-colors"
      onClick={onClick}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="text-[#5fc5e8] flex-shrink-0">
        <path
          d="M12 2L2 20h20L12 2zm0 3.5L19.5 19h-15L12 5.5zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z"
          fill="currentColor"
        />
      </svg>
      <span className="text-xs text-[#5fc5e8]">
        Setup required — click to configure your Steam credentials
      </span>
    </div>
  )
}
