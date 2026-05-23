import type { BuildInfo, SdkInfo } from '../../../shared/types'

interface FooterProps {
  build: BuildInfo | null
  sdk: SdkInfo | null
}

export function Footer({ build, sdk }: FooterProps): JSX.Element {
  return (
    <footer className="flex items-center justify-between px-4 pb-3 pt-1">
      <span className="text-[10px] text-[#2a2a2a] font-mono">
        {build ? `v${build.version} · build ${build.buildId}` : ''}
      </span>
      <span className="text-[10px] text-[#2a2a2a] font-mono">
        {sdk?.version
          ? `SteamCMD ${sdk.version}${sdk.isBundled ? ' · bundled' : ''}`
          : sdk
            ? `SteamCMD ${sdk.isBundled ? 'bundled' : 'custom'}`
            : ''}
      </span>
    </footer>
  )
}
