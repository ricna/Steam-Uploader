import type { Depot } from '../../../shared/types'
import { api } from '../lib/api'

interface DepotPanelProps {
  depots: Depot[]
  onUpdateDepot: (depotId: string, contentPath: string) => void
}

export function DepotPanel({ depots, onUpdateDepot }: DepotPanelProps): JSX.Element {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-xs text-[#999] uppercase tracking-wider px-1">Depots</div>
      {depots.map((depot) => (
        <DepotCard key={depot.id} depot={depot} onUpdate={onUpdateDepot} />
      ))}
    </div>
  )
}

interface DepotCardProps {
  depot: Depot
  onUpdate: (depotId: string, contentPath: string) => void
}

function DepotCard({ depot, onUpdate }: DepotCardProps): JSX.Element {
  const handlePickFolder = async (): Promise<void> => {
    const folder = await api.dialog.selectFolder()
    if (folder) onUpdate(depot.id, folder)
  }

  return (
    <div className="bg-[#141414] border border-[#1e1e1e] rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1.5 h-1.5 rounded-full bg-[#333]" />
        <span className="text-xs text-[#bbb] font-mono">Depot {depot.id}</span>
      </div>
      <button
        className="w-full flex items-center gap-3 bg-[#0f0f0f] border border-[#1e1e1e] rounded-lg px-3 py-2.5 hover:border-[#333] transition-colors group text-left"
        onClick={handlePickFolder}
      >
        <FolderIcon />
        {depot.contentPath ? (
          <span className="text-xs text-[#888] font-mono truncate flex-1">{depot.contentPath}</span>
        ) : (
          <span className="text-xs text-[#999] flex-1">Click to select content folder…</span>
        )}
        <PencilIcon />
      </button>
    </div>
  )
}

function FolderIcon(): JSX.Element {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      className="text-[#999] group-hover:text-[#bbb] flex-shrink-0"
    >
      <path
        d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  )
}

function PencilIcon(): JSX.Element {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      className="text-[#888] group-hover:text-[#aaa] flex-shrink-0"
    >
      <path
        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  )
}
