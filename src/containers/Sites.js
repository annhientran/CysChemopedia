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
  const [searchGene, setSearchGene] = useState({ fasta: null, cell: null });

  useEffect(() => {
    site
      .fetchCompoundList()
      .then(setCompoundLabels)
      .then(() => {
        setLoading("Parsing Human Fasta data");
        return site.parseFastaData("human");
      })
      .then(data => {
        debugger;
        setFastaData({ ...fastaData, human: data });
        debugger;
        setSearchGene({
          ...searchGene,
          fasta: site.getGeneOnFasta(data, defaultGene)
        });
      })
      .then(() => {
        setLoading("Parsing Human Cell data");
        return site.parseCellData("human");
      })
      .then(data => {
        setCellData({ ...cellData, human: data });debugger;
        setSearchGene({
          ...searchGene,
          cell: site.getGeneOnCell(data, defaultGene)
        });
      })
      // .then(() => {
      //   debugger;
      //   const initialGeneOnFasta = site.getGeneOnFasta(
      //     "human",
      //     fastaData,
      //     defaultGene
      //   );
      //   const initialGeneOnCell = site.getGeneOnCell(
      //     "human",
      //     cellData,
      //     defaultGene
      //   );
      //   debugger;
      //   setSearchGene({ fasta: initialGeneOnFasta, cell: initialGeneOnCell });
      // })
      // .then(() => site.parseFastaData("mouse"))
      // .then(data => setFastaData({ ...fastaData, mouse: data }))
      // .then(() => site.parseCellData("mouse"))
      // .then(data => setCellData({ ...cellData, mouse: data }))
      .then(() => setLoading(""))
      .catch(() => setLoading(""));
  }, []);

  const fetchGene = gene => {
    const geneOnFasta = site.getGeneOnFasta(fastaData[type], gene);
    const geneOnCell = site.getGeneOnCell(cellData[type], gene);

    setSearchGene({ fasta: geneOnFasta, cell: geneOnCell });
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
            fetchGene(gene);
          }}
        />
      </Row>
      <Row>
        <GeneMaps compounds={compoundLabels[type]} gene={searchGene} />
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
