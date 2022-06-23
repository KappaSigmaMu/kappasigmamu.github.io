import { useRef, useState } from "react"
import { Overlay, Tooltip } from "react-bootstrap"
import CopyIcon from "../static/copy-icon.svg"

export function CopyButton({ content }: { content: string }): JSX.Element {
  const imgRef = useRef(null)
  const [showCopiedSuccessfullyTooltip, setShowCopiedSuccessfullyTooltip] = useState(false)
  const onClickCopyButton = () => {
    navigator.clipboard.writeText(content)
    setShowCopiedSuccessfullyTooltip(true)
    setTimeout(() => setShowCopiedSuccessfullyTooltip(false), 1000)
  }
  return (<>
    <img src={CopyIcon}
        ref={imgRef}
        className="mx-auto"
        style={{ cursor: "pointer", width: "36pt", height: "36pt" }}
        onClick={onClickCopyButton} />
    <Overlay 
      target={imgRef.current} 
      show={showCopiedSuccessfullyTooltip} 
      placement="right">
        {(props) => <Tooltip {...props}>Copied to clipboard!</Tooltip>}
    </Overlay>
  </>)
}
