import { ApiPromise } from '@polkadot/api'
import { Route, Routes } from 'react-router-dom'
import { ExamplesPage } from './ExamplesPage'
import { GalleryPage } from './GalleryPage'
import { RulesPage } from './RulesPage'
import { NavigateWithQuery } from '../../../components/NavigateWithQuery'

type ProofOfInkPageProps = {
  api: ApiPromise | null
}

const ProofOfInkPage = ({ api }: ProofOfInkPageProps): JSX.Element => {
  return (
    <>
      <Routes>
        <Route path="/" element={<NavigateWithQuery to="/explore/poi/examples" replace />} />
        <Route path="/examples" element={<ExamplesPage api={api} />} />
        <Route path="/rules" element={<RulesPage />} />
        <Route path="/gallery" element={<GalleryPage api={api} />} />
      </Routes>
    </>
  )
}

export { ProofOfInkPage }
