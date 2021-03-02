import _ from "lodash";
import React, { useState, useEffect } from "react";
import { Row } from "react-bootstrap";
// import { Lines } from "react-preloaders";
// import SEO from "components/seo";
import toastNoti from "cogo-toast";
import SiteSearchBar from "components/SearchBar";
import GeneMaps from "components/GeneMaps";
import HockeyStickChart from "components/HockeyStickChart";
import * as site from "helpers/siteHelper";

const defaultGene = "Q15910";

const Sites = ({ preloader = null, setPreloader }) => {
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
      setPreloader("Parsing human data");
      site
        .parseData("human")
        .then(data => {
          setFastaData(prevFasta => ({ ...prevFasta, human: data.fasta }));
          setCellData(prevCell => ({ ...prevCell, human: data.cell }));
          setSearchGene(prevTags => ({
            fasta: site.getGeneOnFasta(data.fasta, defaultGene),
            cell: site.getGeneOnCell(data.cell, defaultGene)
          }));

          setSearchTags(prevTags => ({
            ...prevTags,
            human: site.getSearchTags(data.fasta, data.cell)
          }));
        })
        // .then(() => setPreloader(""))
        .then(() => setPreloader("Parsing mouse data"))
        // .then(() =>
        //   toastNoti.loading("Parsing mouse data", {
        //     hideAfter: 5,
        //     position: "bottom-left"
        //   })
        // )
        .then(() => site.parseData("mouse"))
        .then(data => {
          setFastaData(prevFasta => ({ ...prevFasta, mouse: data.fasta }));
          setCellData(prevCell => ({ ...prevCell, mouse: data.cell }));
          setSearchTags(prevTags => ({
            ...prevTags,
            mouse: site.getSearchTags(data.fasta, data.cell)
          }));
        })
        // .then(() =>
        //   toastNoti.success("Mouse data is loaded", {
        //     hideAfter: 3,
        //     position: "bottom-left"
        //   })
        // )
        // .catch(() => {
        //   toastNoti.error(
        //     "Oops!!! Something's wrong. This is a job for super Z and Nhien-man.",
        //     {
        //       hideAfter: 5,
        //       position: "bottom-left"
        //     }
        //   );
        // })
        .then(() => setPreloader(""))
        .catch(() => setPreloader(""));
    }
  }, [type, compoundLabels, fastaData, cellData, searchTags, setPreloader]);

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
      {/* <SEO title="Sites" /> */}
      <Row>
        <SiteSearchBar
          searchTags={searchTags[type]}
          searchType={type}
          onSelectType={type => {
            //debugger;
            // setPreloader("Loading");
            setType(type);
          }}
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
          // fullpageLoader={preloader}
          // setFullpageLoader={setPreloader}
          // searchType={type}
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
    </>
  );
};

export default Sites;
