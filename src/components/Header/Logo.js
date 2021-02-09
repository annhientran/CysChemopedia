import React from "react";
import { Link } from "gatsby";
import logo from "images/brand/oximouse.png";

const LinkWrapper = ({ condition, wrapper, children }) =>
  condition ? wrapper(children) : children;

const Logo = ({
  // width = 125,
  height = 50,
  cssClass = "",
  linkTo = "/"
}) => {
  return (
    <div className="logo d-flex align-items-center">
      <LinkWrapper
        condition={linkTo}
        wrapper={children => <Link to={linkTo}>{children}</Link>}
      >
        <img
          src={logo}
          // width={width}
          height={height}
          alt="CysMouse"
          className={cssClass}
        />
      </LinkWrapper>
    </div>
  );
};

export default Logo;
