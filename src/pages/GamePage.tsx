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
 * Fly-rest pose built by rigid-body rotation of the artist's own parts
 * (scripts/canary-rig/pose_fly.py): wings spread + twisted flat, feather cards and tail
 * fanned, legs tucked, body pitched into a flight attitude. Every part moves rigidly, so
 * the canary keeps its exact original shape — nothing is deformed.
 */
const GAME_OBJECT_URL = './static/canary-fly-static.glb'

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
  gameCanaryConfig.cameraPosition = [4.5, 1.6, 4.5]
} else {
  gameCanaryConfig.cameraPosition = [3.4, 1.8, 3.4]
}

const GamePage = () => {
  window.scrollTo(0, 0)

  return (
    <FullPage>
      <CanvasHost>
        <ThreeCanary objectUrl={GAME_OBJECT_URL} config={gameCanaryConfig} />
      </CanvasHost>
      <Hint>Game sandbox — fly-rest pose: wings spread + twisted, tail fanned, legs tucked.</Hint>
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
