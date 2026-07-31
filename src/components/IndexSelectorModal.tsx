import { useEffect, useMemo, useState } from 'react'
import { Badge, Button, Modal, OverlayTrigger, Popover, Spinner } from 'react-bootstrap'
import {
  FaAnglesLeft,
  FaAnglesRight,
  FaCheck,
  FaChevronLeft,
  FaChevronRight,
  FaCircleQuestion,
  FaXmark
} from 'react-icons/fa6'
import styled from 'styled-components'
import { useAccount } from '@/account/AccountContext'
import { useAssetHub } from '@/chain/ChainProvider'
import { useChainQuery } from '@/chain/hooks'
import {
  claimIndexTx,
  clearIndicesCache,
  freeIndexTx,
  freezeIndexTx,
  getClaimedIndices,
  getIndexDeposit,
  INDICES_PAGE_SIZE,
  pageRange,
  type IndexAssignment
} from '@/chain/indices'
import { submitTx, type StatusChangeHandler } from '@/chain/society/tx'
import { accountIndexToString, isSameAddress } from '@/chain/ss58'
import { FormatBalance } from '@/components/FormatBalance'
import { toastByStatus } from '@/pages/explore/helpers'

type IndexSelectorModalProps = {
  show: boolean
  onHide: () => void
}

type ListItem = {
  id: number
  short: string
  claimed: IndexAssignment | undefined
}

/** Highest page for u32 indices with INDICES_PAGE_SIZE entries per page. */
const MAX_PAGE = Math.floor(0xffffffff / INDICES_PAGE_SIZE)

const TX_TOAST_ID = 'index-selector-tx'

const IndexSelectorModal = ({ show, onHide }: IndexSelectorModalProps) => {
  const { api } = useAssetHub()
  const { activeAccount, polkadotSigner, isSignerLoading } = useAccount()
  const [page, setPage] = useState(0)
  const [pageInput, setPageInput] = useState('1')
  const [onlyAvailable, setOnlyAvailable] = useState(true)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [claimedIndex, setClaimedIndex] = useState<number | null>(null)
  const [claimLoading, setClaimLoading] = useState(false)
  const [freezeLoading, setFreezeLoading] = useState(false)
  const [freeLoading, setFreeLoading] = useState(false)

  const claimedState = useChainQuery(() => (api ? getClaimedIndices(api) : undefined), [api])
  const depositState = useChainQuery(() => (api ? getIndexDeposit(api) : undefined), [api])

  const ownFrozen = useMemo(() => {
    if (!activeAccount?.address || !claimedState.data) return undefined
    for (const [index, assignment] of claimedState.data) {
      if (assignment.frozen && isSameAddress(assignment.owner, activeAccount.address)) {
        return { index, short: accountIndexToString(index) }
      }
    }
    return undefined
  }, [activeAccount?.address, claimedState.data])

  const ownIndexId = useMemo(() => {
    if (!activeAccount?.address || !claimedState.data) return undefined
    for (const [index, assignment] of claimedState.data) {
      if (isSameAddress(assignment.owner, activeAccount.address)) return index
    }
    return undefined
  }, [activeAccount?.address, claimedState.data])

  const ownItem = useMemo((): ListItem | undefined => {
    if (ownIndexId === undefined) return undefined
    return { id: ownIndexId, short: accountIndexToString(ownIndexId), claimed: claimedState.data?.get(ownIndexId) }
  }, [ownIndexId, claimedState.data])

  const maxClaimedPage = useMemo(() => {
    if (!claimedState.data || claimedState.data.size === 0) return 0
    let maxId = 0
    claimedState.data.forEach((_, index) => {
      if (index > maxId) maxId = index
    })
    return Math.floor(maxId / INDICES_PAGE_SIZE)
  }, [claimedState.data])

  // Soft last page for » : highest claimed index page (falls back to 0).
  const lastPage = maxClaimedPage

  const { start, end } = pageRange(page)
  const items = useMemo((): ListItem[] => {
    const claimed = claimedState.data
    const result: ListItem[] = []
    for (let id = start; id <= end; id += 1) {
      if (id === ownIndexId) continue
      const assignment = claimed?.get(id)
      const isOwnAssignment = Boolean(assignment && isSameAddress(assignment.owner, activeAccount?.address))
      if (onlyAvailable && assignment && !isOwnAssignment) continue
      result.push({
        id,
        short: accountIndexToString(id),
        claimed: assignment
      })
    }
    return result
  }, [activeAccount?.address, end, onlyAvailable, ownIndexId, start, claimedState.data])

  useEffect(() => {
    if (!onlyAvailable || selectedIndex === null || !claimedState.data) return
    const assignment = claimedState.data.get(selectedIndex)
    if (assignment && !isSameAddress(assignment.owner, activeAccount?.address)) setSelectedIndex(null)
  }, [activeAccount?.address, onlyAvailable, selectedIndex, claimedState.data])

  useEffect(() => {
    setPageInput(String(page + 1))
  }, [page])

  const selectedAssignment = selectedIndex === null ? undefined : claimedState.data?.get(selectedIndex)
  const isSelectedAvailable = selectedIndex !== null && !selectedAssignment
  const ownsSelectedUnfrozen =
    selectedIndex !== null &&
    Boolean(selectedAssignment) &&
    !selectedAssignment!.frozen &&
    isSameAddress(selectedAssignment!.owner, activeAccount?.address)
  const busy = claimLoading || freezeLoading || freeLoading || isSignerLoading
  const canClaim = Boolean(api && polkadotSigner && isSelectedAvailable && !busy)
  const ownsSelected = selectedIndex !== null && (claimedIndex === selectedIndex || ownsSelectedUnfrozen)
  const canFreeze = Boolean(api && polkadotSigner && ownsSelected && !busy)
  const canFree = Boolean(api && polkadotSigner && ownsSelected && !busy)
  const isFrozenByOther = Boolean(selectedAssignment?.frozen)

  const goToPage = (nextPage: number) => {
    const next = Math.min(MAX_PAGE, Math.max(0, nextPage))
    setPage(next)
    setSelectedIndex(null)
  }

  const submitGoToPage = () => {
    const parsed = Number.parseInt(pageInput.replace(/[,\s]/g, ''), 10)
    if (!Number.isFinite(parsed) || parsed < 1) {
      setPageInput(String(page + 1))
      return
    }
    goToPage(parsed - 1)
  }

  const refreshIndices = () => {
    if (api) clearIndicesCache(api)
    claimedState.refetch()
  }

  const handleClaim = async () => {
    if (!api || selectedIndex === null || !canClaim) return

    const onStatusChange: StatusChangeHandler = ({ loading, message, status }) => {
      setClaimLoading(Boolean(loading))
      toastByStatus[status](message, { id: TX_TOAST_ID })
      if (!loading && status === 'success') {
        setClaimedIndex(selectedIndex)
        refreshIndices()
      }
    }

    try {
      await submitTx(claimIndexTx(api, selectedIndex), polkadotSigner, {
        finalizedText: `Index ${selectedIndex} claimed successfully.`,
        waitingText: 'Claim submitted. Waiting for confirmation...',
        onStatusChange
      })
    } catch (error) {
      console.error(error)
      toastByStatus.error(error instanceof Error ? error.message : String(error), { id: TX_TOAST_ID })
      setClaimLoading(false)
    }
  }

  const handleFreeze = async () => {
    if (!api || selectedIndex === null || !canFreeze) return

    const onStatusChange: StatusChangeHandler = ({ loading, message, status }) => {
      setFreezeLoading(Boolean(loading))
      toastByStatus[status](message, { id: TX_TOAST_ID })
      if (!loading && status === 'success') {
        setClaimedIndex(null)
        refreshIndices()
      }
    }

    try {
      await submitTx(freezeIndexTx(api, selectedIndex), polkadotSigner, {
        finalizedText: `Index ${selectedIndex} frozen permanently.`,
        waitingText: 'Freeze submitted. Waiting for confirmation...',
        onStatusChange
      })
    } catch (error) {
      console.error(error)
      toastByStatus.error(error instanceof Error ? error.message : String(error), { id: TX_TOAST_ID })
      setFreezeLoading(false)
    }
  }

  const handleFree = async () => {
    if (!api || selectedIndex === null || !canFree) return

    const onStatusChange: StatusChangeHandler = ({ loading, message, status }) => {
      setFreeLoading(Boolean(loading))
      toastByStatus[status](message, { id: TX_TOAST_ID })
      if (!loading && status === 'success') {
        setClaimedIndex(null)
        refreshIndices()
      }
    }

    try {
      await submitTx(freeIndexTx(api, selectedIndex), polkadotSigner, {
        finalizedText: `Index ${selectedIndex} freed.`,
        waitingText: 'Free submitted. Waiting for confirmation...',
        onStatusChange
      })
    } catch (error) {
      console.error(error)
      toastByStatus.error(error instanceof Error ? error.message : String(error), { id: TX_TOAST_ID })
      setFreeLoading(false)
    }
  }

  const handleHide = () => {
    setSelectedIndex(null)
    setClaimedIndex(null)
    setPage(0)
    setPageInput('1')
    setOnlyAvailable(true)
    onHide()
  }

  const walletReady = Boolean(activeAccount && polkadotSigner)
  const hasFrozenIndex = Boolean(ownFrozen)

  const renderIndexRow = (item: ListItem) => {
    const isSelected = selectedIndex === item.id
    const isClaimed = Boolean(item.claimed)
    const isOwn = isClaimed && isSameAddress(item.claimed!.owner, activeAccount?.address)
    return (
      <IndexRow
        key={item.id}
        type="button"
        $selected={isSelected}
        $claimed={isClaimed}
        $own={isOwn}
        onClick={() => setSelectedIndex(item.id)}
        data-test={`index-row-${item.id}`}
      >
        <IndexMain>
          <IndexShort title={item.short}>{item.short}</IndexShort>
          <IndexId>ID: {item.id}</IndexId>
        </IndexMain>
        {isClaimed ? (
          <BadgeGroup>
            {isOwn && (
              <StatusBadge pill className="p-2" $tone="pink">
                Yours
              </StatusBadge>
            )}
            {item.claimed!.frozen ? (
              <Badge pill bg="dark" className="p-2">
                Frozen
              </Badge>
            ) : (
              <StatusBadge pill className="p-2" $tone="yellow">
                Claimed
              </StatusBadge>
            )}
          </BadgeGroup>
        ) : (
          <StatusBadge pill className="p-2" $tone="cyan">
            Available
          </StatusBadge>
        )}
      </IndexRow>
    )
  }

  return (
    <StyledModal
      show={show}
      onHide={handleHide}
      centered
      scrollable
      animation={false}
      enforceFocus={false}
      restoreFocus={false}
      data-test="index-selector-modal"
    >
      <StyledModalHeader>
        <Modal.Title>Select Account Index</Modal.Title>
        <CloseButton onClick={handleHide} role="button" aria-label="Close" data-test="index-selector-close" />
      </StyledModalHeader>
      <Modal.Body>
        <ModalLayout>
          <ListPane>
            <ListHeader>
              <ListHeaderTitle>
                <strong>Indices</strong>
                <RangeLabel title={`${start}–${end}`}>
                  {start.toLocaleString()}–{end.toLocaleString()}
                </RangeLabel>
              </ListHeaderTitle>
              <CheckboxLabel htmlFor="only-available-indices">
                <CheckboxBox>
                  <CheckboxInput
                    type="checkbox"
                    id="only-available-indices"
                    checked={onlyAvailable}
                    onChange={(event) => setOnlyAvailable(event.currentTarget.checked)}
                    data-test="only-available-checkbox"
                  />
                  <CheckIcon aria-hidden="true" />
                </CheckboxBox>
                <span>Hide unavailable</span>
              </CheckboxLabel>
            </ListHeader>

            {ownItem && renderIndexRow(ownItem)}

            <IndexList data-test="index-list">
              {claimedState.isLoading ? (
                <EmptyState>
                  <Spinner size="sm" animation="border" />
                  <span>Loading indices…</span>
                </EmptyState>
              ) : claimedState.error ? (
                <EmptyState>
                  <span>Failed to load indices.</span>
                  <Button size="sm" variant="outline-light" onClick={refreshIndices}>
                    Retry
                  </Button>
                </EmptyState>
              ) : items.length === 0 ? (
                <EmptyState data-empty="true">
                  <EmptyStateTitle>No available indices on this page.</EmptyStateTitle>
                  {onlyAvailable ? (
                    <EmptyStateHint>
                      <span>Paginate until you find available indices.</span>
                      <span>Or uncheck “Hide unavailable” to see claimed ones.</span>
                    </EmptyStateHint>
                  ) : null}
                </EmptyState>
              ) : (
                items.map(renderIndexRow)
              )}
            </IndexList>

            <Pagination data-test="index-pagination">
              <PageNavGroup>
                <PageNavButton
                  type="button"
                  size="sm"
                  variant="outline-light"
                  disabled={page === 0 || busy}
                  onClick={() => goToPage(0)}
                  data-test="index-page-first"
                  aria-label="First page"
                >
                  <FaAnglesLeft aria-hidden="true" />
                </PageNavButton>
                <PageNavButton
                  type="button"
                  size="sm"
                  variant="outline-light"
                  disabled={page === 0 || busy}
                  onClick={() => goToPage(page - 1)}
                  data-test="index-page-prev"
                  aria-label="Previous page"
                >
                  <FaChevronLeft aria-hidden="true" />
                </PageNavButton>
                <PageNavButton
                  type="button"
                  size="sm"
                  variant="outline-light"
                  disabled={busy || page >= MAX_PAGE}
                  onClick={() => goToPage(page + 1)}
                  data-test="index-page-next"
                  aria-label="Next page"
                >
                  <FaChevronRight aria-hidden="true" />
                </PageNavButton>
                <PageNavButton
                  type="button"
                  size="sm"
                  variant="outline-light"
                  disabled={busy || page === lastPage}
                  onClick={() => goToPage(lastPage)}
                  data-test="index-page-last"
                  aria-label="Last page"
                >
                  <FaAnglesRight aria-hidden="true" />
                </PageNavButton>
              </PageNavGroup>

              <GoToPage
                onSubmit={(event) => {
                  event.preventDefault()
                  submitGoToPage()
                }}
              >
                <GoToLabel htmlFor="index-go-to-page">Go to page:</GoToLabel>
                <GoToInput
                  id="index-go-to-page"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={pageInput}
                  disabled={busy}
                  onChange={(event) => setPageInput(event.currentTarget.value)}
                  onBlur={submitGoToPage}
                  style={{
                    width: `${Math.min(10, Math.max(3.75, pageInput.length * 0.75 + 1.5))}rem`
                  }}
                  data-test="index-page-input"
                  aria-label="Go to page number"
                />
              </GoToPage>
            </Pagination>
          </ListPane>

          <ActionPane>
            {hasFrozenIndex && ownFrozen ? (
              <OwnedIndexCard data-test="owned-frozen-index">
                <OwnedLabel>Your frozen index</OwnedLabel>
                <OwnedIndexShort title={ownFrozen.short}>{ownFrozen.short}</OwnedIndexShort>
                <OwnedIndexId>ID: {ownFrozen.index}</OwnedIndexId>
                <OwnedHint>This index is permanently bound to your account.</OwnedHint>
              </OwnedIndexCard>
            ) : (
              <>
                <SelectedSummary data-test="selected-index-summary">
                  {selectedIndex === null ? (
                    <>
                      <h6>No index selected</h6>
                      <p>Pick an available index from the list to claim it.</p>
                    </>
                  ) : (
                    <>
                      <h6>
                        <SelectedShort>{accountIndexToString(selectedIndex)}</SelectedShort>
                        <SelectedIdLine>ID: {selectedIndex}</SelectedIdLine>
                      </h6>
                      {selectedAssignment ? (
                        <p>
                          {selectedAssignment.frozen
                            ? 'This index is permanently frozen to its owner.'
                            : ownsSelectedUnfrozen
                              ? 'You own this index. Freeze it to bind it permanently, or free it to release it.'
                              : 'This index is already claimed by another account.'}
                        </p>
                      ) : (
                        <p>Available to claim. Claiming reserves a deposit from your account.</p>
                      )}
                    </>
                  )}
                </SelectedSummary>

                {!isFrozenByOther && (
                  <>
                    {!walletReady && (
                      <WalletHint data-test="index-wallet-hint">
                        Connect a wallet to claim, freeze, or free an index.
                      </WalletHint>
                    )}

                    <ActionButtons>
                      <Button
                        variant={canClaim ? 'secondary' : 'outline-secondary'}
                        disabled={!canClaim || busy}
                        onClick={() => void handleClaim()}
                        data-test="claim-index-button"
                      >
                        {claimLoading ? <Spinner size="sm" animation="border" /> : 'Claim'}
                      </Button>
                      <Button
                        variant={canFree ? 'danger' : 'outline-danger'}
                        disabled={!canFree || busy}
                        onClick={() => void handleFree()}
                        data-test="free-index-button"
                      >
                        {freeLoading ? <Spinner size="sm" animation="border" /> : 'Free'}
                      </Button>
                      <Button
                        variant={canFreeze ? 'secondary' : 'outline-secondary'}
                        disabled={!canFreeze || busy}
                        onClick={() => void handleFreeze()}
                        data-test="freeze-index-button"
                      >
                        {freezeLoading ? <Spinner size="sm" animation="border" /> : 'Freeze'}
                      </Button>
                    </ActionButtons>

                    <DepositNote data-test="index-deposit">
                      <span>
                        Deposit required to claim:{' '}
                        {depositState.isLoading ? (
                          <Spinner size="sm" animation="border" />
                        ) : depositState.data !== undefined ? (
                          <FormatBalance balance={depositState.data} />
                        ) : (
                          '—'
                        )}
                      </span>
                      <OverlayTrigger
                        trigger="click"
                        placement="left"
                        rootClose
                        overlay={
                          <StyledPopover id="index-process-popover">
                            <Popover.Body>
                              <HintText data-test="index-process-hint">
                                <strong>How it works</strong>
                                <HintSteps>
                                  <li>
                                    <strong>1a. Claim</strong>: Pick an available index. Locks a small deposit.
                                  </li>
                                  <li>
                                    <strong>1b. Free</strong>: Release a claimed-but-unfrozen index and get your
                                    deposit back.
                                  </li>
                                  <li>
                                    <strong>2. Freeze</strong>: Makes it permanent. Deposit is spent.
                                  </li>
                                </HintSteps>
                                {"If your account's balance ever drops to zero, an unfrozen index can be " +
                                  'reassigned to someone else. Freeze it to keep it permanently.'}
                              </HintText>
                            </Popover.Body>
                          </StyledPopover>
                        }
                      >
                        <HelpButton type="button" aria-label="How claiming works" data-test="index-process-help">
                          <FaCircleQuestion aria-hidden="true" />
                        </HelpButton>
                      </OverlayTrigger>
                    </DepositNote>
                  </>
                )}
              </>
            )}
          </ActionPane>
        </ModalLayout>
      </Modal.Body>
    </StyledModal>
  )
}

const StyledModal = styled(Modal)`
  .modal-dialog {
    max-width: 920px;
    margin: 1.75rem auto;
    pointer-events: none;
  }

  .modal-content {
    display: flex;
    max-height: min(85vh, 85dvh);
    flex-direction: column;
    overflow: hidden;
    pointer-events: auto;
    background-color: ${(props) => props.theme.colors.darkGrey};
    color: #e4e5e6;
  }

  .modal-body {
    display: flex;
    min-height: 0;
    flex: 1;
    flex-direction: column;
    padding: 0;
    overflow: hidden;
  }

  /* Match app tablet/mobile breakpoint used by Navbar / Explore */
  @media (max-width: 991.98px) {
    .modal-dialog {
      max-width: min(920px, calc(100vw - 24px));
      margin: 12px auto;
    }

    .modal-content {
      max-height: min(92vh, 92dvh);
    }
  }

  @media (max-width: 575.98px) {
    .modal-dialog {
      max-width: none;
      width: calc(100% - 16px);
      margin: 8px auto;
    }

    .modal-content {
      max-height: min(96vh, 96dvh);
      border-radius: 8px;
    }
  }
`

const StyledModalHeader = styled(Modal.Header)`
  display: flex;
  width: 100%;
  min-height: 52px;
  padding: 12px 16px;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);

  .modal-title {
    margin-bottom: 0;
    font-size: 1.15rem;
  }

  @media (max-width: 575.98px) {
    min-height: 48px;
    padding: 10px 14px;

    .modal-title {
      font-size: 1.05rem;
    }
  }
`

const CloseButton = styled(FaXmark)`
  flex-shrink: 0;
  margin-left: auto;
  padding: 4px;
  cursor: pointer;
  font-size: 1.15rem;
`

const ModalLayout = styled.div`
  display: grid;
  min-height: 400px;
  flex: 1;
  grid-template-columns: minmax(0, 1.45fr) minmax(220px, 0.9fr);
  grid-template-rows: minmax(0, 1fr);

  @media (max-width: 991.98px) {
    min-height: 0;
    grid-template-columns: 1fr;
    /* List fills leftover space; actions size to content so nothing is clipped mid-card */
    grid-template-rows: minmax(0, 1fr) max-content;
  }
`

const ListPane = styled.div`
  display: flex;
  min-height: 0;
  flex-direction: column;
  overflow: hidden;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  background: #3e454c;

  @media (max-width: 991.98px) {
    min-height: 0;
    border-right: 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }
`

const ListHeader = styled.div`
  display: flex;
  padding: 12px 14px;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);

  @media (max-width: 991.98px) {
    padding: 10px 12px;
    flex-wrap: wrap;
    gap: 8px 12px;
  }
`

const ListHeaderTitle = styled.div`
  display: flex;
  min-width: 0;
  flex: 1;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px 8px;
`

const RangeLabel = styled.span`
  min-width: 0;
  overflow: hidden;
  color: #9aa0a6;
  font-size: 0.85rem;
  font-weight: 400;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media (max-width: 575.98px) {
    width: 100%;
    font-size: 0.78rem;
  }
`

const CheckboxLabel = styled.label`
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 8px;
  margin: 0;
  color: #cfd1d3;
  font-size: 0.88rem;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;

  @media (max-width: 575.98px) {
    font-size: 0.84rem;
  }
`

const CheckboxBox = styled.span`
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
`

const CheckboxInput = styled.input`
  width: 1.05rem;
  height: 1.05rem;
  margin: 0;
  appearance: none;
  border: 2px solid #9aa0a6;
  border-radius: 3px;
  background: #2b3035;
  cursor: pointer;

  &:checked {
    border-color: ${(props) => props.theme.colors.primary};
    background-color: ${(props) => props.theme.colors.primary};
  }

  &:focus-visible {
    outline: 2px solid ${(props) => props.theme.colors.primary};
    outline-offset: 2px;
  }
`

const CheckIcon = styled(FaCheck)`
  position: absolute;
  top: 50%;
  left: 50%;
  color: ${(props) => props.theme.colors.white};
  font-size: 0.65rem;
  opacity: 0;
  pointer-events: none;
  transform: translate(-50%, -50%);

  ${CheckboxInput}:checked + & {
    opacity: 1;
  }
`

const IndexList = styled.div`
  display: flex;
  min-height: 0;
  max-height: 48vh;
  flex: 1 1 auto;
  flex-direction: column;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.25) transparent;
  /* Avoid a half-cut last row feeling “stuck” under the pager */
  scroll-padding-bottom: 4px;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 4px;
    background-color: rgba(255, 255, 255, 0.25);
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: rgba(255, 255, 255, 0.4);
  }

  /* Let empty state fill height so the title can sit on the vertical center */
  &:has(> [data-empty='true']) {
    overflow: hidden;
  }

  @media (max-width: 991.98px) {
    max-height: none;
  }
`

const EmptyState = styled.div`
  display: flex;
  width: 100%;
  min-height: 100%;
  flex: 1 1 auto;
  padding: 20px 16px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  text-align: center;

  .btn-outline-light {
    border-color: rgba(255, 255, 255, 0.28);
    background: transparent;
    color: #e4e5e6;

    &:hover,
    &:focus,
    &:focus-visible,
    &:active {
      border-color: ${(props) => props.theme.colors.primary} !important;
      background: rgba(230, 0, 122, 0.12) !important;
      color: #fff !important;
      box-shadow: none !important;
    }
  }

  @media (max-width: 575.98px) {
    padding: 16px 12px;
    gap: 12px;
  }
`

const EmptyStateTitle = styled.span`
  color: #e4e5e6;
  font-size: 1.15rem;
  font-weight: 700;
  line-height: 1.3;
  text-align: center;

  @media (max-width: 575.98px) {
    font-size: 1.05rem;
  }
`

const EmptyStateHint = styled.div`
  display: flex;
  max-width: 22rem;
  padding: 10px 12px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 6px;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  background: transparent;
  color: #b0b4b8;
  font-size: 0.88rem;
  line-height: 1.4;
  text-align: center;

  @media (max-width: 575.98px) {
    max-width: 100%;
    font-size: 0.84rem;
  }
`

const OWN_ROW_BACKGROUND = 'rgba(230, 0, 122, 0.1)'
const OWN_ROW_HOVER_BACKGROUND = 'rgba(230, 0, 122, 0.14)'
const OWN_ROW_ACTIVE_BACKGROUND = 'rgba(230, 0, 122, 0.18)'

const IndexRow = styled.button<{ $selected: boolean; $claimed: boolean; $own: boolean }>`
  display: flex;
  width: 100%;
  min-height: 44px;
  padding: 8px 12px 8px 11px;
  border: 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  border-left: 2px solid
    ${(props) => {
      if (props.$selected) return props.theme.colors.secondary
      if (props.$own) return props.theme.colors.primary
      return 'transparent'
    }};
  border-radius: 0;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  background: ${(props) => {
    if (props.$selected) return 'rgba(1, 255, 255, 0.1)'
    if (props.$own) return OWN_ROW_BACKGROUND
    return 'transparent'
  }};
  color: inherit;
  text-align: left;
  cursor: pointer;
  opacity: ${(props) => (props.$claimed && !props.$selected && !props.$own ? 0.85 : 1)};
  transition: border-color 120ms ease, background-color 120ms ease;

  &:hover,
  &:focus-visible {
    border-left-color: ${(props) =>
    props.$own && !props.$selected ? props.theme.colors.primary : props.theme.colors.secondary} !important;
    background: ${(props) => {
    if (props.$own && !props.$selected) return OWN_ROW_HOVER_BACKGROUND
    return props.$selected ? 'rgba(1, 255, 255, 0.14)' : 'rgba(1, 255, 255, 0.06)'
  }} !important;
    outline: none;
  }

  &:active {
    border-left-color: ${(props) =>
    props.$own && !props.$selected ? props.theme.colors.primary : props.theme.colors.secondary} !important;
    background: ${(props) =>
    props.$own && !props.$selected ? OWN_ROW_ACTIVE_BACKGROUND : 'rgba(1, 255, 255, 0.12)'} !important;
  }

  @media (max-width: 575.98px) {
    min-height: 48px;
    padding: 8px 12px 8px 11px;
    gap: 8px;
  }
`

const IndexMain = styled.div`
  display: flex;
  min-width: 0;
  flex: 1 1 auto;
  flex-direction: column;
  gap: 0;
  overflow: hidden;
`

const IndexShort = styled.span`
  overflow: hidden;
  color: ${(props) => props.theme.colors.white};
  font-size: 1.05rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media (max-width: 575.98px) {
    font-size: 0.98rem;
  }
`

const IndexId = styled.span`
  overflow: hidden;
  margin-top: 1px;
  color: #9aa0a6;
  font-size: 0.78rem;
  font-weight: 500;
  line-height: 1.15;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media (max-width: 575.98px) {
    font-size: 0.74rem;
  }
`

const BadgeGroup = styled.div`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 6px;
`

/** Available = cyan; own frozen Yours = magenta; Claimed = skeptic yellow */
const StatusBadge = styled(Badge) <{ $tone: 'pink' | 'yellow' | 'cyan' }>`
  flex-shrink: 0;
  background-color: ${(props) =>
    props.$tone === 'pink'
      ? props.theme.colors.primary
      : props.$tone === 'cyan'
        ? props.theme.colors.secondary
        : '#ffc629'} !important;
  color: ${(props) =>
    props.$tone === 'pink' ? props.theme.colors.white : props.theme.colors.black} !important;
  white-space: nowrap;
`

const Pagination = styled.div`
  display: flex;
  z-index: 1;
  padding: 10px 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  align-items: center;
  justify-content: space-between;
  flex: 0 0 auto;
  flex-wrap: wrap;
  gap: 8px;
  background: #3e454c;

  @media (max-width: 575.98px) {
    padding: 10px 8px;
    gap: 8px;
  }
`

const PageNavGroup = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 4px;
`

const PageNavButton = styled(Button)`
  display: inline-flex;
  min-width: 2.25rem;
  min-height: 2.25rem;
  padding: 0.25rem;
  border-color: rgba(255, 255, 255, 0.28) !important;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  background: transparent !important;
  color: #e4e5e6 !important;
  font-size: 0.78rem;
  transition: border-color 120ms ease, background-color 120ms ease, color 120ms ease;

  &:hover,
  &:focus,
  &:focus-visible {
    border-color: ${(props) => props.theme.colors.primary} !important;
    background: rgba(230, 0, 122, 0.12) !important;
    color: #fff !important;
    box-shadow: none !important;
  }

  &:active,
  &:active:focus {
    border-color: ${(props) => props.theme.colors.primary} !important;
    background: rgba(230, 0, 122, 0.2) !important;
    color: #fff !important;
    box-shadow: none !important;
  }

  &:disabled,
  &.disabled {
    border-color: rgba(255, 255, 255, 0.12) !important;
    background: transparent !important;
    color: rgba(255, 255, 255, 0.35) !important;
    opacity: 1;
  }

  @media (max-width: 575.98px) {
    min-width: 2.4rem;
    min-height: 2.4rem;
  }
`

const GoToPage = styled.form`
  display: inline-flex;
  min-width: 0;
  align-items: center;
  gap: 6px;
  margin-left: auto;
`

const GoToLabel = styled.label`
  margin: 0;
  color: #cfd1d3;
  font-size: 0.82rem;
  white-space: nowrap;
`

const GoToInput = styled.input`
  box-sizing: border-box;
  min-width: 3.75rem;
  min-height: 1.85rem;
  padding: 0.25rem 0.55rem;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 4px;
  background: #2b3035;
  color: #fff;
  font-size: 0.82rem;
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
  text-align: center;

  &:focus {
    border-color: ${(props) => props.theme.colors.primary};
    outline: none;
    box-shadow: 0 0 0 2px rgba(230, 0, 122, 0.25);
  }

  &:disabled {
    opacity: 0.6;
  }

  @media (max-width: 575.98px) {
    min-height: 1.9rem;
  }
`

const ActionPane = styled.div`
  display: flex;
  min-width: 0;
  padding: 16px 14px;
  flex-direction: column;
  gap: 14px;
  overflow: visible;
  background: ${(props) => props.theme.colors.darkGrey};

  @media (max-width: 991.98px) {
    flex-shrink: 0;
    padding: 14px 14px 16px;
    gap: 10px;
  }

  @media (max-width: 575.98px) {
    padding: 12px 12px 14px;
    gap: 8px;
  }
`

const OwnedIndexCard = styled.div`
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 4px;
  padding: 4px 0;
  overflow: visible;
`

const OwnedLabel = styled.span`
  color: #9aa0a6;
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`

const OwnedIndexId = styled.span`
  color: #9aa0a6;
  font-size: 0.85rem;
  font-weight: 500;
`

const OwnedIndexShort = styled.span`
  max-width: 100%;
  color: ${(props) => props.theme.colors.white};
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.2;
  overflow-wrap: anywhere;
  word-break: break-word;

  @media (max-width: 575.98px) {
    font-size: 1.2rem;
  }
`

const OwnedHint = styled.p`
  margin: 8px 0 0;
  color: #b0b4b8;
  font-size: 0.88rem;
`

const SelectedSummary = styled.div`
  h6 {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
    margin: 0 0 8px;
    font-size: 1.15rem;
  }

  p {
    margin: 0;
    color: #b0b4b8;
    font-size: 0.9rem;
  }

  @media (max-width: 575.98px) {
    h6 {
      font-size: 1.05rem;
    }

    p {
      font-size: 0.85rem;
    }
  }
`

const SelectedIdLine = styled.span`
  flex-shrink: 0;
  color: #9aa0a6;
  font-size: 0.82rem;
  font-weight: 500;
`

const SelectedShort = styled.span`
  min-width: 0;
  color: ${(props) => props.theme.colors.white};
  font-size: 1.1rem;
  font-weight: 600;
  word-break: break-all;
`

const WalletHint = styled.div`
  padding: 10px 12px;
  border: 1px solid rgba(255, 193, 7, 0.35);
  border-radius: 6px;
  background: rgba(255, 193, 7, 0.08);
  color: #ffe08a;
  font-size: 0.88rem;

  @media (max-width: 575.98px) {
    padding: 8px 10px;
    font-size: 0.82rem;
  }
`

const SECONDARY_HOVER_COLOR = '#00cfcf'

const ActionButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;

  button {
    min-height: 44px;
  }

  .btn-secondary {
    &:hover,
    &:focus,
    &:focus-visible,
    &:active {
      background-color: ${SECONDARY_HOVER_COLOR} !important;
      border-color: ${SECONDARY_HOVER_COLOR} !important;
    }
  }

  .btn-outline-secondary,
  .btn-outline-danger {
    &:disabled,
    &.disabled {
      border-color: rgba(255, 255, 255, 0.12) !important;
      background: transparent !important;
      color: rgba(255, 255, 255, 0.35) !important;
      box-shadow: none !important;
      opacity: 1;
    }
  }

  @media (max-width: 575.98px) {
    flex-direction: row;
    gap: 8px;

    button {
      min-height: 48px;
      flex: 1;
    }
  }
`

const DepositNote = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: #cfd1d3;
  font-size: 0.86rem;

  @media (max-width: 575.98px) {
    font-size: 0.8rem;
  }
`

const HelpButton = styled.button`
  display: inline-flex;
  flex-shrink: 0;
  padding: 0;
  border: 0;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: #9aa0a6;
  font-size: 1rem;
  line-height: 1;

  &:hover,
  &:focus-visible {
    color: ${(props) => props.theme.colors.secondary};
    outline: none;
  }
`

const StyledPopover = styled(Popover)`
  --bs-popover-max-width: 300px;
  --bs-popover-bg: ${(props) => props.theme.colors.darkGrey};
  --bs-popover-border-color: rgba(255, 255, 255, 0.12);
  --bs-popover-body-color: #e4e5e6;
  --bs-popover-body-padding-x: 14px;
  --bs-popover-body-padding-y: 12px;
`

const HintText = styled.div`
  color: #9aa0a6;
  font-size: 0.8rem;
  line-height: 1.4;

  strong {
    color: #cfd1d3;
  }
`

const HintSteps = styled.ol`
  margin: 6px 0 6px;
  padding-left: 0;
  list-style: none;

  li {
    margin-bottom: 4px;
  }
`

export { IndexSelectorModal }
