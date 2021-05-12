import React from "react";
import { Link } from "react-router-dom";

const LinkWrapper = ({ condition, wrapper, children }) =>
  condition ? wrapper(children) : children;

const HomePageImage = ({
  // width = 125,
  height = 300,
  cssClass = "",
  linkTo = ""
}) => {
  const src = `data/images/oximouse.png`;
  return (
    <div className="logo">
      <LinkWrapper
        condition={linkTo}
        wrapper={children => <Link to={linkTo}>{children}</Link>}
      >
        <img
          src={src}
          // width={width}
          height={height}
          alt="Oximouse Logo"
          className={cssClass}
        />
      </LinkWrapper>
    </div>
  );
};

export default HomePageImage;
