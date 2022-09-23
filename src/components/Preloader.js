import React from "react";
import { Spinner } from "@themesberg/react-bootstrap";

export default (props) => {
  const { show } = props;
  if (show) {
    return (
      <>
        <div className="full-page-loader">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </>
    );
  } else {
    return <></>;
  }
};
