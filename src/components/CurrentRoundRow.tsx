import { Button, Container, Col, Row } from 'react-bootstrap'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'

const Circle = ({ active = false }: { active?: boolean }): JSX.Element => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="6" cy="6" r="6" fill={active ? '#E6007A' : '#FFF'} />
  </svg>
)

const CurrentRoundRow = (): JSX.Element => {
  const percentage = 66
  return (
    <Container>
      <Row>
        <Col>
          <Row className="mb-3">
            <Col>
              <h4 style={{ color: 'white', marginBottom: '20px' }}>
                Current Round
              </h4>
            </Col>
          </Row>
          <Row>
            <Col>
              <div style={{ width: 100, height: 100 }}>
                <CircularProgressbar
                  value={percentage}
                  styles={buildStyles({
                    pathColor: '#E6007A',
                    trailColor: '#fff',
                    strokeLinecap: 'butt',
                  })}
                />
              </div>
            </Col>
            <Col style={{ paddingLeft: 0 }}>
              <span style={{ color: '#fff' }}>01 </span>
              &nbsp;
              <span style={{ color: '#6c757d' }}>day</span>
              <br />
              <span style={{ color: '#fff' }}>11 </span>
              &nbsp;
              <span style={{ color: '#6c757d' }}>hrs.</span>
              <br />
              <span style={{ color: '#fff' }}>20 </span>
              &nbsp;
              <span style={{ color: '#6c757d' }}>mins.</span>
              <br />
              <span style={{ color: '#fff' }}>12 </span>
              &nbsp;
              <span style={{ color: '#6c757d' }}>secs.</span>
            </Col>
          </Row>
        </Col>
        <Col>
          <Row className="mb-3">
            <Col>
              <h4 style={{ color: 'white' }}>Round Payout</h4>
            </Col>
          </Row>
          <Row>
            <Col>
              <span style={{ color: '#fff' }}>53,3200</span>
              &nbsp;&nbsp;
              <span style={{ color: '#6c757d' }}>KSM</span>
            </Col>
          </Row>
        </Col>
        <Col>
          <Row className="mb-3">
            <Col>
              <h4 style={{ color: 'white' }}>My Bid</h4>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col>
              <span style={{ color: '#fff' }}>53,3200</span>
              &nbsp;&nbsp;
              <span style={{ color: '#6c757d' }}>KSM</span>
            </Col>
          </Row>
          <Row>
            <Col>
              <Button>Update</Button>
            </Col>
          </Row>
        </Col>
        <Col>
          <Row className="mb-3">
            <Col>
              <h4 style={{ color: 'white' }}>Strikes</h4>
            </Col>
          </Row>
          <Row className="mb-2">
            <Col>
              <span style={{ color: '#fff' }}>4</span>
              &nbsp;
              <span style={{ color: '#6c757d' }}>/&nbsp;10</span>
            </Col>
          </Row>
          <Row>
            <Col>
              <Circle active />
              <Circle active />
              <Circle active />
              <Circle active />
              <Circle />
              <Circle />
              <Circle />
              <Circle />
              <Circle />
              <Circle />
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  )
}

export { CurrentRoundRow }
