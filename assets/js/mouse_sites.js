//Oximouse js fnxns
/**
 * The Oximouse website is licensed under the CC BY 4.0 license: https://creativecommons.org/licenses/by/4.0/
 * @author Devin Schweppe <devin_schweppe@hms.harvard.edu>
 */


let uniprotQuery; let uniprotFeatures; let disulfideFeatures;
let compounds;
let sequence; let sequenceArray;
let proteinR_Values; let sitePositions; let siteFeatures;
let proteinQuant; let proteinError;
let allSiteData;
let orderedByTissue = false;
let cellLines;
let accession="P60330";
let siteObject;
let pqSites;
let cysteinePositions= [];
var AllCysteineR_Values = [];
let quantArray;
let proteinSet=[];
let cellLineSelect = document.getElementById('cellLineSelect');

function mapValue(object, iteratee) {
	object = Object(object)
	const result = {}
	Object.keys(object).forEach((key) => {
		result[key] = iteratee(object[key], key, object)
	})
	return result
}




const searchBarSelect = document.getElementById('searchBarSelect');

let organism;
searchBarSelect.addEventListener('change', (e) => {
	organism = e.target.value.toLowerCase();
	if(organism=="human"){
		d3.csv('assets/data/humanCellData.csv', function(value) {
			allHumanSiteData = value.sort((a,b) => (a.Uniprot > b.Uniprot) ? 1 : ((b.Uniprot > a.Uniprot) ? -1 : 0));
			let geneNames = Array.from(new Set(Object.values(mapValue(allHumanSiteData, ({ gene_symbol }) => gene_symbol))));
			let accessionArray = Array.from(new Set(Object.values(mapValue(allHumanSiteData, ({ uniprot_accession }) => uniprot_accession))));
			let searchArray = geneNames.concat(accessionArray);
			$( function() {
				var availableTags = searchArray;
				$( "#sitesSearchInput" ).autocomplete({
					position: { my : "right top", at: "right bottom" },
					source: availableTags,
					minLength: 4
				});
			} );
		});
	}else{
		d3.csv('assets/data/grady_list.csv', function(value) {

			allSiteData = value.sort((a,b) => (a.Uniprot > b.Uniprot) ? 1 : ((b.Uniprot > a.Uniprot) ? -1 : 0));
			let geneNames = Array.from(new Set(Object.values(mapValue(allSiteData, ({ gene_symbol }) => gene_symbol))));
			let accessionArray = Array.from(new Set(Object.values(mapValue(allSiteData, ({ uniprot_accession }) => uniprot_accession))));
			let searchArray = geneNames.concat(accessionArray);
			$( function() {
				var availableTags = searchArray;
				$( "#sitesSearchInput" ).autocomplete({
					position: { my : "right top", at: "right bottom" },
					source: availableTags,
					minLength: 4,
				});
			} );
		});
	}
});


function initiate(){
	document.getElementById('barPlotDiv').style.display="none";
	proteinSet=[];
	compounds = [];
	sitePositions = [];
	if(organism=="mouse"||undefined){
		getMouseChemoprotData();
	}else if(organism==undefined){
		getMouseChemoprotData();
	}else{
		getHumanChemoprotData();
	}
}initiate();

const searchBar = document.getElementById('sitesSearchInput');
searchBar.addEventListener('keyup', (e) => {
	accession = e.target.value.toUpperCase();
});





let result;
let trigger = false;

function getEbiData(requestUrl){
	d3.csv('assets/data/chemoprot_test_list.csv', function(list) {
		let searchParam = accession;
		if(searchParam) {
			requestUrl = "https://www.ebi.ac.uk/proteins/api/proteins?offset=0&size=1&accession=";
			requestUrl += searchParam;


			axios.get(requestUrl)
				.then(function (response) {
					result = response.data;
					parseEbiData();
				})
				.catch(function (error) {
						if (error.response) {
							trigger=true;
							// The request was made and the server responded with a status code
							// that falls out of the range of 2xx
							$('#EbiNotFound').modal();
							if(organism == "mouse"){
								getMouseChemoprotData();
							}else if(organism == undefined){
								getMouseChemoprotData();
							}else{
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
function getMouseChemoprotData(){
	d3.csv('assets/data/grady_list.csv', function(value) {
		allSiteData = value.sort((a,b) => (a.Uniprot > b.Uniprot) ? 1 : ((b.Uniprot > a.Uniprot) ? -1 : 0));
		let geneNames = Array.from(new Set(Object.values(mapValue(allSiteData, ({ gene_symbol }) => gene_symbol))));
		let accessionArray = Array.from(new Set(Object.values(mapValue(allSiteData, ({ uniprot_accession }) => uniprot_accession))));
		let searchArray = geneNames.concat(accessionArray);
		//Object.values(siteObject).map(s => s.split("_")[s.split("_").length-1]);
		$( function(){
			var availableTags = searchArray;
			$( "#sitesSearchInput" ).autocomplete({
				source: availableTags,
				minLength: 4
			});
		});
		proteinQuant = allSiteData.filter(b=>b.uniprot_accession.includes(accession));
		if(trigger == true){
			accession =allSiteData.find(item => item.gene_symbol.toLowerCase().substring(0, accession.length) === accession.toLowerCase()).uniprot_accession;
			if(proteinQuant==0){
				proteinQuant = allSiteData.filter(b=>b.uniprot_accession.includes(accession));
				trigger = false;
			}
			getEbiData();
		}else{
			trigger = false;
			getEbiData();
		}
	});
}

function getHumanChemoprotData(){
	d3.csv('assets/data/humanCellData.csv', function(value) {
		allHumanSiteData = value.sort((a,b) => (a.Uniprot > b.Uniprot) ? 1 : ((b.Uniprot > a.Uniprot) ? -1 : 0));
		proteinQuant = allHumanSiteData.filter(b=>b.site.includes(accession));
		if(trigger == true){
			accession =allHumanSiteData.find(item => item.gene_symbol.toLowerCase().substring(0, accession.length) === accession.toLowerCase()).uniprot_accession;
			if(proteinQuant==0){
				proteinQuant = allSiteData.filter(b=>b.uniprot_accession.includes(accession));
				trigger = false;
			}
			getEbiData();
		}else{
			trigger = false;
			getEbiData();
		}
	});
}

function getHumanFastaData(){
	d3.csv('assets/data/HumanFasta.csv', function(value) {
		allHumanFastaData = value.sort((a,b) => (a.Uniprot > b.Uniprot) ? 1 : ((b.Uniprot > a.Uniprot) ? -1 : 0));
	});
}
getHumanFastaData();



function parseEbiData(){
	additionalSiteMapName = "Phospho";
	geneName = (typeof(result[0].gene[0].name) == "undefined") ? accession : result[0].gene[0].name.value;
	accessionNumber = uniprotQuery = (typeof(result[0].accession) == "undefined") ? accession : result[0].accession;
	proteinName = (typeof(result[0].protein.recommendedName) == "undefined") ? geneName : result[0].protein.recommendedName.fullName.value;
	if(typeof(result[0].comments) == "undefined" || result[0].comments.filter(b=>b.type == "FUNCTION").length == 0){
		commentFunction = "No known function found in Uniprot";
	} else {
		commentFunction = result[0].comments.filter(b=>b.type == "FUNCTION")[0].text[0].value;
	}
	if(organism !=="human"){
		sequence = result[0].sequence.sequence;
		sequenceArray = sequence.split('').map((x,index)=>x + (index + 1));
	}

	if(typeof(result[0].features) !== "undefined"){
		uniprotFeatures = [...new Set(result[0].features.filter(b=>b.type == "MOD_RES" && b.description.includes(additionalSiteMapName)).map(b=>+b["begin"]))];
		disulfideFeatures = [...new Set(result[0].features.filter(b=>b.type == "DISULFID").map(b=>+b["begin"]))];
	}
	if(organism =="human"){
		parseHumanFastaData();
	}else{
		parseMouseChemoprotData();
	}
	return sequence;
}


function parseMouseChemoprotData(){
	cellLines = Object.values(mapValue(proteinQuant, ({ cell_line }) => cell_line));
	let defaultSelection = true;
	let cellLineOptions = _.union(cellLines);

	if(cellLineSelect.value==0){
		selectedOption = cellLineOptions[0]
	}
	if(organism == "mouse"){
		selectedOption = cellLineOptions[0]
	}

	// if(cellLineSelect.value==0){let selectedOption = cellLineOptions[0]};

	_.filter(proteinQuant, function(o){
		if(o.cell_line==selectedOption){
			proteinSet.push(o)
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
	}addCellLineSelectOptions();


	cellLineSelect.addEventListener('change', (event) => {
		defaultSelection = false;
		selectedOption = event.target.value;
		proteinSet=[];
		compounds = [];
		sitePositions = [];
		_.filter(proteinQuant, function(o){
			if(o.cell_line==selectedOption){
				proteinSet.push(o)
			}
		});

		siteObject = mapValue(proteinSet, ({ site }) => site);
		sitePositionsString = Object.values(siteObject).map(s => s.split("_")[s.split("_").length-1]);
		sitePositions = sitePositionsString.map((i) => Number(i));
		compounds = Object.keys(proteinSet[0]).filter(b=>b.includes('C')).filter(b=>!b.includes('Ce'));
		ConsumeSiteData("assets/data/grady_list.csv",accession);
		plotData();
	});

	if(defaultSelection=true){
		siteObject = mapValue(proteinSet, ({ site }) => site);
		sitePositionsString = Object.values(siteObject).map(s => s.split("_")[s.split("_").length-1]);
		sitePositions = sitePositionsString.map((i) => Number(i));
		compounds = Object.keys(proteinSet[0]).filter(b=>b.includes('C')).filter(b=>!b.includes('Ce'));
		proteinR_Values = RandomMultiDimArray(sequence.length,compounds.length,0);
		proteinError = UpdateProteinSitesFromArray(sitePositions,proteinSet,false,"se_");
		ConsumeSiteData("assets/data/grady_list.csv",accession);
		plotData();
	}
}



function parseHumanChemoprotData(){
	siteObject = mapValue(proteinQuant, ({ site }) => site);
	sitePositionsString = Object.values(siteObject).map(s => s.split("_")[s.split("_").length-1]);
	sitePositions = sitePositionsString.map((i) => Number(i));
	compounds = Object.keys(proteinQuant[0]).filter(b=>b.includes('C')).filter(b=>!b.includes('Ce'));
	cellLines = Object.values(mapValue(proteinQuant, ({ cell_line }) => cell_line));
	proteinR_Values = RandomMultiDimArray(sequence.length,compounds.length,0);
	let cellLineOptions = _.union(cellLines);
	selectedOption = cellLineOptions[0]
	function addCellLineSelectOptions() {
		$(cellLineSelect).empty();
		for (var i = 0; i < cellLineOptions.length; i++) {
			var option = cellLineOptions[i];
			var el = document.createElement("option");
			el.textContent = option;
			el.value = option;
			cellLineSelect.appendChild(el);
		}
	}addCellLineSelectOptions();
	_.filter(proteinQuant, function(o){
		if(o.cell_line==selectedOption){
			proteinSet.push(o)
		}
	});
	proteinError = UpdateProteinSitesFromArray(sitePositions,proteinQuant,false,"se_");
	ConsumeSiteData("data/humanCellData.csv",accession);
	plotData();
}

function parseHumanFastaData(){
	proteinQuantHuman = allHumanFastaData.filter(b=>b.Entry.includes(accession));
	geneName = proteinQuantHuman[0]["Gene names"];
	proteinName = proteinQuantHuman[0]["Protein names"];
	sequence = proteinQuantHuman[0].Sequence;
	sequenceArray = sequence.split('').map((x,index)=>x + (index + 1));
	parseHumanChemoprotData();
}

function UpdateProteinSitesFromArray(sitesArray, quantArray, update = true, keyFinder = "C", addNewFeatures = true){
	let quantOutput = quantArray.map(b=> Object.keys(b).filter((c,i) => c.includes("C")).filter((c,i) => !c.includes('Ce')).map(function(d) {
		if(isNaN(+b[d])) { return 0; } else { return +b[d]; }
	}));
	if(organism =="human"){
		pqSites = quantArray.map(s => parseInt(s.site.split("_")[s.site.split("_").length - 1]));
	}else{
		pqSites = quantArray.map(s => parseInt(s.site.split("_")[s.site.split("_").length - 1]));
	}
	if(update){
		proteinR_Values = proteinR_Values.map(function(b,i) {
			if(pqSites.includes(i + 1)) {
				return quantOutput[pqSites.indexOf(i+1)];
			} else { return b; } } );
	} else {
		return proteinR_Values.map(function(b,i) {
			if(pqSites.includes(i + 1)) {
				return quantOutput[pqSites.indexOf(i+1)];
			} } ).filter(el=> typeof(el) !== "undefined");
	}
	return quantArray;
}

function ConsumeSiteData(newDataSource, uniprotAccessionQuery, compoundstring = "oxi_percent_"){
	return d3.csv(newDataSource, function(value) {
		UpdateProteinSitesFromArray(sitePositions,proteinSet,quantArray);
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

function BuildMaps(){
	$(chartTwo).empty();
	NewHeatmap(compounds,sitePositions,cellLines,sequenceArray,proteinR_Values,proteinQuant);
	// PlotlyBar(compounds, proteinSites[0], -1,proteinError);
	NewTable("siteTable","siteTableWrapper",Object.keys(proteinQuant[0]), proteinQuant);
	$(document).ready( function () {
		$('#siteTable').DataTable({
			dom: 'Bfrtip',
			buttons: [
				'copy', 'csv', 'excel', 'pdf',
			]
		});
	} );
	onlyModInHeatmap = false;
}

function plotData(targetDiv = '#sequenceMap',sequenceOnly = true){
	SendGaEvent(accession, 'Site Query Initiated');
	orderedByTissue = false;
	$("#tissueOrderToggle").html("Order Compounds By R-Value");
	$("#cellLineOrderToggle").html("Order Cell Lines By R-Value");
	$("#proteinInformation").html(jsonToTable({"Protein Info": "","Accession": accessionNumber,"Gene": geneName,"Protein": proteinName,"Fnxn": commentFunction,}));
	AddExternalLinkListeners(accessionNumber,geneName);
	if(sequenceOnly){
		$(targetDiv).empty();
		let newFeaturesArray = [ GenerateFeature(SitesToPositions(uniprotFeatures),additionalSiteMapName) , GenerateFeature(SitesToPositions(disulfideFeatures),"Disulfide")]
		NewSequenceMap(targetDiv,sequence,newFeaturesArray);
	}
}



let onlyModInHeatmap = false;






let featureViewer;

function NewSequenceMap(sequenceMapTarget, sequence, newFeaturesArray){
	let options = {showAxis: true, showSequence: true,brushActive: true, toolbar:true,bubbleHelp: false, zoomMax:3 };
	featureViewer = new FeatureViewer(sequence, sequenceMapTarget,options);
	if(typeof newFeaturesArray !== "undefined"){
		for(i = 0; i < newFeaturesArray.length; i++){
			featureViewer.addFeature(newFeaturesArray[i]);
		}
	}
}


function GenerateFeature(positions = [{x:1,y:1},{x:10,y:10},{x:20,y:20}], name = "Oxidation", color = "#a40b0b",type = "rect"){
	let tempFeature = {
	    data: positions,
	    name: name,
	    className: name,
	    color: color,
	    type: type,
	    filter: name,
	    description: name,
	};
	return tempFeature;
}


function SitesToPositions(siteArray){
	return siteArray.map(function(b) { return {x: b, y: b}; });
}




