import React, { useState, useEffect } from "react";
import { Row } from "react-bootstrap";
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
  const [searchTags, setSearchTags] = useState({ human: [], mouse: [] });
  const [type, setType] = useState("human");
  const [searchGene, setSearchGene] = useState({ fasta: null, cell: null });
  const [searchCompound, setSearchCompound] = useState("");

  useEffect(() => {
    setPreloader({ text: "Parsing human data", cssClass: "blinds" });

    site
      .fetchCompoundList()
      .then(setCompoundLabels)
      .then(() => site.parseData("human"))
      .then(data => {
        setFastaData(prevFasta => ({ ...prevFasta, human: data.fasta }));
        setCellData(prevCell => ({ ...prevCell, human: data.cell }));

        // set initial gene on heatmap and barchart to defaultGene
        setSearchGene({
          fasta: site.getGeneOnFasta(data.fasta, defaultGene),
          cell: site.getGeneOnCell(data.cell, defaultGene)
        });

        setSearchTags(prevTags => ({
          ...prevTags,
          human: site.getSearchTags(data.fasta, data.cell)
        }));

        // set initial tab on hockey stick chart
        setSearchCompound(site.hockeyStick1stTabText);
      })
      .then(() =>
        setPreloader({ text: "Parsing mouse data", cssClass: "half-blinds" })
      )
      .then(() => site.parseData("mouse"))
      .then(data => {
        setFastaData(prevFasta => ({ ...prevFasta, mouse: data.fasta }));
        setCellData(prevCell => ({ ...prevCell, mouse: data.cell }));

        setSearchTags(prevTags => ({
          ...prevTags,
          mouse: site.getSearchTags(data.fasta, data.cell)
        }));
      })
      .then(() => setPreloader(null))
      .catch(() => setPreloader(null));
  }, [setPreloader]);

  const fetchGeneByEntry = entry => {
    const geneOnFasta = site.getGeneOnFasta(fastaData[type], entry);
    const geneOnCell = site.getGeneOnCell(cellData[type], entry);

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

  return (
    <>
      {/* <SEO title="Sites" /> */}
      <Row className="center-block">
        <SiteSearchBar
          searchTags={searchTags[type]}
          searchType={type}
          onSelectType={type => {
            setSearchCompound(site.hockeyStick1stTabText);
            setType(type);
          }}
          onSubmit={fetchGeneByEntry}
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
          compoundData={compoundLabels[type]}
          cellData={cellData[type]}
          searchType={type}
          colsInDownloadCSV={[
            "site",
            "cysteine",
            "entry",
            "gene_symbol",
            "prot_description",
            "motif",
            "sequence",
            "cell_line",
            "engaged"
          ]}
        />
      </Row>
    </>
  );
};

export default Sites;
