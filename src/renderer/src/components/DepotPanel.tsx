import { useState } from 'react'
import type { Depot } from '../../../shared/types'
import { api } from '../lib/api'

interface DepotPanelProps {
  depots: Depot[]
  onUpdateDepot: (oldId: string, depot: Depot) => void
  onAddDepot: () => void
  onRemoveDepot: (depotId: string) => void
}

export function DepotPanel({
  depots,
  onUpdateDepot,
  onAddDepot,
  onRemoveDepot
}: DepotPanelProps): JSX.Element {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs text-[#999] uppercase tracking-wider">Depots</span>
        <button
          onClick={onAddDepot}
          className="text-xs text-[#5fc5e8] hover:text-[#7dd2eb] transition-colors flex items-center gap-1"
        >
          <PlusIcon /> Add depot
        </button>
      </div>

      {depots.map((depot) => (
        <DepotCard
          key={depot.id}
          depot={depot}
          canRemove={depots.length > 1}
          existingIds={depots.filter((d) => d.id !== depot.id).map((d) => d.id)}
          onUpdate={onUpdateDepot}
          onRemove={() => onRemoveDepot(depot.id)}
        />
      ))}
    </div>
  )
}

interface DepotCardProps {
  depot: Depot
  canRemove: boolean
  existingIds: string[]
  onUpdate: (oldId: string, depot: Depot) => void
  onRemove: () => void
}

function DepotCard({
  depot,
  canRemove,
  existingIds,
  onUpdate,
  onRemove
}: DepotCardProps): JSX.Element {
  const [editingId, setEditingId] = useState(false)
  const [draftId, setDraftId] = useState(depot.id)
  const [idError, setIdError] = useState('')

  const handlePickFolder = async (): Promise<void> => {
    const folder = await api.dialog.selectFolder()
    if (folder) onUpdate(depot.id, { ...depot, contentPath: folder })
  }

  const startEditingId = (): void => {
    setDraftId(depot.id)
    setIdError('')
    setEditingId(true)
  }

  const commitId = (): void => {
    const trimmed = draftId.trim()
    if (!trimmed) {
      setIdError('Required')
      return
    }
    if (!/^\d{1,20}$/.test(trimmed)) {
      setIdError('Numeric only')
      return
    }
    if (existingIds.includes(trimmed)) {
      setIdError('Duplicate')
      return
    }
    if (trimmed !== depot.id) {
      onUpdate(depot.id, { ...depot, id: trimmed })
    }
    setEditingId(false)
  }

  const cancelEditing = (): void => {
    setDraftId(depot.id)
    setIdError('')
    setEditingId(false)
  }

  return (
    <div className="bg-[#141414] border border-[#1e1e1e] rounded-xl p-4">
      <div className="flex items-center justify-between mb-3 gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[#888] flex-shrink-0" />
          {editingId ? (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-xs text-[#888] flex-shrink-0">Depot</span>
              <input
                value={draftId}
                onChange={(e) => {
                  setDraftId(e.target.value.replace(/\D/g, ''))
                  setIdError('')
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitId()
                  if (e.key === 'Escape') cancelEditing()
                }}
                onBlur={commitId}
                autoFocus
                className="bg-[#0f0f0f] border border-[#2a2a2a] rounded px-2 py-0.5 text-xs text-[#ccc] font-mono w-32 focus:outline-none focus:border-[#5c2f10]"
              />
              {idError && <span className="text-[10px] text-[#f44336]">{idError}</span>}
            </div>
          ) : (
            <button
              onClick={startEditingId}
              className="text-xs text-[#bbb] font-mono hover:text-white transition-colors flex items-center gap-1 group/id"
              title="Click to edit Depot ID"
            >
              <span>Depot {depot.id}</span>
              <PencilIcon className="opacity-0 group-hover/id:opacity-100 transition-opacity text-[#888]" />
            </button>
          )}
        </div>

        {canRemove && (
          <button
            onClick={onRemove}
            className="text-[#888] hover:text-[#f44336] transition-colors flex-shrink-0"
            title="Remove depot"
            aria-label="Remove depot"
          >
            <TrashIcon />
          </button>
        )}
      </div>

      <button
        className="w-full flex items-center gap-3 bg-[#0f0f0f] border border-[#1e1e1e] rounded-lg px-3 py-2.5 hover:border-[#333] transition-colors group text-left"
        onClick={handlePickFolder}
      >
        <FolderIcon />
        {depot.contentPath ? (
          <span className="text-xs text-[#bbb] font-mono truncate flex-1">{depot.contentPath}</span>
        ) : (
          <span className="text-xs text-[#999] flex-1">Click to select content folder…</span>
        )}
        <EditIcon />
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

function EditIcon(): JSX.Element {
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

function PencilIcon({ className = '' }: { className?: string }): JSX.Element {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  )
}

function PlusIcon(): JSX.Element {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
      <path d="M12 4v16m-8-8h16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

function TrashIcon(): JSX.Element {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <path
        d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
