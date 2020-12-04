//Oximouse js fnxns
/**
 * The Oximouse website is licensed under the CC BY 4.0 license: https://creativecommons.org/licenses/by/4.0/
 * @author Devin Schweppe <devin_schweppe@hms.harvard.edu>
 */

/**
 * Plot new heatmap
 * @param plotId
 * @param x
 * @param y
 * @param z
 * @param color
 * @returns
 */
function NewHeatmap(compounds,sitePositions,cellLines,sequenceArray,proteinR_Values, quantArray){
	cysteinePositions = [];
	AllCysteineR_Values = [];
	for(i in sitePositions){
		cysteinePositions.push(sequenceArray[sitePositions[i]-1]);
		AllCysteineR_Values.push(proteinR_Values[[sitePositions[i]-1]]);
	}
	let values =AllCysteineR_Values;
	let my_obj = cysteinePositions.map(e => ({ name: e }))
	for (i in my_obj){
		my_obj[i].data=values[i]
	}

	var options = {
		series: my_obj,
		chart: {
			height: 900,
			width:600,
			type: 'heatmap',
			events:{
				click: function (event) {
					document.getElementById('barPlotDiv').style.display="block";
					var el = event.target;
					var index = (el.getAttribute("i"));
					var siteR_Values=AllCysteineR_Values[index];
					PlotlyBar(siteR_Values, compounds);
					var sortR_valuesButton = document.getElementById('toggleR-values');
					let sortObj=[];
					let toggleValue = true;
					if(sortR_valuesButton.innerText=="Order by Compound"){
						sortR_valuesButton.innerText = "Order by R-Value"
					}
					sortR_valuesButton.addEventListener('click', event => {
						if(toggleValue===true){
							sortR_valuesButton.innerText="Order by Compound";
							sortObj= siteR_Values.map(e=>({R_Value:e}));
							for (i in sortObj){
								sortObj[i].compounds=compounds[i];
								sortObj[i].cellLines=cellLines[i]
							}
							sortObj = sortObj.sort((a, b) => (a.R_Value < b.R_Value) ? 1 : -1)
							let sortedCompounds=[];
							let sortedR_Values=[];
							for(i in sortObj){
								sortedCompounds.push(sortObj[i].compounds);
								sortedR_Values.push(sortObj[i].R_Value);
							}
							plotBar(sortedR_Values,sortedCompounds);
							toggleValue=false;
						}else{
							sortR_valuesButton.innerText="Order by R-Value";
							plotBar(siteR_Values,compounds);
							toggleValue=true;
						}
					});
					plotBar(siteR_Values, compounds);

				},
				mounted: function(chartContext, config) {
					var loaderDiv =document.getElementById('loader');
					var heatMapButtonGroup = document.getElementById('heatMapButtonGroup');
					document.getElementById('proteinInfoDiv').style.display="block";
					document.getElementById('accessionInfo').innerText="Accession:"+` ${accession}`;
					document.getElementById('geneInfo').innerText="Gene:"+` ${geneName}`;
					document.getElementById('proteinInfo').innerText="Protein:"+` ${proteinName}`;
					document.getElementById('proteinFunctionInfo').innerText=` ${commentFunction}`;
					document.getElementById('dataTable').style.display="block";
					document.getElementById('footerDiv').style.display="block";
					heatMapButtonGroup.style.display="block";
					if (loaderDiv.style.display === "none") {
						loaderDiv.style.display = "block";
					} else {
						loaderDiv.style.display = "none";
					}
				}
			}
		},
		xaxis: {
			labels: {
				show: true,
				rotate: 0,
				rotateAlways: false,
				hideOverlappingLabels: true,
				showDuplicates: false,
				trim: false,
				minHeight: undefined,
				maxHeight: 120,
			},
			categories:compounds,
			tickPlacement: 'on'
		},
		plotOptions: {
			heatmap: {
				shadeIntensity: 0.5,
				radius: 0,
				useFillColorAsStroke: true,
				colorScale: {
					ranges: [{
						from: 0,
						to: 0.0001,
						name: 'Unmapped Cysteine',
						color: '#203ee3'
					},
						{
							from: 0.0001,
							to: 2,
							name: 'Mapped Cysteine',
							color: '#d3d3d3'
						},
						{
							from: 2,
							to: 80,
							name: 'Engaged Cysteine',
							color: '#FF0000'
						}
					]
				}
			}
		},
		dataLabels: {
			enabled: false
		},
		stroke: {
			width: 1
		},
		title: {
			text: 'Cys-Oxidation Stoichiometry: ' + ` ${accession}`,
			align: 'left',
			margin: 10,
			offsetX: 0,
			offsetY: 0,
			floating: false,
			style: {
				fontSize:  '16px',
				color:  '#263238'
			},
		}
	};

	var chartTwo = new ApexCharts(document.querySelector("#chartTwo"), options);
	chartTwo.render();


	function plotBar(siteR_Values, compounds) {
		let selectedCompounds = [];
		selectedCompounds = compounds.map(e => ({label: e}));
		let R_values = [];
		R_values = siteR_Values.map(e => ({value: e}));
		function sortR_Values(){
			R_values = R_values.sort((a, b) => (a.value < b.value) ? 1 : -1);
		}
		let selectedSite = _.find(my_obj, ['data', siteR_Values]).name;
		const dataSource = {
			chart: {
				caption: "Site Stoichiometry",
				subcaption: "Site: " + `${selectedSite}`,
				yaxisname: "R-Values",
				xaxisName: "Compounds",
				numvisibleplot: "16",
				labeldisplay: "auto",
				theme: "fusion"
			},
			categories: [
				{
					category: selectedCompounds
				}
			],
			dataset: [
				{
					data: R_values
				},
			],
			"trendlines": [{
				"line": [{
					"startvalue": "2",
					"valueOnRight": "1",
					"displayvalue": "Hit Compound",
					"color": "#ff0000",
					"dashed": "1",
					"dashLen": "4",
					"dashGap": "2"
				}]
			}]
		};

		FusionCharts.ready(function () {
			var myChart = new FusionCharts({
				type: "scrollcolumn2d",
				renderAt: "chart-container",
				width: "100%",
				height: "600",
				dataFormat: "json",
				dataSource
			}).render();


			document.getElementById("bottomScroll").addEventListener("click", function () {
				document.getElementById("topScroll").classList.remove("btn-primary-grad");
				document
					.getElementById("bottomScroll")
					.classList.remove("btn-outline-primary");
				document.getElementById("topScroll").classList.add("btn-outline-primary");
				document.getElementById("bottomScroll").classList.add("btn-primary-grad");
				myChart.setChartAttribute("scrollPosition", "bottom");
			});
		});
	}

}


function PlotlyBar(xvals,yvals){

	var options = {
		series: [{
			name: 'R-value',
			data: xvals
		}],
		chart: {
			height: 650,
			width: 1500,
			type: 'bar',
		},
		plotOptions: {
			bar: {
				columnWidth: '40px',
			}
		},
		dataLabels: {
			enabled: false
		},
		stroke: {
			width: 2
		},

		grid: {
			row: {
				colors: ['#fff', '#f2f2f2']
			}
		},
		xaxis: {
			labels: {
				rotate: -90,
				rotateAlways: true,
				minHeight: 300,
				trim: false,
				hideOverlappingLabels: true,
			},
			categories: yvals,
			tickPlacement: 'on',

		},
		yaxis: {
			title: {
				text: 'R-Values',
			},
		},
		fill: {
			type: 'gradient',
			gradient: {
				shade: 'light',
				type: "horizontal",
				shadeIntensity: 0.25,
				gradientToColors: undefined,
				inverseColors: true,
				opacityFrom: 0.85,
				opacityTo: 0.85,
				stops: [50, 0, 100]
			},
		}
	};
}




