import { ApiPromise } from '@polkadot/api'
import { Route, Routes } from 'react-router-dom'
import { ExamplesPage } from './ExamplesPage'
import { GalleryPage } from './GalleryPage'
import { NextHeadPage } from './NextHeadPage'
import { RulesPage } from './RulesPage'
import { SubmitPage } from './SubmitPage'
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
        <Route path="/next-head" element={<NextHeadPage api={api} />} />
        <Route path="/submit" element={<SubmitPage api={api} />} />
      </Routes>
    </>
  )
}

export { ProofOfInkPage }
