import styled from 'styled-components'
import { ApiState } from '../kusama/KusamaContext'
import { LoadingSpinner } from '../pages/explore/components/LoadingSpinner'

const LoadingContainer = ({ state }: any) => {
  return state.apiState !== ApiState.ready ? (
    <StyledLoadingContainer>
      <p className="text-center">Connecting to Kusama network...</p>
      <LoadingSpinner />
      {state.apiError && (
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
  z-index: 2;
  width: 300px;
  top: calc(50% - 70px);
  left: calc(50% - 150px);
  padding: 10px;
  padding-bottom: 15px;
  background-color: rgba(0, 0, 0, 0.75);
  border-radius: 10px;
`

export { LoadingContainer }
