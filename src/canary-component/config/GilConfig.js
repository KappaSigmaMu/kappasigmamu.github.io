// @ts-nocheck
const gilConfig = {
  objectUrl: "/assets/gil.glb",
  nodeCoords: "Baked_GIL_BUSTO003_1.geometry.attributes.position",
  nodeSigns: [-1, 1, -1],
  nodeScale: 1.8,
  nodeGroupScale: 0.1,
  meshColorIndex: "black",
  meshScale: null,
  debug: false,
  model: {
    material: "MatWireframe",
    scale: 0.2,
    metalness: 0.1,
    roughness: 0.1,
    opacity: 0.1,
    color: "black",
  },
  gridPosition: [0, -0.35, 0, 0],
  cameraPosition: [-1, 1.5, 3.75],
  targetPosition: [2, 0.25, -0.15],
  pointColorIndex: {
    primary: "ciano",
    hovered: "white",
    active: "white",
  },
  pointLight: {
    position: [0, 5, 0],
    intensity: [20, 55, 55],
    distance: 15,
    color: ["ciano", "magenta", "white"],
  },
  bloom: {
    kernelSize: 1,
    luminanceThreshold: 0.1,
    luminanceSmoothing: 0.05,
    intensity: 0.5,
  },
  glitch: {
    delay: [20, 30],
    duration: [0.3, 0.5],
    strength: [0.1, 0.3],
  },
}

export { gilConfig }
