//Oximouse js fnxns
/**
 * The Oximouse website is licensed under the CC BY 4.0 license: https://creativecommons.org/licenses/by/4.0/
 * @author Devin Schweppe <devin_schweppe@hms.harvard.edu>
 */

let uniprotQuery;
let uniprotFeatures;
let disulfideFeatures;
let compounds;
let cellLine;
let sequence;
let sequenceArray;
let proteinR_Values;
let sitePositions;
let siteFeatures;
let proteinQuant;
let proteinError;
let allSiteData;
let orderedByTissue = false;
let cellLines;
let accession = "Q15910";
let siteObject;
let pqSites;
let cysteinePositions = [];
var AllCysteineR_Values = [];
let quantArray;
let proteinSet = [];
let cellLineSelect = document.getElementById("cellLineSelect");
var allHumanFastaData;
var proteinFastaCysPos;
var proteinOnFasta;
var proteinOnCelltbl;
const humanCellPath = "assets/data/mockdata/HumanCellData.csv";
const humanFastaPath = "assets/data/mockdata/HumanFasta.csv";

function mapValue(object, iteratee) {
  object = Object(object);
  const result = {};
  Object.keys(object).forEach(key => {
    result[key] = iteratee(object[key], key, object);
  });
  return result;
}

const searchBarSelect = document.getElementById("searchBarSelect");

let organism;
searchBarSelect.addEventListener("change", e => {
  debugger;
  organism = e.target.value.toLowerCase();
  if (organism == "human") {
    d3.csv(humanCellPath, function (value) {
      allHumanSiteData = value.sort((a, b) =>
        a.Uniprot > b.Uniprot ? 1 : b.Uniprot > a.Uniprot ? -1 : 0
      );
      let geneNames = Array.from(
        new Set(
          Object.values(
            mapValue(allHumanSiteData, ({ gene_symbol }) => gene_symbol)
          )
        )
      );
      let accessionArray = Array.from(
        new Set(
          Object.values(
            mapValue(
              allHumanSiteData,
              ({ uniprot_accession }) => uniprot_accession
            )
          )
        )
      );
      let searchArray = geneNames.concat(accessionArray);
      $(function () {
        var availableTags = searchArray;
        $("#sitesSearchInput").autocomplete({
          position: { my: "right top", at: "right bottom" },
          source: availableTags,
          minLength: 4
        });
      });
    });
  } else {
    d3.csv("assets/data/grady_list.csv", function (value) {
      allSiteData = value.sort((a, b) =>
        a.Uniprot > b.Uniprot ? 1 : b.Uniprot > a.Uniprot ? -1 : 0
      );
      let geneNames = Array.from(
        new Set(
          Object.values(mapValue(allSiteData, ({ gene_symbol }) => gene_symbol))
        )
      );
      let accessionArray = Array.from(
        new Set(
          Object.values(
            mapValue(allSiteData, ({ uniprot_accession }) => uniprot_accession)
          )
        )
      );
      let searchArray = geneNames.concat(accessionArray);
      $(function () {
        var availableTags = searchArray;
        $("#sitesSearchInput").autocomplete({
          position: { my: "right top", at: "right bottom" },
          source: availableTags,
          minLength: 4
        });
      });
    });
  }
});

function initiate() {
  document.getElementById("barPlotDiv").style.display = "none";
  proteinSet = [];
  compounds = []; // y-axis data
  sitePositions = []; // x-axis data

  if (organism && organism === "mouse") {
    getMouseChemoprotData();
  } else {
    getHumanChemoprotData();
  }
}
initiate();

const searchBar = document.getElementById("sitesSearchInput");
searchBar.addEventListener("keyup", e => {
  accession = e.target.value.toUpperCase();
});

let result;
let trigger = false;

function getEbiData(requestUrl) {
  d3.csv("assets/data/chemoprot_test_list.csv", function (list) {
    let searchParam = accession;
    debugger;
    if (searchParam) {
      requestUrl =
        "https://www.ebi.ac.uk/proteins/api/proteins?offset=0&size=1&accession=";
      requestUrl += searchParam;

      axios
        .get(requestUrl)
        .then(function (response) {
          result = response.data;
          parseEbiData();
        })
        .catch(function (error) {
          if (error.response) {
            trigger = true;
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            $("#EbiNotFound").modal();
            if (organism == "mouse") {
              getMouseChemoprotData();
            } else if (organism == undefined) {
              getMouseChemoprotData();
            } else {
              getHumanChemoprotData();
            }
          } else if (error.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
          } else {
            // Something happened in setting up the request that triggered an Error
          }
        });
    }
  });
}

let grady;
function getMouseChemoprotData() {
  d3.csv("assets/data/grady_list.csv", function (value) {
    allSiteData = value.sort((a, b) =>
      a.Uniprot > b.Uniprot ? 1 : b.Uniprot > a.Uniprot ? -1 : 0
    );
    let geneNames = Array.from(
      new Set(
        Object.values(mapValue(allSiteData, ({ gene_symbol }) => gene_symbol))
      )
    );
    let accessionArray = Array.from(
      new Set(
        Object.values(
          mapValue(allSiteData, ({ uniprot_accession }) => uniprot_accession)
        )
      )
    );
    let searchArray = geneNames.concat(accessionArray);
    //Object.values(siteObject).map(s => s.split("_")[s.split("_").length-1]);
    $(function () {
      var availableTags = searchArray;
      $("#sitesSearchInput").autocomplete({
        source: availableTags,
        minLength: 4
      });
    });
    proteinQuant = allSiteData.filter(b =>
      b.uniprot_accession.includes(accession)
    );
    if (trigger == true) {
      accession = allSiteData.find(
        item =>
          item.gene_symbol.toLowerCase().substring(0, accession.length) ===
          accession.toLowerCase()
      ).uniprot_accession;
      if (proteinQuant == 0) {
        proteinQuant = allSiteData.filter(b =>
          b.uniprot_accession.includes(accession)
        );
        trigger = false;
      }
      getEbiData();
    } else {
      trigger = false;
      getEbiData();
    }
  });
}

function getHumanChemoprotData() {
  d3.csv(humanCellPath, function (value) {
    allHumanSiteData = value.sort((a, b) =>
      a.Uniprot > b.Uniprot ? 1 : b.Uniprot > a.Uniprot ? -1 : 0
    );
    // debugger;
    // get searched protein on HumanCellData - set proteinQuant to proteinOnCelltbl
    proteinOnCelltbl = allHumanSiteData.filter(b => b.site.includes(accession));

    // if (trigger) {
    //   accession = allHumanSiteData.find(
    //     item =>
    //       item.gene_symbol.toLowerCase().substring(0, accession.length) ===
    //       accession.toLowerCase()
    //   ).uniprot_accession;
    //   if (proteinQuant == 0) {
    //     proteinQuant = allSiteData.filter(b =>
    //       b.uniprot_accession.includes(accession)
    //     );
    //     trigger = false;
    //   }
    //   // getEbiData();
    // } else {
    //   trigger = false;
    //   // getEbiData();
    // }
  });
}

function getHumanFastaData() {
  d3.csv(humanFastaPath, function (value) {
    allHumanFastaData = value.sort((a, b) =>
      a.Uniprot > b.Uniprot ? 1 : b.Uniprot > a.Uniprot ? -1 : 0
    );
    parseHumanFastaData();
  });
}
getHumanFastaData();

function parseEbiData() {
  additionalSiteMapName = "Phospho";
  geneName =
    typeof result[0].gene[0].name == "undefined"
      ? accession
      : result[0].gene[0].name.value;
  accessionNumber = uniprotQuery =
    typeof result[0].accession == "undefined" ? accession : result[0].accession;
  proteinName =
    typeof result[0].protein.recommendedName == "undefined"
      ? geneName
      : result[0].protein.recommendedName.fullName.value;
  if (
    typeof result[0].comments == "undefined" ||
    result[0].comments.filter(b => b.type == "FUNCTION").length == 0
  ) {
    commentFunction = "No known function found in Uniprot";
  } else {
    commentFunction = result[0].comments.filter(b => b.type == "FUNCTION")[0]
      .text[0].value;
  }
  if (organism !== "human") {
    sequence = result[0].sequence.sequence;
    sequenceArray = sequence.split("").map((x, index) => x + (index + 1));
  }

  if (typeof result[0].features !== "undefined") {
    uniprotFeatures = [
      ...new Set(
        result[0].features
          .filter(
            b =>
              b.type == "MOD_RES" &&
              b.description.includes(additionalSiteMapName)
          )
          .map(b => +b["begin"])
      )
    ];
    disulfideFeatures = [
      ...new Set(
        result[0].features
          .filter(b => b.type == "DISULFID")
          .map(b => +b["begin"])
      )
    ];
  }
  if (organism == "human") {
    parseHumanFastaData();
  } else {
    parseMouseChemoprotData();
  }
  return sequence;
}

function parseMouseChemoprotData() {
  cellLines = Object.values(
    mapValue(proteinQuant, ({ cell_line }) => cell_line)
  );
  let defaultSelection = true;
  let cellLineOptions = _.union(cellLines);

  if (cellLineSelect.value == 0) {
    selectedOption = cellLineOptions[0];
  }
  if (organism == "mouse") {
    selectedOption = cellLineOptions[0];
  }

  // if(cellLineSelect.value==0){let selectedOption = cellLineOptions[0]};

  _.filter(proteinQuant, function (o) {
    if (o.cell_line == selectedOption) {
      proteinSet.push(o);
    }
  });

  function addCellLineSelectOptions() {
    $(cellLineSelect).empty();
    for (var i = 0; i < cellLineOptions.length; i++) {
      var option = cellLineOptions[i];
      var el = document.createElement("option");
      el.textContent = option;
      el.value = option;
      cellLineSelect.appendChild(el);
    }
  }
  addCellLineSelectOptions();

  cellLineSelect.addEventListener("change", event => {
    defaultSelection = false;
    selectedOption = event.target.value;
    proteinSet = [];
    compounds = [];
    sitePositions = [];
    _.filter(proteinQuant, function (o) {
      if (o.cell_line == selectedOption) {
        proteinSet.push(o);
      }
    });

    siteObject = mapValue(proteinSet, ({ site }) => site);
    sitePositionsString = Object.values(siteObject).map(
      s => s.split("_")[s.split("_").length - 1]
    );
    sitePositions = sitePositionsString.map(i => Number(i));
    compounds = Object.keys(proteinSet[0])
      .filter(b => b.includes("C"))
      .filter(b => !b.includes("Ce"));
    ConsumeSiteData("assets/data/grady_list.csv", accession);
    plotData();
  });

  if ((defaultSelection = true)) {
    siteObject = mapValue(proteinSet, ({ site }) => site);
    sitePositionsString = Object.values(siteObject).map(
      s => s.split("_")[s.split("_").length - 1]
    );
    sitePositions = sitePositionsString.map(i => Number(i));
    compounds = Object.keys(proteinSet[0])
      .filter(b => b.includes("C"))
      .filter(b => !b.includes("Ce"));
    proteinR_Values = RandomMultiDimArray(sequence.length, compounds.length, 0);
    proteinError = UpdateProteinSitesFromArray(
      sitePositions,
      proteinSet,
      false,
      "se_"
    );
    ConsumeSiteData("assets/data/grady_list.csv", accession);
    plotData();
  }
}

function padCysCellArr(cysArr, cellLineList) {
  // let ret = [];

  // if (_.isEmpty(cysArr))
  //   _.forEach(cellLineList, cellLine => {
  //     cysArr.push({ x: cellLine, y: null });
  //   });
  // else {
  _.forEach(cellLineList, cellLine => {
    if (_.isEmpty(_.filter(cysArr, ["x", cellLine])))
      cysArr.push({ x: cellLine, y: null });
  });
  // }

  return _.sortBy(cysArr, ["x"]);
}

function parseHumanChemoprotData() {
  // siteObject = mapValue(proteinOnCelltbl, ({ site }) => site);
  // sitePositionsString = Object.values(siteObject).map(
  //   s => s.split("_")[s.split("_").length - 1]
  // );
  // sitePositions = sitePositionsString.map(i => Number(i));
  // compounds = Object.keys(proteinOnCelltbl[0])
  //   .filter(b => b.includes("C"))
  //    .filter(b => !b.includes("Ce"));
  // cellLines = Object.values(
  //   mapValue(proteinOnCelltbl, ({ cell_line }) => cell_line)
  // );
  // proteinR_Values = RandomMultiDimArray(sequence.length, compounds.length, 0);

  // sitesCysCell = mapValue(
  //   proteinOnCelltbl,
  //   ({
  //     cysteine,
  //     cell_line,
  //     engaged,
  //     C1,
  //     C2,
  //     C3,
  //     C4,
  //     C5,
  //     C6,
  //     C7,
  //     C8,
  //     C9,
  //     C10,
  //     C11,
  //     C12,
  //     C13,
  //     C14
  //   }) => [
  //     cysteine,
  //     cell_line,
  //     engaged,
  //     C1,
  //     C2,
  //     C3,
  //     C4,
  //     C5,
  //     C6,
  //     C7,
  //     C8,
  //     C9,
  //     C10,
  //     C11,
  //     C12,
  //     C13,
  //     C14
  //   ]
  // );

  // let cellLineList = mapValue(proteinOnCelltbl, ({ cell_line }) => cell_line);
  // let unmappedCys = [];
  // let mappedCys = [];
  // let engagedCys = [];

  let cellLineList = [];
  let cysCellData = [];
  let sitesCysCell = [];
  let rVals = [];

  _.forEach(proteinOnCelltbl, site => {
    if (!_.includes(cellLineList, site.cell_line))
      cellLineList.push(site.cell_line);

    site.cysteine.split(";").forEach(cysNum => {
      sitesCysCell.push({ ...site, cysteine: parseInt(cysNum) });
    });
  });
  cellLineList = _.sortedUniq(cellLineList);
  sitesCysCell = _.sortBy(sitesCysCell, [
    function (s) {
      return s.cysteine;
    }
  ]);
  // debugger;
  _.map(sitesCysCell, site => {
    //debugger;
    const status =
      site.engaged === "2" ||
      _.includes(proteinFastaCysPos, String(site.cysteine))
        ? site.engaged
        : 0;
    const cysteineName = `C${parseInt(site.cysteine)}`;

    if (!_.find(cysCellData, e => e.name === cysteineName)){
      let cysData = [{ x: site.cell_line, y: parseInt(status) }];

      cysData = padCysCellArr(cysData, cellLineList);
      cysCellData.push({
        name: cysteineName,
        data: cysData
      });
    } else {
      let existedCysPos = _.findIndex(cysCellData, e => e.name === cysteineName);
      let dataArr = cysCellData[existedCysPos].data;
      let cellLinePos = _.findIndex(dataArr, e => e.x === site.cell_line);

      cysCellData[existedCysPos].data[cellLinePos].y = parseInt(status);
    }

    rVals.push({
      name: cysteineName,
      cellLine: site.cell_line,
      values: [
        site.C1,
        site.C2,
        site.C3,
        site.C4,
        site.C5,
        site.C6,
        site.C7,
        site.C8,
        site.C9,
        site.C10,
        site.C11,
        site.C12,
        site.C13,
        site.C14
      ]
    });
  });

  let compoundLabels = Object.keys(proteinOnCelltbl[0])
    .filter(b => b.includes("C"));
  // debugger;   
  // const cysVal = parseInt(cysNum);
  // if (!_.includes(allCellLines, cellLine)) allCellLines.push(cellLine);
  // if (engaged === 1) engagedCys.push({ x: cellLine, y: cysVal });
  // else if (_.includes(proteinFastaCysPos, cysNum))
  //   mappedCys.push({ x: cellLine, y: cysVal });
  // else unmappedCys.push({ x: cellLine, y: cysVal });

  // unmappedCys = padCysCellArr(unmappedCys, allCellLines);
  // mappedCys = padCysCellArr(mappedCys, allCellLines);
  // engagedCys = padCysCellArr(engagedCys, allCellLines);
  // debugger;
  // const cysCellData = [
  //   {
  //     name: "Unmapped Cysteine",
  //     data: unmappedCys
  //   },
  //   { name: "Mapped Cysteine", data: mappedCys },
  //   { name: "Engaged Cysteine", data: engagedCys }
  // ];

  // let cellLineOptions = _.union(cellLines);
  // selectedOption = cellLineOptions[0];
  // function addCellLineSelectOptions() {
  // $(cellLineSelect).empty();
  // for (var i = 0; i < cellLineOptions.length; i++) {
  //   var option = cellLineOptions[i];
  //   var el = document.createElement("option");
  //   el.textContent = option;
  //   el.value = option;
  //   cellLineSelect.appendChild(el);
  // }
  // }
  // addCellLineSelectOptions();
  // _.filter(proteinOnCelltbl, function (o) {
  //   if (o.cell_line == selectedOption) {
  //     proteinSet.push(o);
  //   }
  // });
  // proteinError = UpdateProteinSitesFromArray(
  //   sitePositions,
  //   "se_"
  // );
  // ConsumeSiteData("data/humanCellData.csv", accession);
  // plotData();
  BuildMaps(cysCellData, cellLineList, rVals, compoundLabels);
}

function parseHumanFastaData() {
  // debugger;
  proteinOnFasta = allHumanFastaData.filter(
    b =>
      _.includes(b.Entry, accession) ||
      _.includes(b["Gene names (primary)"], accession)
  );
  // proteinQuant = allHumanSiteData.filter(b => b.site.includes(accession));
  if (_.isEmpty(proteinOnFasta)) return;

  const protein = proteinOnFasta[0];
  geneName = protein["Gene names (primary)"];
  proteinName = protein["Protein names"];
  sequence = protein.Sequence;
  proteinFastaCysPos = protein.Cysteine.split(";");
  // sequenceArray = sequence.split("").map((x, index) => x + (index + 1));
  // sequenceArray = protein.Cysteine.split(";").map(pos => `C${pos}`);
  parseHumanChemoprotData();
}

function UpdateProteinSitesFromArray(
  sitesArray,
  quantArray,
  update = true,
  keyFinder = "C",
  addNewFeatures = true
) {
  let quantOutput = quantArray.map(b =>
    Object.keys(b)
      .filter((c, i) => c.includes("C"))
      .filter((c, i) => !c.includes("Ce"))
      .map(function (d) {
        if (isNaN(+b[d])) {
          return 0;
        } else {
          return +b[d];
        }
      })
  );
  if (organism == "human") {
    pqSites = quantArray.map(s =>
      parseInt(s.site.split("_")[s.site.split("_").length - 1])
    );
  } else {
    pqSites = quantArray.map(s =>
      parseInt(s.site.split("_")[s.site.split("_").length - 1])
    );
  }
  if (update) {
    proteinR_Values = proteinR_Values.map(function (b, i) {
      if (pqSites.includes(i + 1)) {
        return quantOutput[pqSites.indexOf(i + 1)];
      } else {
        return b;
      }
    });
  } else {
    return proteinR_Values
      .map(function (b, i) {
        if (pqSites.includes(i + 1)) {
          return quantOutput[pqSites.indexOf(i + 1)];
        }
      })
      .filter(el => typeof el !== "undefined");
  }
  return quantArray;
}

function ConsumeSiteData(
  newDataSource,
  uniprotAccessionQuery,
  compoundstring = "oxi_percent_"
) {
  return d3.csv(newDataSource, function (value) {
    // UpdateProteinSitesFromArray(sitePositions, proteinSet, quantArray);
    // AddFeatureViewListener(proteinSites, compounds, proteinError, sitePositions);
    BuildMaps();
    return;
  });
}

// function AddFeatureViewListener(dataArray, headerArray, errorArray, siteArray, targetDiv = 'siteQuantPlot', descriptionDiv = "siteDescriptionText"){
// 	featureViewer.onFeatureSelected(function (d) {
// 		let siteIndex = d.detail.start - 1;
// 		if(typeof errorArray !== "undefined" && siteArray.includes(d.detail.start)){
// 			let error = errorArray[siteArray.indexOf(d.detail.start)];
// 			PlotlyBar(headerArray, dataArray[siteIndex], -1, error);
// 			let el = $('#' + descriptionDiv);
// 			el.empty();
// 			el.append(jsonToTable({"Mod": "Cys-Oxidation","Site": d.detail.start}));
// 			currentSite = d.detail.start;
// 		}
// 	});
// }

function BuildMaps(cysCellData, cellLineList, rVals, compoundLabels) {
  $(chartTwo).empty();
  NewHeatmap(
    // compounds,
    // sitePositions,
    // cellLines,
    // sequenceArray,
    // proteinR_Values,
    // proteinQuant
    cysCellData,
    cellLineList,
    rVals,
    compoundLabels
  );
  // debugger;
  // CysOxiChart(chartData);
  // debugger;
  // PlotlyBar(compounds, proteinSites[0], -1,proteinError);
  // NewTable(
  //   "siteTable",
  //   "siteTableWrapper",
  //   Object.keys(proteinQuant[0]),
  //   proteinQuant
  // );
  // $(document).ready(function () {
  //   $("#siteTable").DataTable({
  //     dom: "Bfrtip",
  //     buttons: ["copy", "csv", "excel", "pdf"]
  //   });
  // });
  // onlyModInHeatmap = false;
}

function plotData(targetDiv = "#sequenceMap", sequenceOnly = true) {
  SendGaEvent(accession, "Site Query Initiated");
  orderedByTissue = false;
  $("#tissueOrderToggle").html("Order Compounds By R-Value");
  $("#cellLineOrderToggle").html("Order Cell Lines By R-Value");
  $("#proteinInformation").html(
    jsonToTable({
      "Protein Info": "",
      Accession: accessionNumber,
      Gene: geneName,
      Protein: proteinName,
      Fnxn: commentFunction
    })
  );
  AddExternalLinkListeners(accessionNumber, geneName);
  if (sequenceOnly) {
    $(targetDiv).empty();
    let newFeaturesArray = [
      GenerateFeature(SitesToPositions(uniprotFeatures), additionalSiteMapName),
      GenerateFeature(SitesToPositions(disulfideFeatures), "Disulfide")
    ];
    NewSequenceMap(targetDiv, sequence, newFeaturesArray);
  }
}

let onlyModInHeatmap = false;

let featureViewer;

function NewSequenceMap(sequenceMapTarget, sequence, newFeaturesArray) {
  let options = {
    showAxis: true,
    showSequence: true,
    brushActive: true,
    toolbar: true,
    bubbleHelp: false,
    zoomMax: 3
  };
  featureViewer = new FeatureViewer(sequence, sequenceMapTarget, options);
  if (typeof newFeaturesArray !== "undefined") {
    for (i = 0; i < newFeaturesArray.length; i++) {
      featureViewer.addFeature(newFeaturesArray[i]);
    }
  }
}

function GenerateFeature(
  positions = [
    { x: 1, y: 1 },
    { x: 10, y: 10 },
    { x: 20, y: 20 }
  ],
  name = "Oxidation",
  color = "#a40b0b",
  type = "rect"
) {
  let tempFeature = {
    data: positions,
    name: name,
    className: name,
    color: color,
    type: type,
    filter: name,
    description: name
  };
  return tempFeature;
}

function SitesToPositions(siteArray) {
  return siteArray.map(function (b) {
    return { x: b, y: b };
  });
}
