/* eslint-disable react/no-unknown-property */
/* eslint-disable react/prop-types */
/**
 * Animated canary stage for the /game sandbox.
 *
 * Deliberately plain JS, like src/canary-component/*.js, and excluded from type-checking in
 * tsconfig with a hand-written CanaryStage.d.ts beside it. Importing @react-three/drei from a
 * .tsx pulls in enough type surface to tip styled-components' unions past TypeScript's limit,
 * reporting TS2590 in an unrelated file (src/components/base/index.tsx). CRA blocks the dev
 * bundle on that, so the page hangs with nothing shown and no error in the browser.
 *
 * Two models, because they are rigged differently:
 *
 *   fly / glide    Anything World clips moved onto the current fly-rest mesh by
 *                  scripts/canary-rig/retarget.py. Its rest pose is vertex-identical to the
 *                  static export, so 'static' is that same model with no clip playing.
 *   idle/walk/hop  The archived canary-component clips, which animate the ORIGINAL canary.
 *                  They keep that model, fitted into this scene by
 *                  scripts/canary-rig/fit_legacy_anims.py.
 */
import { Grid, OrbitControls, PerspectiveCamera, useAnimations, useGLTF } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Suspense, useEffect, useRef } from 'react'

const FLY_URL = './static/canary-fly-anim.glb'
// The archived files each hold exactly one clip, under a name like 'rig|rig|idle|rig|idle'.
// FIRST means "whatever single clip this file carries" rather than hard-coding those names.
const FIRST = 'FIRST_CLIP'

const SOURCES = {
  static: [FLY_URL, null],
  fly: [FLY_URL, 'fly'],
  glide: [FLY_URL, 'glide'],
  idle: ['./static/canary-idle.glb', FIRST],
  walk: ['./static/canary-walk.glb', FIRST],
  hop: ['./static/canary-hop.glb', FIRST]
}

const Model = ({ url, clip }) => {
  const group = useRef(null)
  const { scene, animations } = useGLTF(url)
  const { actions, names } = useAnimations(animations, group)

  useEffect(() => {
    const name = clip === FIRST ? names[0] : clip
    const action = name ? actions[name] : undefined
    if (!action) {
      // Stop everything so 'static' shows the rest pose, not wherever a clip left off.
      Object.values(actions).forEach((a) => a && a.stop())
      return undefined
    }
    action.reset().fadeIn(0.3).play()
    return () => {
      action.fadeOut(0.3)
    }
  }, [actions, names, clip])

  return (
    <group ref={group}>
      <primitive object={scene} />
    </group>
  )
}

const CanaryStage = ({ clip, cameraPosition }) => {
  const [url, name] = SOURCES[clip] || SOURCES.static

  return (
    /* Canvas configured like src/canary-component/ThreeCanary.js, which is known to work here.
       The camera is a <PerspectiveCamera makeDefault> CHILD rather than the <Canvas camera>
       prop, matching that component. */
    <Canvas shadows dpr={[1, 2]} performance={{ min: 0.1 }}>
      <PerspectiveCamera makeDefault position={cameraPosition} near={0.1} far={1000} zoom={1} />

      <ambientLight intensity={1.2} />
      <directionalLight position={[5, 8, 5]} intensity={2.2} />
      <directionalLight position={[-6, 2, -4]} intensity={0.8} />

      {/* Boundary INSIDE the Canvas: useGLTF suspends, and with the boundary outside it the
          whole scene subtree suspends along with it — the canvas and its WebGL context exist
          but nothing ever paints, not even the lights or the grid.
          The key remounts cleanly when switching between the two models. */}
      <Suspense fallback={null}>
        <Model key={url} url={url} clip={name} />
      </Suspense>

      <Grid
        args={[40, 40]}
        cellSize={0.5}
        sectionSize={2.5}
        cellColor="#3a3a44"
        sectionColor="#55555f"
        infiniteGrid
        fadeDistance={38}
        position={[0, -1.2, 0]}
      />

      {/* Full orbit sphere: a clamped polar angle makes a top-down view of the spread wings
          impossible, and that is the view most defects show up in. */}
      <OrbitControls minPolarAngle={0} maxPolarAngle={Math.PI} />
    </Canvas>
  )
}

Object.values(SOURCES).forEach(([url]) => useGLTF.preload(url))

export { CanaryStage }
