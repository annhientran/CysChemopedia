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
function NewHeatmap(cysCellData, cellLines, proteinR_Values, compounds) {
  // debugger;
  const options = {
    series: cysCellData, // y-axis data
    chart: {
      height: 900,
      width: 600,
      type: "heatmap",
      zoom: {
        enabled: true,
        type: "xy"
      },
      animations: {
        enabled: true
      },
      // background: "#C9C4BD",
      events: {
        click: function (event) {
          // debugger;
          document.getElementById("barPlotDiv").style.display = "block";

          let el = event.target;
          const i = el.getAttribute("i");
          const j = el.getAttribute("j");
          const selectedCysteine = cysCellData[i].name;
          const selectedCellLine = cellLines[j];
          const selectedProtein = _.find(
            proteinR_Values,
            p => p.name === selectedCysteine && p.cellLine === selectedCellLine
          );

          var siteR_Values = selectedProtein.values; //AllCysteineR_Values[index];
          // PlotlyBar(siteR_Values, compounds);
          var sortR_valuesButton = document.getElementById("toggleR-values");
          let sortObj = [];
          let toggleValue = true;
          if (sortR_valuesButton.innerText == "Order by Compound") {
            sortR_valuesButton.innerText = "Order by R-Value";
          }
          sortR_valuesButton.addEventListener("click", event => {
            if (toggleValue === true) {
              sortR_valuesButton.innerText = "Order by Compound";
              sortObj = siteR_Values.map(e => ({ R_Value: e }));
              for (i in sortObj) {
                sortObj[i].compounds = compounds[i];
                sortObj[i].cellLines = cellLines[i];
              }
              sortObj = sortObj.sort((a, b) =>
                a.R_Value < b.R_Value ? 1 : -1
              );
              let sortedCompounds = [];
              let sortedR_Values = [];
              for (i in sortObj) {
                sortedCompounds.push(sortObj[i].compounds);
                sortedR_Values.push(sortObj[i].R_Value);
              }
              plotBar(sortedR_Values, sortedCompounds);
              toggleValue = false;
            } else {
              sortR_valuesButton.innerText = "Order by R-Value";
              plotBar(siteR_Values, compounds);
              toggleValue = true;
            }
          });
          plotBar(selectedProtein, siteR_Values, compounds);
          // debugger;
        },
        mounted: function (chartContext, config) {
          // debugger;
          var loaderDiv = document.getElementById("loader");
          // var heatMapButtonGroup = document.getElementById(
          //   "heatMapButtonGroup"
          // );
          document.getElementById("proteinInfoDiv").style.display = "block";
          document.getElementById("accessionInfo").innerText =
            "Accession:" + ` ${accession}`;
          document.getElementById("geneInfo").innerText =
            "Gene:" + ` ${geneName}`;
          document.getElementById("proteinInfo").innerText =
            "Protein:" + ` ${proteinName}`;
          document.getElementById("proteinFunctionInfo").innerText = "N/A"; //` ${commentFunction}`;
          document.getElementById("dataTable").style.display = "block";
          document.getElementById("footerDiv").style.display = "block";
          // heatMapButtonGroup.style.display = "block";
          if (loaderDiv)
            loaderDiv.style.display =
              loaderDiv.style.display === "none" ? "block" : "none";
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
        maxHeight: 120
      },
      tickPlacement: "on"
    },
    plotOptions: {
      heatmap: {
        // shadeIntensity: false,
        // radius: 0,
        useFillColorAsStroke: true,
        colorScale: {
          ranges: [
            {
              from: -30,
              to: 0.5,
              name: "Unmapped Cysteine",
              color: "#D9D9D9" //"#d3d3d3"
            },
            {
              from: 0.5,
              to: 1.5,
              name: "Mapped Cysteine",
              color: "#909FF1" //"#203ee3"
            },
            {
              from: 1.5,
              to: 2.5,
              name: "Engaged Cysteine",
              color: "#FF7B7B" //"#FF0000"
            }
          ]
        }
      }
    },
    tooltip: {
      x: { show: true },
      y: {
        formatter: function (
          value,
          { series, seriesIndex, dataPointIndex, w }
        ) {
          if (value === 2) return "Engaged";
          else if (value === 1) return "Mapped";
          else if (value === 0) return "Unmaped";
          else return null;
        }
      }
    },
    // tooltip: {
    //   custom: function ({ series, seriesIndex, dataPointIndex, w }) {
    //     if (series[seriesIndex][dataPointIndex])
    //       return (
    //         '<div class="apexcharts-tooltip-series-group apexcharts-active" style="order: 1; display: flex;">' +
    //         // {/* <span class="apexcharts-tooltip-marker" style="background-color: rgb(144, 159, 241); display: none;"></span> */}
    //         '<div class="apexcharts-tooltip-text" style="font-family: Helvetica, Arial, sans-serif; font-size: 12px;">' +
    //         '<div class="apexcharts-tooltip-y-group">' +
    //         '<span class="apexcharts-tooltip-text-value">' +
    //         w.globals.initialSeries[seriesIndex].name +
    //         ": </span>" +
    //         '<span class="apexcharts-tooltip-text-value">' +
    //         w.globals.labels[dataPointIndex] +
    //         "</span>" +
    //         "</div>" +
    //         "</div>" +
    //         "</div>"
    //       );
    //     return null;
    //   }
    // },
    dataLabels: {
      enabled: false
    },
    stroke: {
      width: 1
    },
    title: {
      text: "Cys-Oxidation Stoichiometry: " + ` ${accession}`,
      align: "left",
      margin: 10,
      offsetX: 0,
      offsetY: 0,
      floating: false,
      style: {
        fontSize: "16px",
        color: "#263238"
      }
    }
  };

  var chartTwo = new ApexCharts(document.querySelector("#chartTwo"), options);
  chartTwo.render();

  function plotBar(selectedProtein, siteR_Values, compounds) {
    let R_values = [];
    R_values = siteR_Values.map(e => ({ value: e }));
    function sortR_Values() {
      R_values = R_values.sort((a, b) => (a.value < b.value ? 1 : -1));
    }

    const dataSource = {
      chart: {
        caption: "Site Stoichiometry",
        subcaption: "Site: " + `${selectedProtein.name}`,
        yaxisname: "R-Values",
        xaxisName: "Compounds",
        numvisibleplot: "14",
        labeldisplay: "auto",
        theme: "fusion"
      },
      categories: [
        {
          category: compounds
        }
      ],
      dataset: [
        {
          data: R_values
        }
      ],
      trendlines: [
        {
          line: [
            {
              startvalue: "2",
              valueOnRight: "1",
              displayvalue: "Hit Compound",
              color: "#ff0000",
              dashed: "1",
              dashLen: "4",
              dashGap: "2"
            }
          ]
        }
      ]
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

      // bar chart using ApexCharts js
      // debugger;
      // var barChartOptions = {
      //   series: [{ name: "R-values", data: siteR_Values }],
      //   chart: {
      //     type: "bar",
      //     height: 350
      //   },
      //   plotOptions: {
      //     bar: {
      //       horizontal: false,
      //       columnWidth: "55%",
      //       endingShape: "rounded"
      //     }
      //   },
      //   dataLabels: {
      //     enabled: false
      //   },
      //   stroke: {
      //     show: true,
      //     width: 2,
      //     colors: ["transparent"]
      //   },
      //   xaxis: {
      //     categories: compounds
      //   },
      //   yaxis: {
      //     title: {
      //       text: "$ (thousands)"
      //     }
      //   },
      //   fill: {
      //     opacity: 1
      //   },
      //   tooltip: {
      //     y: {
      //       formatter: function (val) {
      //         return "$ " + val + " thousands";
      //       }
      //     }
      //   }
      // };

      // var chart = new ApexCharts(
      //   document.querySelector("#chart-container"),
      //   barChartOptions
      // );
      // chart.render();

      // document
      //   .getElementById("bottomScroll")
      //   .addEventListener("click", function () {
      //     document
      //       .getElementById("topScroll")
      //       .classList.remove("btn-primary-grad");
      //     document
      //       .getElementById("bottomScroll")
      //       .classList.remove("btn-outline-primary");
      //     document
      //       .getElementById("topScroll")
      //       .classList.add("btn-outline-primary");
      //     document
      //       .getElementById("bottomScroll")
      //       .classList.add("btn-primary-grad");
      //     myChart.setChartAttribute("scrollPosition", "bottom");
      //   });
    });
  }
}

// function PlotlyBar(xvals, yvals) {
//   var options = {
//     series: [
//       {
//         name: "R-value",
//         data: xvals
//       }
//     ],
//     chart: {
//       height: 650,
//       width: 1500,
//       type: "bar"
//     },
//     plotOptions: {
//       bar: {
//         columnWidth: "40px"
//       }
//     },
//     dataLabels: {
//       enabled: false
//     },
//     stroke: {
//       width: 2
//     },

//     grid: {
//       row: {
//         colors: ["#fff", "#f2f2f2"]
//       }
//     },
//     xaxis: {
//       labels: {
//         rotate: -90,
//         rotateAlways: true,
//         minHeight: 300,
//         trim: false,
//         hideOverlappingLabels: true
//       },
//       categories: yvals,
//       tickPlacement: "on"
//     },
//     yaxis: {
//       title: {
//         text: "R-Values"
//       }
//     },
//     fill: {
//       type: "gradient",
//       gradient: {
//         shade: "light",
//         type: "horizontal",
//         shadeIntensity: 0.25,
//         gradientToColors: undefined,
//         inverseColors: true,
//         opacityFrom: 0.85,
//         opacityTo: 0.85,
//         stops: [50, 0, 100]
//       }
//     }
//   };
// }

/**
 * Plot new heatmap
 * @param plotId
 * @param x
 * @param y
 * @param z
 * @param color
 * @returns
 */

// function CysOxiChart(
//   // compounds,
//   // sitePositions,
//   // cellLines,
//   // sequenceArray,
//   // proteinR_Values,
//   // quantArray,
//   cysCell
// ) {
//   // cysteinePositions = [];
//   // AllCysteineR_Values = [];
//   // for (i in sitePositions) {
//   //   cysteinePositions.push(sequenceArray[sitePositions[i] - 1]);
//   //   AllCysteineR_Values.push(proteinR_Values[[sitePositions[i] - 1]]);
//   // }
//   // let values = AllCysteineR_Values;
//   // let my_obj = cysteinePositions.map(e => ({ name: e }));
//   // for (i in my_obj) {
//   //   my_obj[i].data = values[i];
//   // }
//   debugger;
//   // var options = {
//   //   series: cysCell, // y-axis data
//   //   chart: {
//   //     height: 900,
//   //     width: 600,
//   //     type: "scatter",
//   //     zoom: {
//   //       enabled: true,
//   //       type: "xy"
//   //     },
//   //     animations: {
//   //       enabled: false
//   //     },
//   //     colors: ["#d3d3d3", "#203ee3", "#FF0000"],
//   //     events: {
//   //       click: function (event) {
//   //         debugger;
//   //         // document.getElementById("barPlotDiv").style.display = "block";
//   //         // var el = event.target;
//   //         // var index = el.getAttribute("i");
//   //         // var siteR_Values = AllCysteineR_Values[index];
//   //         // PlotlyBar(siteR_Values, compounds);
//   //         // var sortR_valuesButton = document.getElementById("toggleR-values");
//   //         // let sortObj = [];
//   //         // let toggleValue = true;
//   //         // if (sortR_valuesButton.innerText == "Order by Compound") {
//   //         //   sortR_valuesButton.innerText = "Order by R-Value";
//   //         // }
//   //         // sortR_valuesButton.addEventListener("click", event => {
//   //         //   if (toggleValue === true) {
//   //         //     sortR_valuesButton.innerText = "Order by Compound";
//   //         //     sortObj = siteR_Values.map(e => ({ R_Value: e }));
//   //         //     for (i in sortObj) {
//   //         //       sortObj[i].compounds = compounds[i];
//   //         //       sortObj[i].cellLines = cellLines[i];
//   //         //     }
//   //         //     sortObj = sortObj.sort((a, b) =>
//   //         //       a.R_Value < b.R_Value ? 1 : -1
//   //         //     );
//   //         //     let sortedCompounds = [];
//   //         //     let sortedR_Values = [];
//   //         //     for (i in sortObj) {
//   //         //       sortedCompounds.push(sortObj[i].compounds);
//   //         //       sortedR_Values.push(sortObj[i].R_Value);
//   //         //     }
//   //         //     plotBar(sortedR_Values, sortedCompounds);
//   //         //     toggleValue = false;
//   //         //   } else {
//   //         //     sortR_valuesButton.innerText = "Order by R-Value";
//   //         //     plotBar(siteR_Values, compounds);
//   //         //     toggleValue = true;
//   //         //   }
//   //         // });
//   //         // plotBar(siteR_Values, compounds);
//   //         // },
//   //         // mounted: function (chartContext, config) {
//   //         //   var loaderDiv = document.getElementById("loader");
//   //         //   var heatMapButtonGroup = document.getElementById(
//   //         //     "heatMapButtonGroup"
//   //         //   );
//   //         //   document.getElementById("proteinInfoDiv").style.display = "block";
//   //         //   document.getElementById("accessionInfo").innerText =
//   //         //     "Accession:" + ` ${accession}`;
//   //         //   document.getElementById("geneInfo").innerText =
//   //         //     "Gene:" + ` ${geneName}`;
//   //         //   document.getElementById("proteinInfo").innerText =
//   //         //     "Protein:" + ` ${proteinName}`;
//   //         //   document.getElementById(
//   //         //     "proteinFunctionInfo"
//   //         //   ).innerText = ` ${commentFunction}`;
//   //         //   document.getElementById("dataTable").style.display = "block";
//   //         //   document.getElementById("footerDiv").style.display = "block";
//   //         //   heatMapButtonGroup.style.display = "block";
//   //         //   if (loaderDiv)
//   //         //     loaderDiv.style.display =
//   //         //       loaderDiv.style.display === "none" ? "block" : "none";
//   //       }
//   //     }
//   //   },
//   //   yaxis: {
//   //     labels: {
//   //       formatter: function (value) {
//   //         return "C" + value;
//   //       }
//   //     },
//   //     tickAmount: 20
//   //   },
//   //   xaxis: {
//   //     type: "category",
//   //     // labels: {
//   //     //   show: true,
//   //     //   rotate: 0,
//   //     //   rotateAlways: false,
//   //     //   hideOverlappingLabels: true,
//   //     //   showDuplicates: false,
//   //     //   trim: false,
//   //     //   minHeight: undefined,
//   //     //   maxHeight: 120
//   //     // },
//   //     // categories: compounds, // x-axis data
//   //     tickPlacement: "between",
//   //     axisTicks: {
//   //       show: true
//   //     }
//   //   },
//   //   legend: {
//   //     showForNullSeries: true
//   //   },
//   //   // plotOptions: {
//   //   //   heatmap: {
//   //   //     shadeIntensity: false,
//   //   //     radius: 0,
//   //   //     useFillColorAsStroke: true,
//   //   //     colorScale: {
//   //   //       ranges: [
//   //   //         {
//   //   //           from: 0,
//   //   //           to: 0.0001,
//   //   //           name: "Unmapped Cysteine",
//   //   //           color: "#d3d3d3"
//   //   //         },
//   //   //         {
//   //   //           from: 0.0001,
//   //   //           to: 2,
//   //   //           name: "Mapped Cysteine",
//   //   //           color: "#203ee3"
//   //   //         },
//   //   //         {
//   //   //           from: 2,
//   //   //           to: 80,
//   //   //           name: "Engaged Cysteine",
//   //   //           color: "#FF0000"
//   //   //         }
//   //   //       ]
//   //   //     }
//   //   //   }
//   //   // },
//   //   // dataLabels: {
//   //   //   enabled: false
//   //   // },
//   //   // stroke: {
//   //   //   width: 1
//   //   // },
//   //   title: {
//   //     text: "Cys-Oxidation Stoichiometry: " + ` ${accession}`,
//   //     align: "left",
//   //     margin: 10,
//   //     offsetX: 0,
//   //     offsetY: 0,
//   //     floating: false,
//   //     style: {
//   //       fontSize: "16px",
//   //       color: "#263238"
//   //     }
//   //   }
//   // };

//   var chartTwo = new ApexCharts(document.querySelector("#chartTwo"), options);
//   chartTwo.render();

//   function plotBar(siteR_Values, compounds) {
//     let selectedCompounds = [];
//     selectedCompounds = compounds.map(e => ({ label: e }));
//     let R_values = [];
//     R_values = siteR_Values.map(e => ({ value: e }));
//     function sortR_Values() {
//       R_values = R_values.sort((a, b) => (a.value < b.value ? 1 : -1));
//     }
//     let selectedSite = _.find(my_obj, ["data", siteR_Values]).name;
//     const dataSource = {
//       chart: {
//         caption: "Site Stoichiometry",
//         subcaption: "Site: " + `${selectedSite}`,
//         yaxisname: "R-Values",
//         xaxisName: "Compounds",
//         numvisibleplot: "16",
//         labeldisplay: "auto",
//         theme: "fusion"
//       },
//       categories: [
//         {
//           category: selectedCompounds
//         }
//       ],
//       dataset: [
//         {
//           data: R_values
//         }
//       ],
//       trendlines: [
//         {
//           line: [
//             {
//               startvalue: "2",
//               valueOnRight: "1",
//               displayvalue: "Hit Compound",
//               color: "#ff0000",
//               dashed: "1",
//               dashLen: "4",
//               dashGap: "2"
//             }
//           ]
//         }
//       ]
//     };

//     FusionCharts.ready(function () {
//       var myChart = new FusionCharts({
//         type: "scrollcolumn2d",
//         renderAt: "chart-container",
//         width: "100%",
//         height: "600",
//         dataFormat: "json",
//         dataSource
//       }).render();

//       document
//         .getElementById("bottomScroll")
//         .addEventListener("click", function () {
//           document
//             .getElementById("topScroll")
//             .classList.remove("btn-primary-grad");
//           document
//             .getElementById("bottomScroll")
//             .classList.remove("btn-outline-primary");
//           document
//             .getElementById("topScroll")
//             .classList.add("btn-outline-primary");
//           document
//             .getElementById("bottomScroll")
//             .classList.add("btn-primary-grad");
//           myChart.setChartAttribute("scrollPosition", "bottom");
//         });
//     });
//   }
// }

var fakeOptions = {
  series: [
    {
      name: "fruit",
      data: [
        {
          x: "Mouse",
          y: null
        },
        {
          x: "Dog",
          y: 10
        }
      ]
    },
    {
      name: "pet",
      data: [
        {
          x: "Mouse",
          y: 20
        },
        {
          x: "Dog",
          y: 30
        }
      ]
    }
  ],
  chart: {
    height: 900,
    width: 600,
    type: "heatmap"
  },
  // yaxis: {
  //   axisTicks: {
  //     width:1
  //   }
  // },
  dataLabels: {
    enabled: false
  },
  xaxis: {
    // type: "category",
    // categories: ["Mouse", "Dog"]
    // tickPlacement: 'between',
    //   axisTicks: {
    //     show: true,
    //   }
    // },
    // legend: {
    //   showForNullSeries: true
  },
  tooltip: {
    x: { show: true },
    y: {
      formatter: function (value, { series, seriesIndex, dataPointIndex, w }) {
        return value > 1 ? "mapped" : "engaged";
      }
    }
  }
};
