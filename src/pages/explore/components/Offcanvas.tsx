import { Offcanvas as RBOffcanvas } from "react-bootstrap"
import styled from "styled-components"

type Props = {
  show: boolean
  placement: "start" | "end"
  onClose: () => void
  header: JSX.Element
  children: JSX.Element
}

export function Offcanvas({
  show,
  placement,
  onClose = () => null,
  header = <></>,
  children
}: Props) {
  return (
    <StyledOffcanvas show={show} onHide={onClose} placement={placement} backdrop={true}>
      <RBOffcanvas.Header closeButton>
        {header}
      </RBOffcanvas.Header>
      <RBOffcanvas.Body>
        {children}
      </RBOffcanvas.Body>
    </StyledOffcanvas>
  )
}

const StyledOffcanvas = styled(RBOffcanvas)`
  background: #33393F;
  box-shadow: rgba(0, 0, 0, 0.3) -6px 0px 20px 0px;
  .offcanvas-header .btn-close {
    margin: unset;
  }
  .offcanvas-body {
    overflow-x: hidden;
    overflow-y: hidden;
  }
`
