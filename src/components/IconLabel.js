import React from "react";
import PropTypes from "prop-types";

const IconLabel = ({ awesomeIcon, iconText = "", label, iconFirst }) => {
  const iconPadding = iconFirst ? { paddingRight: 10 } : { paddingLeft: 10 };
  const renderIcon = () => {
    if (iconText)
      return (
        <>
          <span
            className="sidenav-mini-icon"
            aria-hidden="true"
            style={iconPadding}
          >
            {iconText}
          </span>
        </>
      );

    return (
      <i
        className={`fas fa-${awesomeIcon}`}
        aria-hidden="true"
        style={iconPadding}
      />
    );
  };

  if (iconFirst) {
    return (
      <span>
        {renderIcon()}
        {label}
      </span>
    );
  }

  return (
    <span>
      {label}
      {renderIcon()}
    </span>
  );
};

IconLabel.propTypes = {
  iconText: PropTypes.string,
  awesomeIcon: PropTypes.string,
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
    PropTypes.func
  ]),
  iconFirst: PropTypes.bool
};

IconLabel.defaultProps = {
  iconText: "",
  awesomeIcon: "",
  label: "",
  iconFirst: true
};

IconLabel.displayName = "IconLabel";

export default IconLabel;
