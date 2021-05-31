import React from "react";

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
    </footer>
  );
};

export default Footer;
