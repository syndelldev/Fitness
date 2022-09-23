
import React from "react";
import moment from "moment-timezone";
import { Row, Col, Card } from '@themesberg/react-bootstrap';

export default (props) => {
  const currentYear = moment().get("year");
  
  return (
    <div className="h-60 d-none">
      <footer className="footer-main">
         <Row className="justify-content-center h-100 align-items-center">
          <Col xs={12} lg={6} className="mb-4 mb-lg-0 text-center">
            <p className="mb-0 text-center">
              Copyright © {`${currentYear} `}
              <Card.Link href="http://localhost:3000/" target="_blank" className="text-blue text-decoration-none fw-normal">
              Fitnessevangelium
              </Card.Link>
            </p>
          </Col>
        </Row>
      </footer>
    </div>
  );
};
