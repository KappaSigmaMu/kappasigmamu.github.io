import { isMobile } from 'react-device-detect'
import styled from 'styled-components'
import { ThreeCanary, defaultConfig, type CanaryConfig } from '@/canary-component'

/**
 * Bare canary sandbox for the fly-animation pipeline.
 * No Society UI, no post-FX, no wireframe, no member nodes — grid + model only.
 * Static lights; mesh is the CLI fly-pose export (CP2) when present.
 */
const baseModel = (defaultConfig.canary.model ?? {}) as Record<string, unknown>

/**
 * Rest canary only until we have a non-destructive fly pose.
 * (CLI hinge deform butchered the mesh — do not load canary-fly-static from that path.)
 */
const GAME_OBJECT_URL = './static/canary.glb'

const gameCanaryConfig: CanaryConfig = {
  ...defaultConfig.canary,
  showPoints: false,
  showParticles: false,
  showEffects: false,
  showGrid: true,
  animateLights: false,
  // Fly-static export may not use the same material name / node scale as the rest GLB.
  meshScale: false,
  model: {
    ...baseModel,
    wireframe: false,
    // trimesh export often uses a default material name; Model falls back safely if missing.
    material: 'Material',
    scale: 1
  }
}

if (isMobile) {
  gameCanaryConfig.cameraPosition = [3, 1.2, 3]
} else {
  gameCanaryConfig.cameraPosition = [2.2, 1.6, 2.2]
}

const GamePage = () => {
  window.scrollTo(0, 0)

  return (
    <FullPage>
      <CanvasHost>
        <ThreeCanary objectUrl={GAME_OBJECT_URL} config={gameCanaryConfig} />
      </CanvasHost>
      <Hint>Game sandbox — original canary (rest). Fly pose on hold after bad CLI deform.</Hint>
    </FullPage>
  )
}

const FullPage = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.black};
`

const CanvasHost = styled.div`
  position: absolute;
  inset: 0;
`

const Hint = styled.p`
  position: absolute;
  left: 1rem;
  bottom: 1rem;
  z-index: 2;
  margin: 0;
  padding: 0.5rem 0.75rem;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.white};
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid ${({ theme }) => theme.colors.grey};
  pointer-events: none;
`

export { GamePage }
