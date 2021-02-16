import React from "react";
import "styles/oximouse.css";

const Footer = () => {
  return (
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
  );
};

export default Footer;