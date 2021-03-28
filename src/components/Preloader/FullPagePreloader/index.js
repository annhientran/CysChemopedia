import React from "react";
import PropTypes from "prop-types";
import "./style.css";
import "styles/App.css";

const Preloader = ({ content }) => {
  if (!content || !content.text) return null;

  return (
    <>
      <div id="fullPagePreloader" className="fullPageLoader">
        <div id="fullPagePreloader-circle" className="circleSpinner" />
        <div id="fullPagePreloader-label">
          {content.text}
          <span className="dots" />
        </div>
      </div>
    </>
  );
};

Preloader.propTypes = {
  content: PropTypes.object
};

Preloader.defaultProps = {
  content: null
};

Preloader.displayName = "Preloader";

export default Preloader;
