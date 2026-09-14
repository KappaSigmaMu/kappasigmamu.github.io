import { Route, Routes } from 'react-router'
import { ExamplesPage } from './ExamplesPage'
import { GalleryPage } from './GalleryPage'
import { NextHeadPage } from './NextHeadPage'
import { RulesPage } from './RulesPage'
import { SubmitPage } from './SubmitPage'
import { NavigateWithQuery } from '@/components/NavigateWithQuery'

const ProofOfInkPage = (): JSX.Element => (
  <Routes>
    <Route path="/" element={<NavigateWithQuery to="/explore/poi/examples" replace />} />
    <Route path="/examples" element={<ExamplesPage />} />
    <Route path="/rules" element={<RulesPage />} />
    <Route path="/gallery" element={<GalleryPage />} />
    <Route path="/next-head" element={<NextHeadPage />} />
    <Route path="/submit" element={<SubmitPage />} />
  </Routes>
)

export { ProofOfInkPage }
