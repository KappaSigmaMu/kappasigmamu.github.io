import type { FC } from 'react'

/**
 * Declared rather than inferred, matching src/canary-component/index.d.ts.
 *
 * The implementation is plain JS and excluded from type-checking in tsconfig, because letting
 * TypeScript walk into @react-three/drei tips styled-components' unions over its complexity
 * limit and reports TS2590 in an unrelated file (src/components/base/index.tsx). CRA blocks
 * the dev bundle on that, and the browser just hangs with nothing shown.
 */
export type Clip = 'static' | 'fly' | 'glide' | 'idle' | 'walk' | 'hop'

export type CanaryStageProps = {
  clip: Clip
  cameraPosition: [number, number, number]
}

export const CanaryStage: FC<CanaryStageProps>
