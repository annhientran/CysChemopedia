import _ from "lodash";
import { csv } from "d3";
import FastaHumanCSV from "data/mockdata/HumanFasta.csv";
import CellHumanCSV from "data/mockdata/HumanCellData.csv";
import FastaMouseCSV from "data/mockdata/MouseFasta.csv";
import CellMouseCSV from "data/mockdata/MouseCellData.csv";
import CompoundsCSV from "data/mockdata/Compounds.csv";

export const typeOptions = [
  { label: "HUMAN", value: "human" },
  { label: "MOUSE", value: "mouse" }
];

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
    const reviewed = _.filter(data[0], ["Status", "reviewed"]);
    const _fasta = _.sortBy(reviewed, ["Entry", "Gene names (primary)"]);
    const _cell = _.sortBy(data[1], ["uniprot_accession", "gene_symbol"]);

    return { fasta: _fasta, cell: _cell };
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

export function getGeneOnFasta(fastaData, gene) {
  if (!gene || _.isEmpty(fastaData)) return null;

  const proteinOnFasta = fastaData.filter(
    b =>
      _.includes(b.Entry, gene) || _.includes(b["Gene names (primary)"], gene)
  );

  if (_.isEmpty(proteinOnFasta)) return null;

  return proteinOnFasta[0];
}

export function getGeneOnCell(cellData, gene) {//debugger;
  if (!gene || _.isEmpty(cellData)) return null;

  const proteinOnCelltbl = cellData.filter(
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

export function getSearchTags(fastaData, cellData) {
  const fastaTags = fastaData.map(protein => {
    return {
      accession: protein.Entry,
      value: protein["Gene names (primary)"],
      label: `Uniprot Accession: ${protein.Entry} — Gene: ${protein["Gene names (primary)"]}`
    };
  });
  const cellTags = cellData.map(site => {
    return {
      accession: site.uniprot_accession,
      value: site.gene_symbol,
      label: `Uniprot Accession: ${site.uniprot_accession} — Gene: ${site.gene_symbol}`
    };
  });
  // temp solution to deal with empty value data
  const allTags = fastaTags.concat(cellTags).filter(tag => {
    return tag.accession !== "" && tag.value !== "";
  });

  return _.uniqBy(allTags, "label");
}
