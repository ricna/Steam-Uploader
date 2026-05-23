interface UploadControlsProps {
  branch: string
  preview: boolean
  uploading: boolean
  canUpload: boolean
  onBranchChange: (branch: string) => void
  onPreviewChange: (preview: boolean) => void
  onUpload: () => void
}

export function UploadControls({
  branch,
  preview,
  uploading,
  canUpload,
  onBranchChange,
  onPreviewChange,
  onUpload
}: UploadControlsProps): JSX.Element {
  return (
    <>
      <div className="bg-[#141414] border border-[#1e1e1e] rounded-xl p-4 flex items-center gap-4">
        <div className="flex-1">
          <label className="text-xs text-[#aaa] block mb-1.5">Branch (optional)</label>
          <input
            type="text"
            value={branch}
            onChange={(e) => onBranchChange(e.target.value)}
            placeholder="default"
            className="w-full bg-[#0f0f0f] border border-[#1e1e1e] rounded-lg px-3 py-2 text-xs text-[#999] placeholder-[#666] focus:outline-none focus:border-[#333] transition-colors"
          />
        </div>
        <label className="flex items-center gap-2 cursor-pointer mt-4">
          <button
            type="button"
            className={`w-9 h-5 rounded-full relative transition-colors ${preview ? 'bg-[#2a4a2a]' : 'bg-[#1e1e1e]'}`}
            onClick={() => onPreviewChange(!preview)}
            aria-pressed={preview}
          >
            <span
              className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${
                preview ? 'left-4 bg-[#4caf50]' : 'left-0.5 bg-[#333]'
              }`}
            />
          </button>
          <span className="text-xs text-[#aaa]">Preview only</span>
        </label>
      </div>

      <button
        onClick={onUpload}
        disabled={uploading || !canUpload}
        className={`flex items-center justify-center gap-2.5 rounded-xl py-3.5 px-6 font-medium text-sm transition-all ${
          uploading
            ? 'bg-[#1a1a1a] text-[#aaa] cursor-wait border border-[#222]'
            : !canUpload
              ? 'bg-[#1a1a1a] text-[#888] cursor-not-allowed border border-[#1e1e1e]'
              : 'bg-[#1a4a1a] hover:bg-[#1f5a1f] active:bg-[#163d16] text-[#4caf50] border border-[#2a6a2a] hover:border-[#3a7a3a]'
        }`}
      >
        {uploading ? <SpinnerIcon /> : <UploadIcon />}
        <span>
          {uploading ? 'Uploading to Steam…' : preview ? 'Preview Upload' : 'Upload to Steam'}
        </span>
      </button>
    </>
  )
}

function SpinnerIcon(): JSX.Element {
  return (
    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}

function UploadIcon(): JSX.Element {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 16V4m0 0L8 8m4-4l4 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M4 20h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
