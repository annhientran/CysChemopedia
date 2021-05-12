// import { Link } from "gatsby";
import React from "react";
import { Navbar } from "react-bootstrap";
import Logo from "containers/HeaderMenu/Logo";
import ProgramMenu from "containers/HeaderMenu/ProgramMenu";
import "styles/oximouse.css";

const Header = () => {
  const expand = !(window.innerWidth < 1024);

  return (
    <Navbar
      collapseOnSelect
      expand={expand}
      bg="dark"
      variant="dark"
      bsPrefix="navbar"
      className="justify-content-between navbar-horizontal navbar-expand-lg navbar-dark bg-primary p-0"
    >
      <Logo cssClass="button-right-offset navbar-brand navbar-brand-img" />
      <Navbar.Toggle
        aria-controls="responsive-navbar-nav"
        bsPrefix="navbar-toggler"
      />
      <Navbar.Collapse id="responsive-navbar-nav" bsPrefix="navbar-collapse">
        <ProgramMenu />
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Header;
