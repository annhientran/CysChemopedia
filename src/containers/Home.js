import React from "react";
import { Link } from "react-router-dom";
import { Col, Row } from "react-bootstrap";
import LogoImage from "containers/HeaderMenu/Logo";
// import SEO from "../components/seo";

const Home = () => (
  <React.StrictMode>
    {/* <SEO title="Home" /> */}
    <Row className="ml-5">
      <Col className="mt-5">
        <h1 className="display-2">Welcome to OxiMouse!</h1>
        <p className="mt-0 mb-5">
          Mammalian tissues engage in specialized physiology that is regulated
          through reversible modification of protein cysteine residues by
          reactive oxygen species (ROS). ROS regulate a myriad of biological
          processes, but the protein targets of ROS modification that drive
          tissue-specific physiology in vivo are largely unknown. Here, we
          develop Oximouse, a comprehensive and quantitative mapping of the
          mouse cysteine redox proteome in vivo. We use Oximouse to establish
          several paradigms of physiological redox signaling. We define and
          validate cysteine redox networks within each tissue that are tissue
          selective and underlie tissue-specific biology. We describe a common
          mechanism for encoding cysteine redox sensitivity by electrostatic
          gating. Moreover, we comprehensively identify redox-modified disease
          networks that remodel in aged mice, establishing a systemic molecular
          basis for the long-standing proposed links between redox dysregulation
          and tissue aging. We provide the Oximouse compendium as a framework
          for understanding mechanisms of redox regulation in physiology and
          aging.
        </p>
      </Col>
      <Col className="d-flex justify-content-center align-items-center">
        <div
          className="card card-frame"
          style={{ height: "250px", width: "500px" }}
        >
          <LogoImage cssClass="align-items-center" />
        </div>
      </Col>
    </Row>
    <Row className="d-flex justify-content-center align-items-center">
      <Col className="card">
        <div
          id="welcomeHeader"
          className="card-header text-white bg-secondary text-center"
        >
          <h2>
            To begin, search for a protein at the{" "}
            <Link to="/sites" className="text-primary">
              Sites
            </Link>
          </h2>
        </div>
        <div
          id="welcomeCard"
          className="collapse show"
          aria-labelledby="welcomeHeader"
          data-parent="#welcomeAccordion"
        >
          <div className="card-body text-center">
            <h5 className="mt-4">
              For additional information, check{" "}
              <Link to="/help" className="text-primary">
                Help
              </Link>{" "}
              page
            </h5>
            <br />
            <p>
              Please Cite:{" "}
              <b>
                <a
                  href="https://doi.org/10.1016/j.cell.2020.02.012"
                  target="_blank"
                  rel="noreferrer"
                >
                  Xiao, et al. A Quantitative Tissue-Specific Landscape of
                  Protein Redox Regulation during Aging, Cell (2020)
                </a>
              </b>
            </p>
            <br />
          </div>
        </div>
      </Col>
    </Row>
    {/* <div style={{ maxWidth: `300px`, marginBottom: `1.45rem` }}>
    </div>
    <Link to="/page-2/">Go to page 2</Link> <br />
    <Link to="/using-typescript/">Go to "Using TypeScript"</Link> */}
  </React.StrictMode>
);

export default Home;
