import React from "react";
import { Col, Row } from "react-bootstrap";

const GeneInfo = ({ geneData }) => {
  if (!geneData) return null;

  const entry = geneData["Entry"];
  const gene = geneData["Gene names (primary)"];
  const protein = geneData["Protein names"];

  return (
    <Row className="align-items-center">
      <Col>
        <h3 className="mb-0 text-center">Protein Information</h3>
        <br />
        <p><b>Accession:</b> {entry}</p>
        <p><b>Gene:</b> {gene}</p>
        <p><b>Protein:</b> {protein}</p>
      </Col>
    </Row>
  );
};

export default GeneInfo;
