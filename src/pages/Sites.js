import React, { useState, useEffect } from "react";
import { Row } from "react-bootstrap";
import { Lines } from "react-preloaders";
import Layout from "components/layout";
import SEO from "components/seo";
import SiteSearchBar from "components/SearchBar";
import GeneMaps from "components/GeneMaps";
import * as site from "helpers/siteHelper";

const Sites = () => {
  const [loading, setLoading] = useState(true);
  const [compoundLabels, setCompoundLabels] = useState({});
  const [fastaData, setFastaData] = useState({ human: [], mouse: [] });
  const [cellData, setCellData] = useState({ human: [], mouse: [] });
  const [type, setType] = useState("human");
  const [geneOnFasta, setGeneOnFasta] = useState(
    site.getGeneOnFasta(type, fastaData, "Q15910")
  );
  const [geneOnCell, setGeneOnCell] = useState(
    site.getGeneOnCell(type, cellData, "Q15910")
  );

  useEffect(() => {
    site
      .fetchCompoundList()
      .then(setCompoundLabels)
      .then(() => site.parseFastaData("human"))
      .then(data => setFastaData({ ...fastaData, human: data }))
      .then(() => site.parseCellData("human"))
      .then(data => setCellData({ ...cellData, human: data }))
      .then(() => site.parseFastaData("mouse"))
      .then(data => setFastaData({ ...fastaData, mouse: data }))
      .then(() => site.parseCellData("mouse"))
      .then(data => setCellData({ ...cellData, mouse: data }))
      .then(() => setLoading(false))
      .catch(() => setLoading(false));
  }, []);

  const searchGene = gene => {
    setGeneOnFasta(site.getGeneOnFasta(type, fastaData, gene));
    setGeneOnCell(site.getGeneOnCell(type, cellData, gene));
  };

  return (
    <Layout>
      <SEO title="Sites" />
      <Row>
        <SiteSearchBar
          searchGene={gene}
          searchType={type}
          selectType={(type) => setType(type)}
          onSubmit={gene => {
            setGene(gene);
            searchGene(gene);
          }}
        />
      </Row>
      <Row>
        <GeneMaps
          compounds={compoundLabels[type]}
          proteinOnFasta={geneOnFasta}
          proteinOnCell={geneOnCell}
        />
      </Row>
      <Row>{/* <HockeyStickChart /> */}</Row>
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
