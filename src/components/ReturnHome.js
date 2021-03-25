import React from "react";
import { Link } from "react-router-dom";

const ReturnHome = () => {
  return (
    <h3>
      <Link to="/">&larr; Return to home</Link>
    </h3>
  );
};

export default ReturnHome;
