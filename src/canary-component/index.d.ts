import type { FC } from 'react'

export type CanaryNode = {
  hash: string
  name: string
  level?: string
}

export type CanaryConfig = Record<string, unknown>

export type ThreeCanaryProps = {
  objectUrl?: string
  nodes?: CanaryNode[]
  onNodeClick?: (nodeId: string) => void
  config?: CanaryConfig
}

export const ThreeCanary: FC<ThreeCanaryProps>

export const defaultConfig: {
  canary: CanaryConfig
  gil: CanaryConfig
}
