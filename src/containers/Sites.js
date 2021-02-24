import React, { useState, useEffect } from "react";
import { Row } from "react-bootstrap";
// import { Lines } from "react-preloaders";
import Preloader from "components/Preloader/index";
// import SEO from "components/seo";
import SiteSearchBar from "components/SearchBar";
import GeneMaps from "components/GeneMaps";
import HockeyStickChart from "components/HockeyStickChart";
import * as site from "helpers/siteHelper";

const defaultGene = "Q15910";

const Sites = () => {
  const [loading, setLoading] = useState(null);
  const [compoundLabels, setCompoundLabels] = useState({});
  const [fastaData, setFastaData] = useState({ human: [], mouse: [] });
  const [cellData, setCellData] = useState({ human: [], mouse: [] });
  const [compoundData, setCompoundData] = useState({ human: [], mouse: [] });
  const [searchTags, setSearchTags] = useState({ human: [], mouse: [] });
  const [type, setType] = useState("human");
  const [searchGene, setSearchGene] = useState({ fasta: null, cell: null });
  const [searchCompound, setSearchCompound] = useState([]);

  useEffect(() => {
    setLoading("Loading");
    site
      .fetchCompoundList()
      .then(setCompoundLabels)
      .then(() => site.parseData("human"))
      .then(data => {
        setFastaData({ ...fastaData, human: data.fasta });
        setCellData({ ...cellData, human: data.cell });
        setSearchGene({
          fasta: site.getGeneOnFasta(data.fasta, defaultGene),
          cell: site.getGeneOnCell(data.cell, defaultGene)
        });

        setSearchTags({
          ...searchTags,
          human: site.getSearchTags(data.fasta, data.cell)
        });
      })
      .then(() => setLoading(""))
      // .then(() => site.parseData("mouse"))
      // .then(data => {
      //   setFastaData({ ...fastaData, mouse: data.fasta });
      //   setCellData({ ...cellData, mouse: data.cell });
      // setSearchTags({
      //   ...searchTags,
      //   mouse: site.getSearchTags(data.fasta, data.cellData)
      // });
      // })
      .catch(() => setLoading(""));
  }, []);

  const fetchGene = gene => {
    //debugger;
    const geneOnFasta = site.getGeneOnFasta(fastaData[type], gene);
    const geneOnCell = site.getGeneOnCell(cellData[type], gene);

    setSearchGene({ fasta: geneOnFasta, cell: geneOnCell });
  };

  useEffect(() => {
    if (compoundLabels && cellData && !compoundData[type]) {
      setCompoundData({
        ...compoundData[type],
        [type]: site.fetchHockeyStickData(compoundLabels[type], cellData[type])
      });
    }
  }, [cellData, compoundLabels, compoundData, type]);

  return (
    <>
      <Preloader show={loading} />
      {/* <SEO title="Sites" /> */}
      <Row>
        <SiteSearchBar
          searchTags={searchTags[type]}
          searchType={type}
          onSelectType={type => setType(type)}
          onSubmit={fetchGene}
        />
      </Row>
      <Row>
        <GeneMaps
          compounds={compoundLabels[type]}
          gene={searchGene}
          setHockeyStickCompound={setSearchCompound}
        />
      </Row>
      <Row>
        <HockeyStickChart
          compound={searchCompound}
          setCompound={setSearchCompound}
          compoundData={compoundData[type]}
        />
      </Row>
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
