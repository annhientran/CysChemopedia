/**
 * Layout component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.com/docs/use-static-query/
 */

import React from "react";
import PropTypes from "prop-types";
// import { useStaticQuery, graphql } from "gatsby"
// import { withPrefix } from "gatsby";
import Header from "components/Header/header";
// import "./layout.css";
import "styles/oximouse.css";

const Layout = ({ children }) => {
  // const data = useStaticQuery(graphql`
  //   query SiteTitleQuery {
  //     site {
  //       siteMetadata {
  //         title
  //       }
  //     }
  //   }
  // `)

  return (
    <>
      <Header />
      <div
        style={{
          margin: `0 6rem`,
          // maxWidth: 960,
          // padding: `0 1.0875rem 1.45rem`
        }}
        className="d-flex justify-content-center align-items-center"
      >
        <main>{children}</main>
      </div>
      <footer
        id="footerDiv"
        style={{
          marginTop: `2rem`,
          display: "block"
        }}
        className="footer-section footer-auto-bottom bg-primary p-3 pt-1 text-center text-light font-weight-bold"
      >
        <p className="font-weight-bold">
          &copy;{" "}
          <a href="https://gygi.med.harvard.edu/" className="text-light">
            Gygi
          </a>{" "}
          &
          <a href="https://chouchanilab.dana-farber.org/" className="text-light">
            Chouchani
          </a>{" "}
          Labs at HMS/DFCI.
        </p>
        {/* Oximouse JS --> */}
        <script src="js/oximouse.js" type="text/javascript" />
        <script src="js/oximouse_analytics.js" type="text/javascript" />
        <script src="js/oximouse_general.js" type="text/javascript" />
        {/* <script src="feature-viewer.nextprot.js"></script> */}
        {/* <script src="assets/js/mouse_plots.js"></script>
        <script src="assets/js/mouse_sites.js"></script> */}
      </footer>
    </>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired
};

export default Layout;
