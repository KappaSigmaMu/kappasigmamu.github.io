import styled from 'styled-components'
import { ChainState, type ChainConnection } from '@/chain/ChainProvider'
import { LoadingSpinner } from '@/pages/explore/components/LoadingSpinner'

const LoadingContainer = ({ state }: { state: ChainConnection }) => {
  return state.state !== ChainState.ready ? (
    <StyledLoadingContainer>
      <p className="text-center">Connecting to Kusama network...</p>
      <LoadingSpinner />
      {state.error && (
        <p className="text-center m-0 mt-3">
          <small>The RPC provider is not responding, try changing providers in Settings.</small>
        </p>
      )}
    </StyledLoadingContainer>
  ) : (
    <></>
  )
}

const StyledLoadingContainer = styled.div`
  position: absolute;
  z-index: 2147483647;
  width: 300px;
  top: calc(50% - 70px);
  left: calc(50% - 150px);
  padding: 10px;
  padding-bottom: 15px;
  background-color: rgba(0, 0, 0, 0.8);
  border-radius: 10px;
`

export { LoadingContainer }
