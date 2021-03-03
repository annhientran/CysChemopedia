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
import "styles/sites.css";

const defaultGene = "Q15910";

const Sites = ({ preloader = "Loading", setPreloader }) => {
  const [compoundLabels, setCompoundLabels] = useState({});
  const [fastaData, setFastaData] = useState({ human: [], mouse: [] });
  const [cellData, setCellData] = useState({ human: [], mouse: [] });
  const [compoundData, setCompoundData] = useState({ human: [], mouse: [] });
  const [searchTags, setSearchTags] = useState({ human: [], mouse: [] });
  const [type, setType] = useState("human");
  const [searchGene, setSearchGene] = useState({ fasta: null, cell: null });
  const [searchCompound, setSearchCompound] = useState("");

  useEffect(() => {
    site.fetchCompoundList().then(setCompoundLabels);
  }, []);

  useEffect(() => {
    if (!_.isEmpty(compoundLabels)) {
      setPreloader("Parsing human data");
      site
        .parseData("human")
        .then(data => {
          setFastaData(prevFasta => ({ ...prevFasta, human: data.fasta }));
          setCellData(prevCell => ({ ...prevCell, human: data.cell }));
          setSearchGene({
            fasta: site.getGeneOnFasta(data.fasta, defaultGene),
            cell: site.getGeneOnCell(data.cell, defaultGene)
          });

          setSearchTags(prevTags => ({
            ...prevTags,
            human: site.getSearchTags(data.fasta, data.cell)
          }));
          // debugger;
          const hsData = site.fetchHockeyStickData(
            compoundLabels.human,
            data.cell
          );

          setSearchCompound(hsData[0].name);
          // setSearchCompound(compoundLabels.human[0]);
          setCompoundData(prevCompoundData => ({
            ...prevCompoundData,
            human: hsData
          }));
          // // setCompoundData({
          // //   ...compoundData,
          // //   human: hsData
          // // });
        })
        .then(() => setPreloader(""))
        .catch(() => setPreloader(""));
    }
  }, [compoundLabels, setPreloader]);

  useEffect(() => {
    // switch to use toast noti for loading mouse data
    if (preloader === "") {
      const { hide } = toastNoti.loading("Parsing mouse data", {
        hideAfter: 0,
        position: "top-center"
      });

      site
        .parseData("mouse")
        .then(data => {
          setFastaData(prevFasta => ({ ...prevFasta, mouse: data.fasta }));
          setCellData(prevCell => ({ ...prevCell, mouse: data.cell }));
          setSearchTags(prevTags => ({
            ...prevTags,
            mouse: site.getSearchTags(data.fasta, data.cell)
          }));

          const hsData = site.fetchHockeyStickData(
            compoundLabels.mouse,
            data.cell
          );

          setCompoundData(prevCompoundData => ({
            ...prevCompoundData,
            mouse: hsData
          }));
        })
        .then(() => {
          hide();
          toastNoti.success("Mouse data is loaded", {
            hideAfter: 3,
            position: "top-center"
          });
          // }
        })
        .catch(() => {
          hide();
          toastNoti.error(
            "Oops!!! Something's wrong. This is a job for super Z and Nhien-man.",
            {
              hideAfter: 5,
              position: "top-center"
            }
          );
          // }
        });
    }
  }, [preloader, compoundLabels]);

  const fetchGene = gene => {
    // debugger;
    const geneOnFasta = site.getGeneOnFasta(fastaData[type], gene);
    const geneOnCell = site.getGeneOnCell(cellData[type], gene);

    if (!geneOnCell)
      toastNoti.error(
        "The uniprot accession or gene symbol does not exist on cell data.",
        {
          hideAfter: 5,
          position: "top-center"
        }
      );
    else if (!geneOnFasta)
      toastNoti.warn(
        "The uniprot accession or gene symbol has no mapped values",
        {
          hideAfter: 5,
          position: "top-center"
        }
      );
    else setSearchGene({ fasta: geneOnFasta, cell: geneOnCell });
  };

  useEffect(() => {
    if (
      !_.isEmpty(compoundLabels[type]) &&
      !_.isEmpty(cellData[type]) &&
      _.isEmpty(compoundData[type])
    ) {
      const data = site.fetchHockeyStickData(
        compoundLabels[type],
        cellData[type]
      );
      setSearchCompound(data[0].name);
      setCompoundData({
        ...compoundData[type],
        [type]: data
      });
    }
  }, [cellData, compoundLabels, searchCompound, compoundData, type]);

  return (
    <>
      {/* <SEO title="Sites" /> */}
      <Row
        className="center-block"
        // style={{ justifyContent: "center" }}
      >
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
