//Oximouse js fnxns
/**
 * The Oximouse website is licensed under the CC BY 4.0 license: https://creativecommons.org/licenses/by/4.0/
 * @author Devin Schweppe <devin_schweppe@hms.harvard.edu>
 */

const defaultGene = "Q15910";
const searchBarSelect = document.getElementById("searchBarSelect");
let organism = "human";
var searchTags = { human: [], mouse: [] };
var compoundLabels = { human: [], mouse: [] };
var allFastaData = {
  human: [],
  mouse: []
};
var allCellData = {
  human: [],
  mouse: []
};
const fastaPath = {
  human: "assets/data/mockdata/HumanFasta.csv",
  mouse: "assets/data/mockdata/MouseFasta.csv"
};
const cellPath = {
  human: "assets/data/mockdata/HumanCellData.csv",
  mouse: "assets/data/mockdata/MouseCellData.csv"
};
const compoundListPath = "assets/data/mockdata/Compounds.csv";

function fetchCompoundList() {
  d3.csv(compoundListPath, function (value) {
    value.forEach(compound =>
      compoundLabels[compound.type].push(compound.name)
    );
  });
}

function mapValue(object, iteratee) {
  object = Object(object);
  const result = {};
  Object.keys(object).forEach(key => {
    result[key] = iteratee(object[key], key, object);
  });
  return result;
}

function setSearchType(type) {
  let curr = document.querySelector("#searchBarSelect li.active");

  if (type === curr.innerHTML) return;

  let newSelect = document.querySelector(
    "#searchBarSelect li:not([class=active])"
  );

  curr.classList.remove("active");
  newSelect.classList.add("active");

  if (!_.isEmpty(searchTags[type])) 
    setupAutoCompleteSearch(searchTags[type]);
  else buildSearchTags(type, true);
}

function buildSearchTags(type, activate) {
  let fastaTags = {};
  let cellTags = {};

  allFastaData[type].forEach(protein => {
    fastaTags[protein.Entry] = protein["Gene names (primary)"];
    fastaTags[protein["Gene names (primary)"]] =
      protein["Gene names (primary)"];
  });

  allCellData[type].forEach(site => {
    cellTags[site.uniprot_accession] = site.gene_symbol;
    cellTags[site.gene_symbol] = site.gene_symbol;
  });

  const allTags = _.mergeWith(cellTags, fastaTags, x => {
    return;
  });
  searchTags[type] = _.sortBy(
    _.map(allTags, (value, key) => {
      return { label: key, value: value };
    }),
    ["label", "value"]
  );

  if (activate) setupAutoCompleteSearch(searchTags[type]);
}

function setupAutoCompleteSearch(searchTags) {
  $(function () {
    var availableTags = searchTags;
    $("#sitesSearchInput").autocomplete({
      position: { my: "left bottom", at: "left top", collision: "flip" },
      source: function (request, response) {
        var results = $.ui.autocomplete.filter(availableTags, request.term);

        response(results.slice(0, 10));
      },
      minLength: 2,
      autoFocus: true
    });
  });
}

function searchByGene() {
  const enteredGene = document.getElementById("sitesSearchInput").value;
  const type = document.getElementById("searchBarSelect").value;
  const proteinOnFasta = parseFastaData(type, enteredGene);
  parseCellData(type, enteredGene, proteinOnFasta);
}

function initiate() {
  fetchCompoundList();
  buildDatabase("human", defaultGene);
  buildDatabase("mouse");
}
initiate();

const searchBar = document.getElementById("sitesSearchInput");
searchBar.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    searchByGene();
  }
});

function buildDatabase(type, gene) {
  d3.csv(fastaPath[type], function (value) {
    const reviewed = _.filter(value, ["Status", "reviewed"]);
    allFastaData[type] = _.sortBy(reviewed, ["Entry", "Gene names (primary)"]);
    const proteinOnFasta = parseFastaData(type, gene);

    d3.csv(cellPath[type], function (value) {
      allCellData[type] = _.sortBy(value, ["uniprot_accession", "gene_symbol"]);
      parseCellData(type, gene, proteinOnFasta);

      if (_.isEmpty(searchTags[type])) buildSearchTags(type, gene);
    });
  });
}

function parseFastaData(type, gene) {
  if (!gene) return null;

  const proteinOnFasta = allFastaData[type].filter(
    b =>
      _.includes(b.Entry, gene) || _.includes(b["Gene names (primary)"], gene)
  );

  if (_.isEmpty(proteinOnFasta)) return;

  return proteinOnFasta[0];
}

function padCysCellArr(cysArr, cellLineList) {
  _.forEach(cellLineList, cellLine => {
    if (_.isEmpty(_.filter(cysArr, ["x", cellLine])))
      cysArr.push({ x: cellLine, y: 0 });
  });

  return _.sortBy(cysArr, ["x"]);
}

function setMapBase(cysArr, cellLineList) {
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

function parseCellData(type, gene, protein) {
  if (!gene || !protein) return null;

  let cellLineList = [];
  let sitesCysCell = [];
  let rVals = [];
  const fastaCysteine = _.sortedUniq(protein.Cysteine.split(";"));
  const proteinOnCelltbl = allCellData[type].filter(
    b => b.uniprot_accession === gene || b.gene_symbol === gene
  );

  _.forEach(proteinOnCelltbl, site => {
    if (!_.includes(cellLineList, site.cell_line))
      cellLineList.push(site.cell_line);

    site.cysteine.split(";").forEach(cysNum => {
      sitesCysCell.push({ ...site, cysteine: parseInt(cysNum) });
    });
  });
  // TODO: check if sortedUniq works
  cellLineList = _.sortedUniq(cellLineList);
  sitesCysCell = _.sortBy(sitesCysCell, ["cysteine", "cell_line"]);

  let cysCellData = setMapBase(fastaCysteine, cellLineList);

  _.map(sitesCysCell, site => {
    const cysteineName = `C${parseInt(site.cysteine)}`;
    let existedCysPos = _.findIndex(cysCellData, e => e.name === cysteineName);
    let dataArr = existedCysPos >= 0 ? cysCellData[existedCysPos].data : null;
    let cellLinePos = _.findIndex(dataArr, e => e.x === site.cell_line);

    if (existedCysPos >= 0 && cellLinePos >= 0) {
      cysCellData[existedCysPos].data[cellLinePos].y = parseInt(site.engaged);
      // }

      const val = compoundLabels[type].map(label => {
        return site[label];
      });

      rVals.push({
        name: cysteineName,
        cellLine: site.cell_line,
        values: val
      });
    }
  });

  buildMaps(protein, cysCellData, cellLineList, rVals, compoundLabels[type]);
}

function buildMaps(protein, cysCellData, cellLineList, rVals, xLabels) {
  $(chartTwo).empty();
  generateMaps(protein, cysCellData, cellLineList, rVals, xLabels);

  document.getElementById("barPlotDiv").style.display = "block";
  plotBar("non selected", [], xLabels);
}
