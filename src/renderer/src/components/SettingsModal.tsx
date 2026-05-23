import { useState } from 'react'
import type { AppConfig, SdkInfo } from '../../../shared/types'
import { Modal } from './Modal'

interface SettingsModalProps {
  config: AppConfig
  sdk: SdkInfo | null
  checkingSdk: boolean
  onSave: (config: AppConfig) => void
  onClose: () => void
  onRemoveSelectedApp?: () => void
  onCheckSdkUpdate: () => void
}

export function SettingsModal({
  config,
  sdk,
  checkingSdk,
  onSave,
  onClose,
  onRemoveSelectedApp,
  onCheckSdkUpdate
}: SettingsModalProps): JSX.Element {
  const [username, setUsername] = useState(config.credentials.username)
  const [password, setPassword] = useState(config.credentials.password)
  const [showPassword, setShowPassword] = useState(false)

  const handleSave = (): void => {
    onSave({
      ...config,
      credentials: { username, password }
    })
  }

  return (
    <Modal
      title="Settings"
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
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl bg-[#3f1f0a] hover:bg-[#5c3017] border border-[#5c2f10] text-sm text-[#ff8c42] transition-colors"
          >
            Save
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <Section title="Steam Account">
          <Field label="Username">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your_steam_username"
              className="w-full bg-[#0f0f0f] border border-[#1e1e1e] rounded-lg px-3 py-2.5 text-sm text-[#ccc] placeholder-[#666] focus:outline-none focus:border-[#333] transition-colors"
            />
          </Field>
          <Field label="Password" hint="Encrypted locally with your OS keychain">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0f0f0f] border border-[#1e1e1e] rounded-lg px-3 py-2.5 pr-10 text-sm text-[#ccc] placeholder-[#666] focus:outline-none focus:border-[#333] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999] hover:text-[#bbb] transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </Field>
        </Section>

        <Section title="SteamCMD">
          <div className="bg-[#0f0f0f] border border-[#1e1e1e] rounded-lg px-4 py-3 flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-[#888]">
                {sdk?.isBundled ? 'Bundled with Steam Uploader' : 'Custom binary'}
              </span>
              <span className="text-[10px] text-[#999] font-mono">
                {sdk?.version ? `Version ${sdk.version}` : 'Version not yet detected'}
              </span>
            </div>
            <button
              onClick={onCheckSdkUpdate}
              disabled={checkingSdk}
              className="text-xs px-3 py-1.5 rounded-md border border-[#2a2a2a] text-[#888] hover:text-white hover:border-[#444] disabled:opacity-50 disabled:cursor-wait transition-colors"
            >
              {checkingSdk ? 'Checking…' : 'Check for updates'}
            </button>
          </div>
          <p className="text-[10px] text-[#888] mt-2 px-1">
            SteamCMD auto-updates against Valve's servers on every run.
          </p>
        </Section>

        {onRemoveSelectedApp && (
          <div className="pt-1 border-t border-[#1e1e1e]">
            <button
              onClick={() => {
                onRemoveSelectedApp()
                onClose()
              }}
              className="text-xs text-[#6b2020] hover:text-[#f44336] transition-colors"
            >
              Remove current app from list
            </button>
          </div>
        )}
      </div>
    </Modal>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }): JSX.Element {
  return (
    <div>
      <div className="text-xs text-[#aaa] uppercase tracking-wider mb-3">{title}</div>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  )
}

interface FieldProps {
  label: string
  hint?: string
  children: React.ReactNode
}

function Field({ label, hint, children }: FieldProps): JSX.Element {
  return (
    <div>
      <label className="text-xs text-[#999] block mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-[10px] text-[#888] mt-1.5">{hint}</p>}
    </div>
  )
}

function EyeIcon(): JSX.Element {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function EyeOffIcon(): JSX.Element {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path
        d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M1 1l22 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
