import _ from "lodash";
import { csv } from "d3";
import FastaHumanCSV from "data/mockdata/HumanFasta.csv";
import CellHumanCSV from "data/mockdata/HumanCellData.csv";
import FastaMouseCSV from "data/mockdata/MouseFasta.csv";
import CellMouseCSV from "data/mockdata/MouseCellData.csv";
import CompoundsCSV from "data/mockdata/Compounds.csv";

const fastaPath = {
  human: FastaHumanCSV,
  mouse: FastaMouseCSV
};
const cellPath = {
  human: CellHumanCSV,
  mouse: CellMouseCSV
};

export function parseFastaData(type) {
  return csv(fastaPath[type]).then(data => {
    const reviewed = _.filter(data, ["Status", "reviewed"]);
    return _.sortBy(reviewed, ["Entry", "Gene names (primary)"]);
  });
}

export function parseCellData(type) {
  return csv(cellPath[type]).then(data => {
    return _.sortBy(data, ["uniprot_accession", "gene_symbol"]);
  });
}

export function fetchCompoundList() {
  return csv(CompoundsCSV).then(data => {
    let compoundLabels = {
      human: [],
      mouse: []
    };

    data.forEach(compound => compoundLabels[compound.type].push(compound.name));

    return compoundLabels;
  });
}

export function getGeneOnFasta(type, fastaData, gene) {
  if (!gene || !_.isEmpty(fastaData)) return null;

  const proteinOnFasta = fastaData[type].filter(
    b =>
      _.includes(b.Entry, gene) || _.includes(b["Gene names (primary)"], gene)
  );

  if (_.isEmpty(proteinOnFasta)) return null;

  return proteinOnFasta[0];
}

export function getGeneOnCell(type, cellData, gene) {
  if (!gene || !_.isEmpty(cellData)) return null;

  const proteinOnCelltbl = cellData[type].filter(
    b => b.uniprot_accession === gene || b.gene_symbol === gene
  );

  if (_.isEmpty(proteinOnCelltbl)) return null;

  return proteinOnCelltbl;
}

// function padCysCellArr(cysArr, cellLineList) {
//   _.forEach(cellLineList, cellLine => {
//     if (_.isEmpty(_.filter(cysArr, ["x", cellLine])))
//       cysArr.push({ x: cellLine, y: 0 });
//   });

//   return _.sortBy(cysArr, ["x"]);
// }

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
  debugger;
  if (!proteinOnFasta || !proteinOnCell)
    return { name: "", data: { x: 0, y: 0 } };

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
        return site[label];
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
