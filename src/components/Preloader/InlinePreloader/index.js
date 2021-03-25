import React from "react";
import PropTypes from "prop-types";
import "./style.css";

const InlinePreloader = ({ show, label }) => {
  if (!show) return null;

  return (
    <div id="loader-box">
      <div id="inline-loader" />
      {/* <div id="loader-container">
      </div> */}
      <div id="loader-label">
        {label}
        <span className="dots" />
      </div>
    </div>
  );
};

InlinePreloader.propTypes = {
  show: PropTypes.bool,
  label: PropTypes.string
};

InlinePreloader.defaultProps = {
  show: true,
  label: "Loading"
};

InlinePreloader.displayName = "InlinePreloader";

export default InlinePreloader;
