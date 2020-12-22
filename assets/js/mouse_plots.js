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
          // document.getElementById("barPlotDiv").style.display = "block";

          let el = event.target;
          const i = el.getAttribute("i");
          const j = el.getAttribute("j");
          const selectedCysteine = cysCellData[i].name;
          const selectedCellLine = cellLines[j];
          let selectedProtein = _.find(
            proteinR_Values,
            p => p.name === selectedCysteine && p.cellLine === selectedCellLine
          );

          if (!selectedProtein)
            selectedProtein = {
              name: selectedCysteine,
              cellLine: selectedCellLine,
              values: []
            };

          let siteR_Values = selectedProtein.values;
          // PlotlyBar(siteR_Values, compounds);

          // set up order button
          let barChartSortBtn = document.getElementById("toggleR-values");
          barChartSortBtn.innerText = "Order by R-Value";
          if (!_.isEmpty(siteR_Values)) {
            barChartSortBtn.disabled = false;

            let toggleSort = true;
            let labeledRvals = siteR_Values.map((e, i) => ({
              R_Value: e,
              label: `C${i}`
            }));
            const sorted = _.sortBy(labeledRvals, e => e.R_Value);
            const sortedClabel = _.map(sorted, "label");
            const sortedR_Values = _.map(sorted, "R_Value");
            // debugger;
            barChartSortBtn.innerText = "Order by R-Value";
            barChartSortBtn.addEventListener("click", event => {
              if (toggleSort) {
                barChartSortBtn.innerText = "Order by Compound";
                plotBar(selectedProtein.name, sortedR_Values, sortedClabel);
                toggleSort = false;
              } else {
                barChartSortBtn.innerText = "Order by R-Value";
                plotBar(selectedProtein.name, siteR_Values, compounds);
                toggleSort = true;
              }
            });
          } else barChartSortBtn.disabled = true;

          plotBar(selectedProtein.name, siteR_Values, compounds);
        },
        mounted: function (chartContext, config) {
          // debugger;
          // show info details table
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
    },
    yaxis: {
      formatter: value => {
        return val;
      }
    }
  };

  var chartTwo = new ApexCharts(document.querySelector("#chartTwo"), options);
  chartTwo.render();
}

function plotBar(site, siteR_Values, compounds) {
  let R_values = [];
  R_values = siteR_Values.map(e => ({ value: e }));
  function sortR_Values() {
    R_values = R_values.sort((a, b) => (a.value < b.value ? 1 : -1));
  }

  // bar chart using ApexCharts js
  const barChartOptions = {
    series: [{ name: "R-values", data: siteR_Values }],
    chart: {
      type: "bar",
      height: 350
    },
    colors: ["#909FF1"],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%"
      }
    },
    dataLabels: {
      enabled: false
    },
    xaxis: {
      categories: compounds,
      title: {
        text: "Compounds",
        style: {
          // cssClass: "apexcharts-yaxis-label",
          fontSize: "15px",
          fontFamily: "Source Sans Pro",
          fontWeight: 900
        }
      }
    },
    yaxis: {
      title: {
        text: "R-values",
        // offsetX: 5,
        style: {
          // cssClass: "apexcharts-yaxis-label",
          fontSize: "15px",
          fontFamily: "Source Sans Pro",
          fontWeight: 900
        }
      },
      labels: {
        formatter: function (val) {
          return val.toFixed(2);
        }
      },
      tickAmount: 3,
      max: 3
    },
    noData: {
      text: "R values don't exist",
      align: "center",
      verticalAlign: "middle",
      offsetX: 0,
      offsetY: 0,
      style: {
        color: "black",
        fontSize: "20px",
        fontFamily: "Source Sans Pro"
        // borderColor: 'red',
        // cssClass: "blur"
      }
    },
    annotations: {
      yaxis: [
        {
          y: 2,
          strokeDashArray: 1,
          borderColor: "#ff0000",
          label: {
            borderColor: "#ff0000",
            style: {
              color: "#ff0000"
              // background: "#ff0000"
            },
            text: "Hit Compound"
          }
        }
      ]
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val;
        }
      }
    },
    title: {
      text: "Site Stoichiometry",
      align: "center",
      margin: 10,
      offsetX: 0,
      offsetY: 0,
      floating: false,
      style: {
        fontSize: "16px",
        color: "#263238"
      }
    },
    subtitle: {
      text: `Site: ${site}`,
      align: "center",
      style: {
        fontSize: "16px",
        color: "#263238"
      }
    }
  };
  let chartContainer = document.querySelector("#chart-container");
  var barChart = new ApexCharts(chartContainer, barChartOptions);

  $(chartContainer).empty();
  barChart.render();
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
