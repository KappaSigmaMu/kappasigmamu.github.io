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
  // Full orbit sphere: the landing canary clamps polar angle to a band around the horizon,
  // which makes a top-down view of the spread wings impossible.
  minPolarAngle: 0,
  maxPolarAngle: Math.PI,
  // Fly-static export may not use the same material name / node scale as the rest GLB.
  meshScale: false,
  model: {
    ...baseModel,
    wireframe: false,
    // Wing feathers are single-sided cards; without this they are black from below.
    doubleSided: true,
    // trimesh export often uses a default material name; Model falls back safely if missing.
    material: 'Material',
    scale: 1
  }
}

if (isMobile) {
  gameCanaryConfig.cameraPosition = [9, 3.2, 9]
} else {
  gameCanaryConfig.cameraPosition = [4, 2, 8]
}

// Sandbox-only: ?cam=x,y,z overrides the camera so a given angle can be reviewed in the
// real renderer without an edit-and-reload. Blender previews hid holes that show here.
const camParam = new URLSearchParams(window.location.search).get('cam')
if (camParam) {
  const parts = camParam.split(',').map(Number)
  if (parts.length === 3 && parts.every((n) => Number.isFinite(n))) {
    gameCanaryConfig.cameraPosition = parts as [number, number, number]
  }
}

const GamePage = () => {
  window.scrollTo(0, 0)

  return (
    <FullPage>
      <CanvasHost>
        <ThreeCanary objectUrl={GAME_OBJECT_URL} config={gameCanaryConfig} />
      </CanvasHost>
      <Hint>Game sandbox — fly-rest pose: fanned feather wings, legs hanging with toes down.</Hint>
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
