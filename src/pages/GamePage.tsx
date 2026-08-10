import { useState } from 'react'
import { isMobile } from 'react-device-detect'
import styled from 'styled-components'
import { CanaryStage } from './game/CanaryStage'

/**
 * Bare canary sandbox for the fly-animation pipeline: grid + model only, no Society UI.
 *
 * The three.js work lives in ./game/CanaryStage.js and is deliberately untyped — see the note
 * at the top of that file for why importing drei from a .tsx breaks an unrelated build.
 */
type Clip = 'static' | 'fly' | 'glide' | 'idle' | 'walk' | 'hop'

const CLIPS: Clip[] = ['static', 'fly', 'glide', 'idle', 'walk', 'hop']

const DEFAULT_CAMERA: [number, number, number] = isMobile ? [9, 3.2, 9] : [4, 2, 8]

// Sandbox-only: ?cam=x,y,z reviews a given angle without an edit-and-reload.
// Blender previews have hidden defects that only show up in this renderer.
const readCamera = (): [number, number, number] => {
  const param = new URLSearchParams(window.location.search).get('cam')
  if (!param) return DEFAULT_CAMERA
  const parts = param.split(',').map(Number)
  return parts.length === 3 && parts.every((n) => Number.isFinite(n))
    ? (parts as [number, number, number])
    : DEFAULT_CAMERA
}

const CAMERA = readCamera()

const GamePage = () => {
  window.scrollTo(0, 0)
  const [clip, setClip] = useState<Clip>('fly')

  return (
    <FullPage>
      <CanvasHost>
        <CanaryStage clip={clip} cameraPosition={CAMERA} />
      </CanvasHost>

      <Switcher>
        {CLIPS.map((name) => (
          <ClipButton key={name} data-active={clip === name} onClick={() => setClip(name)}>
            {name}
          </ClipButton>
        ))}
      </Switcher>

      <Hint>
        Game sandbox — fly/glide use the new fly-rest mesh; idle/walk/hop are the archived
        canary-component clips on the original model.
      </Hint>
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

const Switcher = styled.div`
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 2;
  display: flex;
  gap: 0.5rem;
`

/**
 * Active state rides on a data-attribute rather than a styled-components generic.
 *
 * `styled.button<{ $active: boolean }>` builds a union big enough to trip TS2590 ("union type
 * too complex") in this project's styled-components setup, and the symptom is not a type error
 * you can see — the page renders, the buttons appear, and the WebGL canvas silently never
 * paints a single pixel. Bisecting from the working page pinned it to exactly this generic.
 */
const ClipButton = styled.button`
  padding: 0.45rem 1.1rem;
  font-size: 0.85rem;
  text-transform: capitalize;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.white};
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid ${({ theme }) => theme.colors.grey};

  &[data-active='true'] {
    color: ${({ theme }) => theme.colors.black};
    background: ${({ theme }) => theme.colors.white};
  }
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
