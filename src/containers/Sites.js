import React, { useState, useEffect } from "react";
import { Row } from "react-bootstrap";
// import { Lines } from "react-preloaders";
import Preloader from "components/Preloader/index";
// import SEO from "components/seo";
import SiteSearchBar from "components/SearchBar";
import GeneMaps from "components/GeneMaps";
import * as site from "helpers/siteHelper";

const defaultGene = "Q15910";

const Sites = () => {
  const [loading, setLoading] = useState("Loading");
  const [compoundLabels, setCompoundLabels] = useState({});
  const [fastaData, setFastaData] = useState({ human: [], mouse: [] });
  const [cellData, setCellData] = useState({ human: [], mouse: [] });
  const [type, setType] = useState("human");
  const [geneOnFasta, setGeneOnFasta] = useState(null);
  const [geneOnCell, setGeneOnCell] = useState(null);

  useEffect(() => {
    site
      .fetchCompoundList()
      .then(setCompoundLabels)
      .then(() => {
        setLoading("Parsing Human Fasta data");
        site.parseFastaData("human");
      })
      .then(data => {
        site.getGeneOnFasta("human", fastaData, defaultGene);
        setFastaData({ ...fastaData, human: data });
      })
      .then(() => {
        setLoading("Parsing Human Cell data");
        site.parseCellData("human");
      })
      .then(data => {
        site.getGeneOnCell("human", cellData, defaultGene);
        setCellData({ ...cellData, human: data });
      })
      // .then(() => site.parseFastaData("mouse"))
      // .then(data => setFastaData({ ...fastaData, mouse: data }))
      // .then(() => site.parseCellData("mouse"))
      // .then(data => setCellData({ ...cellData, mouse: data }))
      .then(() => setLoading(""))
      .catch(() => setLoading(""));
  }, []);

  const searchGene = gene => {
    setGeneOnFasta(site.getGeneOnFasta(type, fastaData, gene));
    setGeneOnCell(site.getGeneOnCell(type, cellData, gene));
  };

  return (
    <>
      <Preloader show={loading} />
      {/* <SEO title="Sites" /> */}
      <Row>
        <SiteSearchBar
          // searchGene={gene}
          searchType={type}
          selectType={type => setType(type)}
          onSubmit={gene => {
            // setGene(gene);
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
      {/* <Lines
        color="#5e72e4"
        background="blur"
        customLoading={loading}
        time={0}
      /> */}
    </>
  );
};

export default Sites;
