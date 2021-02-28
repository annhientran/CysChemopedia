import _ from "lodash";
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
  const [searchCompound, setSearchCompound] = useState("");

  useEffect(() => {
    if (_.isEmpty(compoundLabels[type]))
      site.fetchCompoundList().then(setCompoundLabels);

    if (
      _.isEmpty(fastaData[type]) &&
      _.isEmpty(cellData[type]) &&
      _.isEmpty(searchTags[type])
    ) {
      setLoading("Loading");
      site
        .parseData(type)
        .then(data => {
          setFastaData({ ...fastaData, [type]: data.fasta });
          setCellData({ ...cellData, [type]: data.cell });
          setSearchGene({
            fasta: site.getGeneOnFasta(data.fasta, defaultGene),
            cell: site.getGeneOnCell(data.cell, defaultGene)
          });

          setSearchTags({
            ...searchTags,
            [type]: site.getSearchTags(data.fasta, data.cell)
          });
        })
        .then(() => setLoading(""))
        // .then(() => site.parseData("mouse"))
        // .then(data => {debugger;
        //   setFastaData({ ...fastaData, mouse: data.fasta });
        //   setCellData({ ...cellData, mouse: data.cell });
        //   setSearchTags({
        //     ...searchTags,
        //     mouse: site.getSearchTags(data.fasta, data.cellData)
        //   });
        // })
        // // })
        .catch(() => setLoading(""));
    }
  }, [type, compoundLabels, fastaData, cellData, searchTags]);

  const fetchGene = gene => {
    // debugger;
    const geneOnFasta = site.getGeneOnFasta(fastaData[type], gene);
    const geneOnCell = site.getGeneOnCell(cellData[type], gene);

    setSearchGene({ fasta: geneOnFasta, cell: geneOnCell });
  };

  useEffect(() => {
    if (
      !_.isEmpty(compoundLabels[type]) &&
      !_.isEmpty(cellData[type]) &&
      _.isEmpty(compoundData[type])
    ) {
      setSearchCompound(compoundLabels[type][0]);
      setCompoundData({
        ...compoundData[type],
        [type]: site.fetchHockeyStickData(compoundLabels[type], cellData[type])
      });
    }
  }, [cellData, compoundLabels, searchCompound, compoundData, type]);

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
          cellData={cellData[type]}
          colsInDownloadCSV={[
            "site",
            "cysteine",
            "uniprot_accession",
            "gene_symbol",
            "prot_description",
            "organism",
            "cell_line",
            "engaged"
          ]}
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
