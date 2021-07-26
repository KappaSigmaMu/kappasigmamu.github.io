import { Card, Col } from 'react-bootstrap'

function BlogCard() {
  return (
    <Col md={3} className="mx-2">
      <Card
        bg={'dark'}
        text={'light'}
        style={{ width: '18rem' }}
        className="mb-2"
      >
        <Card.Header>Header</Card.Header>
        <Card.Body>
          <Card.Title> Card Title </Card.Title>
          <Card.Text>
            {`Some quick example text to build on the card title and make up the
            bulk of the card's content.`}
          </Card.Text>
        </Card.Body>
      </Card>
    </Col>
  )
}

export { BlogCard }
