import _ from "lodash";
import { csv } from "d3";

const fastaPath = {
  human: "assets/data/mockdata/HumanFasta.csv",
  mouse: "assets/data/mockdata/MouseFasta.csv"
};
const cellPath = {
  human: "assets/data/mockdata/HumanCellData.csv",
  mouse: "assets/data/mockdata/MouseCellData.csv"
};
const compoundListPath = "assets/data/mockdata/Compounds.csv";

export function parseFastaData(type) {
  csv(fastaPath[type], value => {
    const reviewed = _.filter(value, ["Status", "reviewed"]);
    const allFastaData = _.sortBy(reviewed, ["Entry", "Gene names (primary)"]);

    return Promise.resolve(allFastaData);
  });
}

export function parseCellData(type) {
  csv(cellPath[type], value => {
    const allCellData = _.sortBy(value, ["uniprot_accession", "gene_symbol"]);

    return Promise.resolve(allCellData);
  });
}

export function fetchCompoundList() {
  let compoundLabels = {
    human: [],
    mouse: []
  };

  csv(compoundListPath, value => {
    value.forEach(compound =>
      compoundLabels[compound.type].push(compound.name)
    );

    return Promise.resolve(compoundLabels);
  });
}

export function getGeneOnFasta(type, fastaData, gene) {
  if (!gene) return null;

  const proteinOnFasta = fastaData[type].filter(
    b =>
      _.includes(b.Entry, gene) || _.includes(b["Gene names (primary)"], gene)
  );

  if (_.isEmpty(proteinOnFasta)) return null;

  return proteinOnFasta[0];
}

export function getGeneOnCell(type, cellData, gene) {
  if (!gene) return null;

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

  cysArr.map(cys => {
    cysData = [];
    cysteineName = `C${parseInt(cys)}`;

    cellLineList.map(cellLine => {
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
  if (!proteinOnFasta || !proteinOnCell) return null;

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
