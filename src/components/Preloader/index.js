import React from "react";
import PropTypes from "prop-types";
import "./style.css";

const Preloader = ({ show }) => {
  if (!show) return null;

  return (
    <div id="fullpage-loader" className="fpl-loader curtain">
      <div id="fullpage-loader__spinner" className="fpl-spinner" />
      <div id="fullpage-loader__label">
        {show}
        <span className="dots" />
      </div>
    </div>
  );
};

Preloader.propTypes = {
  show: PropTypes.string
};

Preloader.defaultProps = {
  show: ""
};

Preloader.displayName = "Preloader";

export default Preloader;
