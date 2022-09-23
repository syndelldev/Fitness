import React from "react";
import AccessDeniedImage from "../../assets/img/access-denied-img.jpg"
import { Card } from "@themesberg/react-bootstrap";

export default function AccessDenied() {
  return (
    <div className="mt-6">
      <Card>
        <Card.Body>
          <div className="access-denied-img-section text-center">
            <img src={AccessDeniedImage} alt="access-denied-img" width={500} />
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}
