import React, { useState, useEffect } from "react";
import { Row } from "react-bootstrap";
import { Lines } from "react-preloaders";
import Layout from "components/layout";
import SEO from "components/seo";
import SiteSearchBar from "components/SearchBar";
import GeneMaps from "components/GeneMaps";
import * from "helpers/siteHelper";

const Sites = () => {
  const [loading, setLoading] = useState(true);
  const [compoundLabels, setCompoundLabels] = useState({});
  const [humanFastaData, setHumanFastaData] = useState([]);
  const [mouseFastaData, setMouseFastaData] = useState([]);
  const [humanCellData, setHumanCellData] = useState([]);
  const [mouseCellData, setMouseCellData] = useState([]);

  useEffect(() => {
    fetchCompoundList().then(setCompoundLabels) 
      .then(() => buildFastaDatabase("human"))
      .then(setHumanFastaData)
      .then(() => buildCellDatabase("human"))
      .then(setHumanCellData)
      .then(() => buildCellDatabase("mouse"))
      .then(setMouseFastaData)
      .then(() => buildCellDatabase("mouse"))
      .then(setMouseCellData)
      .then(() => setLoading(false))
      .catch(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <SEO title="Sites" />
      <Row>
        <SiteSearchBar />
      </Row>
      <Row>
        <GeneMaps />
      </Row>
      <Row>
        {/* <HockeyStickChart /> */}
      </Row>
      <Lines
        color="#5e72e4"
        background="blur"
        customLoading={loading}
        time={0}
      />
    </Layout>
  );
};

export default Sites;
