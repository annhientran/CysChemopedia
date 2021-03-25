import _ from "lodash";
import { csv } from "d3";

// ------------------ mockdata-------------------------
// import FastaHumanCSV from "data/mockdata/HumanFasta.csv";
// import CellHumanCSV from "data/mockdata/HumanCellData.csv";
// import FastaMouseCSV from "data/mockdata/MouseFasta.csv";
// import CellMouseCSV from "data/mockdata/MouseCellData.csv";
// import CompoundsCSV from "data/mockdata/Compounds.csv";

// ------------------ real data-------------------------
import FastaHumanCSV from "data/realdata/HumanFasta.csv";
import CellHumanCSV from "data/realdata/HumanCellData.csv";
import FastaMouseCSV from "data/realdata/MouseFasta.csv";
import CellMouseCSV from "data/realdata/MouseCellData.csv";
import CompoundsCSV from "data/realdata/Compounds.csv";

export const typeOptions = [
  { label: "HUMAN", value: "human" },
  { label: "MOUSE", value: "mouse" }
];

export const hockeyStick1stTabText = "Select Compound";

const fastaPath = {
  human: FastaHumanCSV,
  mouse: FastaMouseCSV
};
const cellPath = {
  human: CellHumanCSV,
  mouse: CellMouseCSV
};

export function parseData(type) {
  return Promise.all([csv(fastaPath[type]), csv(cellPath[type])]).then(data => {
    const [_fasta, _cell] = data;
    return {
      fasta: _.sortBy(_fasta, ["Entry", "Gene names (primary)"]),
      cell: _.sortBy(_cell, ["entry", "gene_symbol"])
    };
  });
}

export function fetchCompoundList() {
  return csv(CompoundsCSV).then(data => {
    let compoundLabels = {
      human: [],
      mouse: []
    };

    data.forEach(compound =>
      compoundLabels[compound.type].push({
        name: compound.name,
        order: parseInt(compound.order)
      })
    );

    _.keys(compoundLabels).forEach(
      type =>
        (compoundLabels[type] = _.sortBy(compoundLabels[type], [
          "order",
          "name"
        ]))
    );

    return compoundLabels;
  });
}

export function fetchHockeyStickData(label, cellData) {
  if (!label) return null;

  if (label === hockeyStick1stTabText)
    return { name: hockeyStick1stTabText, data: [[0, 0, "", ""]] };

  const NaNfiltered = _.reject(cellData, [[label], ""]);
  const sortedData = _.sortBy(NaNfiltered, [
    function (site) {
      return site[label];
    }
  ]);

  let filteredData = {};
  sortedData.forEach((site, i) => {
    const compoundVal = site[label] ? parseFloat(site[label]).toFixed(2) : null;

    if (compoundVal && filteredData[compoundVal] && site.engaged >= 2) {
      filteredData[compoundVal].name += `, ${site.gene_symbol}`;

      if (filteredData[compoundVal].cysnumber.indexOf(site.cysteine) >= 0)
        filteredData[compoundVal].cysnumber += `, ${site.cysteine}`;
    } else if (compoundVal && !filteredData[compoundVal]) {
      filteredData[compoundVal] = {
        index: i,
        name: site.gene_symbol,
        cysnumber: site.cysteine
      };
    }
  });

  let seriesData = _.map(filteredData, (value, key) => [
    value.index,
    parseFloat(key),
    value.name,
    value.cysnumber
  ]);

  return { name: label, data: seriesData };
}

export function getGeneOnFasta(fastaData, gene) {
  if (!gene || _.isEmpty(fastaData)) return null;

  const proteinOnFasta = fastaData.filter(
    b => b.Entry === gene || b["Gene names (primary)"] === gene
  );

  if (_.isEmpty(proteinOnFasta)) return null;

  return proteinOnFasta[0];
}

export function getGeneOnCell(cellData, gene) {
  if (!gene || _.isEmpty(cellData)) return null;

  const proteinOnCelltbl = cellData.filter(
    b => b.entry === gene || b.gene_symbol === gene
  );

  if (_.isEmpty(proteinOnCelltbl)) return null;

  return proteinOnCelltbl;
}

function setHeatMapBase(cysArr, cellLineList) {
  let ret = [];
  let cysData = [];
  let cysteineName = "";

  cysArr.forEach(cys => {
    cysData = [];
    cysteineName = `C${parseInt(cys)}`;

    cellLineList.forEach(cellLine => {
      cysData.push({ x: cellLine, y: 0 });
    });

    ret.push({
      name: cysteineName,
      data: cysData
    });
  });

  return ret;
}

export function parseGeneData(proteinOnFasta, proteinOnCell, compounds) {
  if (!proteinOnFasta || !proteinOnCell) {
    const emptyCysData = { name: "", data: { x: 0, y: 0 } };
    return { cysCellData: [emptyCysData], cellLineList: [], rVals: [] };
  }

  let cellLineList = [];
  let sitesCysCell = [];
  let rVals = [];
  const fastaCysteine = _.sortedUniq(proteinOnFasta.Cysteine.split(";"));

  _.forEach(proteinOnCell, site => {
    if (!_.includes(cellLineList, site.cell_line))
      cellLineList.push(site.cell_line);

    site.cysteine.split(";").forEach(cysNum => {
      sitesCysCell.push({ ...site, cysteine: parseInt(cysNum) });
    });
  });

  cellLineList = _.sortedUniq(cellLineList);
  sitesCysCell = _.sortBy(sitesCysCell, ["cysteine", "cell_line"]);

  let cysCellData = setHeatMapBase(fastaCysteine, cellLineList);

  _.map(sitesCysCell, site => {
    const cysteineName = `C${parseInt(site.cysteine)}`;
    let existedCysPos = _.findIndex(cysCellData, e => e.name === cysteineName);
    let dataArr = existedCysPos >= 0 ? cysCellData[existedCysPos].data : null;
    let cellLinePos = _.findIndex(dataArr, e => e.x === site.cell_line);

    if (existedCysPos >= 0 && cellLinePos >= 0) {
      cysCellData[existedCysPos].data[cellLinePos].y = parseInt(site.engaged);

      const val = compounds.map(label => {
        return site[label.name];
      });

      rVals.push({
        name: cysteineName,
        cellLine: site.cell_line,
        values: val
      });
    }
  });

  return { cysCellData, cellLineList, rVals };
}

export function getSearchTags(fastaData, cellData) {
  const fastaTags = fastaData.map(protein => {
    return {
      entry: protein.Entry,
      geneSym: protein["Gene names (primary)"],
      // label: `Uniprot Accession: ${protein.Entry} — Gene: ${protein["Gene names (primary)"]}`
      label: `${protein.Entry} — ${protein["Gene names (primary)"]}`
    };
  });
  const cellTags = cellData.map(site => {
    return {
      entry: site.entry,
      geneSym: site.gene_symbol,
      // label: `Uniprot Accession: ${site.uniprot_accession} — Gene: ${site.gene_symbol}`
      label: `${site.entry} — ${site.gene_symbol}`
    };
  });
  // temp solution to deal with empty value data
  const allTags = fastaTags.concat(cellTags).filter(tag => {
    return tag.accession !== "" && tag.value !== "";
  });

  return _.uniqBy(allTags, "label");
}

export function getHockeyStickCSV(activeTab, cellData, infoCols, compound) {
  if (parseInt(activeTab) === 0) return [];

  infoCols.push(compound);

  const ret =  cellData.map(site => {
    return _.pick(site, infoCols);
  });
  return ret;
}
