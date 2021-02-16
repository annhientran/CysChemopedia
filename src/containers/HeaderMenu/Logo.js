import React from "react";
import { Link } from "react-router-dom";
import logo from "data/images/oximouse.png";

const LinkWrapper = ({ condition, wrapper, children }) =>
  condition ? wrapper(children) : children;

const Logo = ({ width = "", height = 50, cssClass = "", linkTo = "/" }) => {
  // from public folder
  // const logo = "data/images/oximouse.png";

  return (
    <div className="logo d-flex align-items-center">
      <LinkWrapper
        condition={linkTo}
        wrapper={children => <Link to={linkTo}>{children}</Link>}
      >
        <img
          src={logo}
          width={width}
          height={height}
          alt="CysMouse"
          className={cssClass}
        />
      </LinkWrapper>
    </div>
  );
};

export default Logo;
