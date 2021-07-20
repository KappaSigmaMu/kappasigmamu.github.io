import ThreeCanary from 'canary-component'

export const Canary = () => (
  <ThreeCanary objectUrl={`${process.env.PUBLIC_URL}/assets/canary.obj`} />
)
