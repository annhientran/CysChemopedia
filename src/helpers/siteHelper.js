import _ from "lodash";
import { csv } from "d3";
import { isUnmapped } from "helpers/chartHelper";
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

  const defaultForEmpty = {
    name: hockeyStick1stTabText,
    data: [[0, 0, "", ""]]
  };

  if (label === hockeyStick1stTabText) return defaultForEmpty;

  const NaNfiltered = _.reject(cellData, [[label], ""]);

  if (_.isEmpty(NaNfiltered)) return defaultForEmpty;

  const sortedData = _.sortBy(NaNfiltered, [
    function (site) {
      return site[label];
    }
  ]);

  let filteredData = {};
  sortedData.forEach((site, i) => {
    const compoundVal = site[label] ? parseFloat(site[label]).toFixed(2) : null;

    if (compoundVal && filteredData[compoundVal] && site.engaged === 1) {
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
    b => b.Entry === gene
  );

  if (_.isEmpty(proteinOnFasta)) return null;

  return proteinOnFasta[0];
}

export function getGeneOnCell(cellData, gene) {
  if (!gene || _.isEmpty(cellData)) return null;

  const proteinOnCelltbl = cellData.filter(
    b => b.entry === gene
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
      cysData.push({ x: cellLine, y: isUnmapped });
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
      label: `${protein.Entry} — ${protein["Gene names (primary)"]}`
    };
  });
  const cellTags = cellData.map(site => {
    const gene = site.gene_symbol.toUpperCase();
    return {
      entry: site.entry,
      geneSym: gene,
      label: `${site.entry} — ${gene}`
    };
  });
  // temp solution to deal with empty value data
  const allTags = fastaTags.concat(cellTags).filter(tag => {
    return tag.entry !== "" && tag.gene_symbol !== "";
  });

  return _.uniqBy(allTags, "label");
}

export function getHockeyStickCSV(activeTab, cellData, infoCols, compound) {
  if (parseInt(activeTab) === 0) return [];

  const NaNfiltered = _.reject(cellData, [[compound], ""]);

  infoCols.push(compound);

  return NaNfiltered.map(site => {
    return _.pick(site, infoCols);
  });
}
