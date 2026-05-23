import { useMemo, useState } from 'react'

import type { Depot, SteamApp } from '../../shared/types'

import { AddAppModal } from './components/AddAppModal'
import { AppHeader } from './components/AppHeader'
import { AppSelector } from './components/AppSelector'
import { DepotPanel } from './components/DepotPanel'
import { EmptyState } from './components/EmptyState'
import { Footer } from './components/Footer'
import { LogPanel } from './components/LogPanel'
import { SettingsModal } from './components/SettingsModal'
import { SetupBanner } from './components/SetupBanner'
import { UploadControls } from './components/UploadControls'

import { useBuildInfo } from './hooks/useBuildInfo'
import { useConfig } from './hooks/useConfig'
import { useSdkInfo } from './hooks/useSdkInfo'
import { useUpload } from './hooks/useUpload'

export default function App(): JSX.Element {
  const { config, save: saveConfig } = useConfig()
  const buildInfo = useBuildInfo()
  const { info: sdkInfo, checking: sdkChecking, checkForUpdates } = useSdkInfo()
  const { status, logs, upload, clearLogs } = useUpload()

  const [selectedAppId, setSelectedAppId] = useState<string>('')
  const [showSettings, setShowSettings] = useState(false)
  const [showAddApp, setShowAddApp] = useState(false)
  const [branch, setBranch] = useState('')
  const [preview, setPreview] = useState(false)

  const selectedApp = useMemo(() => {
    if (config.apps.length === 0) return undefined
    return config.apps.find((a) => a.appId === selectedAppId) ?? config.apps[0]
  }, [config.apps, selectedAppId])

  const needsSetup = !config.credentials.username || !config.credentials.password
  const canUpload = !needsSetup && Boolean(selectedApp?.depots.every((d) => d.contentPath))

  const handleAddApp = (app: SteamApp): void => {
    saveConfig({ ...config, apps: [...config.apps, app] })
    setSelectedAppId(app.appId)
    setShowAddApp(false)
  }

  const handleRemoveSelectedApp = (): void => {
    if (!selectedApp) return
    saveConfig({
      ...config,
      apps: config.apps.filter((a) => a.appId !== selectedApp.appId)
    })
    setSelectedAppId('')
  }

  const handleUpdateDepot = (oldId: string, next: Depot): void => {
    if (!selectedApp) return
    saveConfig({
      ...config,
      apps: config.apps.map((a) =>
        a.appId === selectedApp.appId
          ? { ...a, depots: a.depots.map((d) => (d.id === oldId ? next : d)) }
          : a
      )
    })
  }

  const handleAddDepot = (): void => {
    if (!selectedApp) return
    const usedIds = new Set(selectedApp.depots.map((d) => d.id))
    let nextNumeric = Number(selectedApp.appId) + selectedApp.depots.length + 1
    while (usedIds.has(String(nextNumeric))) nextNumeric += 1

    saveConfig({
      ...config,
      apps: config.apps.map((a) =>
        a.appId === selectedApp.appId
          ? { ...a, depots: [...a.depots, { id: String(nextNumeric), contentPath: '' }] }
          : a
      )
    })
  }

  const handleRemoveDepot = (depotId: string): void => {
    if (!selectedApp) return
    if (selectedApp.depots.length <= 1) return
    saveConfig({
      ...config,
      apps: config.apps.map((a) =>
        a.appId === selectedApp.appId
          ? { ...a, depots: a.depots.filter((d) => d.id !== depotId) }
          : a
      )
    })
  }

  const handleUpload = async (): Promise<void> => {
    if (!selectedApp) return
    await upload({ appId: selectedApp.appId, branch, preview })
  }

  return (
    <div className="flex flex-col h-screen bg-[#0f0f0f] text-[#e8e8e8]">
      <AppHeader onOpenSettings={() => setShowSettings(true)} />

      {needsSetup && <SetupBanner onClick={() => setShowSettings(true)} />}

      <div className="flex flex-col flex-1 overflow-hidden px-4 pb-2 gap-3">
        <AppSelector
          apps={config.apps}
          selectedAppId={selectedApp?.appId ?? ''}
          onSelect={setSelectedAppId}
          onAddApp={() => setShowAddApp(true)}
        />

        {selectedApp && (
          <>
            <DepotPanel
              depots={selectedApp.depots}
              onUpdateDepot={handleUpdateDepot}
              onAddDepot={handleAddDepot}
              onRemoveDepot={handleRemoveDepot}
            />
            <UploadControls
              branch={branch}
              preview={preview}
              uploading={status === 'uploading'}
              canUpload={canUpload}
              onBranchChange={setBranch}
              onPreviewChange={setPreview}
              onUpload={handleUpload}
            />
          </>
        )}

        {config.apps.length === 0 && <EmptyState onAddApp={() => setShowAddApp(true)} />}

        <LogPanel logs={logs} status={status} onClear={clearLogs} />
      </div>

      <Footer build={buildInfo} sdk={sdkInfo} />

      {showSettings && (
        <SettingsModal
          config={config}
          sdk={sdkInfo}
          checkingSdk={sdkChecking}
          onSave={(c) => {
            saveConfig(c)
            setShowSettings(false)
          }}
          onClose={() => setShowSettings(false)}
          onRemoveSelectedApp={selectedApp ? handleRemoveSelectedApp : undefined}
          onCheckSdkUpdate={checkForUpdates}
        />
      )}

      {showAddApp && <AddAppModal onAdd={handleAddApp} onClose={() => setShowAddApp(false)} />}
    </div>
  )
}
