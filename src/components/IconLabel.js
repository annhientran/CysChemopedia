import React from "react";
import PropTypes from "prop-types";

const IconLabel = ({ awesomeIcon, iconText, label, classStyle, iconFirst }) => {
  const iconPadding = iconFirst ? { paddingRight: 10 } : { paddingLeft: 10 };
  const renderIcon = () => {
    return iconText ? (
      <>
        <span
          className={`sidenav-mini-icon ${classStyle}`}
          aria-hidden="true"
          style={iconPadding}
        >
          {iconText}
        </span>
      </>
    ) : (
      <i
        className={`fas fa-${awesomeIcon} ${classStyle}`}
        aria-hidden="true"
        style={iconPadding}
      />
    );
  };

  return iconFirst ? (
    <span>
      {renderIcon()}
      {label}
    </span>
  ) : (
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
  classStyle: PropTypes.string,
  iconFirst: PropTypes.bool
};

IconLabel.defaultProps = {
  iconText: "",
  awesomeIcon: "",
  label: "",
  classStyle:"",
  iconFirst: true
};

IconLabel.displayName = "IconLabel";

export default IconLabel;
