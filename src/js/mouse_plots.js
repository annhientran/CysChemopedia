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
function generateMaps(
  protein,
  cysCellData,
  cellLines,
  proteinR_Values,
  compounds
) {
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
          // set up order button
          let barChartSortBtn = document.getElementById("barChartSortBtn");

          if (sortIsDisabled()) {
            toggleSort();

            let labeledRvals = siteR_Values.map((e, i) => ({
              R_Value: e,
              label: compounds[i]
            }));
            const sorted = _.sortBy(labeledRvals, e => e.R_Value);
            const sortedClabel = _.map(sorted, "label");
            const sortedR_Values = _.map(sorted, "R_Value");

            barChartSortBtn.addEventListener("click", event => {
              const barChartOrder = document.querySelector(
                "input[name='toggleBarChartSort']:checked"
              ).value;
              if (barChartOrder === "R-Value") {
                plotBar(selectedProtein.name, sortedR_Values, sortedClabel);
              } else {
                plotBar(selectedProtein.name, siteR_Values, compounds);
              }
            });
          } else toggleSort();

          plotBar(selectedProtein.name, siteR_Values, compounds);
        },
        mounted: function (chartContext, config) {
          // debugger;
          // show info details table
          var loaderDiv = document.getElementById("loader");

          document.getElementById("proteinInfoDiv").style.display = "block";
          document.getElementById("accessionInfo").innerText =
            "Accession:" + ` ${protein["Entry"]}`;
          document.getElementById("geneInfo").innerText =
            "Gene:" + ` ${protein["Gene names (primary)"]}`;
          document.getElementById("proteinInfo").innerText =
            "Protein:" + ` ${protein["Protein names"]}`;
          document.getElementById("footerDiv").style.display = "block";

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
      text: `Cys-Oxidation Stoichiometry: ${protein["Entry"]} - Gene: ${protein["Gene names (primary)"]}`,
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
  // let R_values = [];
  // R_values = siteR_Values.map(e => ({ value: e }));
  // function sortR_Values() {
  //   R_values = R_values.sort((a, b) => (a.value < b.value ? 1 : -1));
  // }

  // bar chart using ApexCharts js
  const barChartOptions = {
    series: [{ name: "R-values", data: siteR_Values }],
    chart: {
      type: "bar",
      height: 350,
      // redrawOnWindowResize: true,
      // redrawOnParentResize: true,
      events: {
        mounted: function (chartContext, config) {
          setBarChartLabelImage();
        },
        updated: function (chartContext, config) {
          setBarChartLabelImage();
        }
      }
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
      },
      labels: {
        style: {
          cssClass: "barchart-xlabel" //'apexcharts-xaxis-label'
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

function plotHockeyStick(type, rvalsByGene) {
  const hockeyStickOptions = {
    series: [rvalsByGene],
    chart: {
      height: 350,
      type: "scatter",
      zoom: {
        enabled: true,
        type: "xy"
      },
      animations: {
        enabled: false
      }
      //       events: {
      //         // mounted: function (chartContext, config) {},
      //         legendClick: function (chartContext, seriesIndex, config) {
      //           if (!allCellData[type]) return null;
      // debugger;
      //           let allSeries = config.config.series;

      //           if (_.isEmpty(allSeries[seriesIndex].data)) {
      //             const label = allSeries[seriesIndex].name;
      //             const data = _.sortBy(allCellData[type], [
      //               function (site) {
      //                 return site[label];
      //               }
      //             ]);
      //             const seriesData = data.map((curr, i) => {
      //               return [i, curr[label]];
      //             });

      //             allSeries[seriesIndex].data = seriesData;
      //             chartContext.updateSeries(allSeries);
      //           }
      //           debugger;
      //           // allSeries.forEach((s, i) => {
      //           //   if (i === seriesIndex) chartContext.showSeries(s.name);
      //           //   else chartContext.hideSeries(s.name);
      //           // });
      //           // debugger;
      //         }
      //       }
    },
    dataLabels: {
      enabled: false
    },
    legend: {
      show: false
    },
    fill: {
      colors: [
        function ({ value, seriesIndex, w }) {
          if (value >= 2) {
            return "#FF7B7B";
          } else {
            return "#909FF1";
          }
        }
      ]
    },
    markers: {
      strokeColors: [
        function ({ value, seriesIndex, w }) {
          if (value >= 2) {
            return "#e60000";
          } else {
            return "#4961e9";
          }
        }
      ] //'#7789ee',
    },
    xaxis: {
      tickAmount: 5,
      min: 0,
      max: 25000,
      forceNiceScale: true
    },
    yaxis: {
      tickAmount: 7,
      min: 0,
      max: 8,
      forceNiceScale: true,
      labels: {
        formatter: function (val) {
          return parseFloat(val).toFixed(1);
        }
      }
    }
  };
  // debugger;
  var hockeyStickChart = new ApexCharts(
    document.querySelector("#hockeyStickTable"),
    hockeyStickOptions
  );

  hockeyStickChart.render();
  // debugger;
  // hockeyStickChart.w.config.series.forEach((s, i) => {
  //   hockeyStickChart.hideSeries(s.name);
  // });
}

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

function toggleSort() {
  if (sortIsDisabled()) {
    $("#barChartSortBtn").removeClass("disabledSort");
    $("#barChartSortBtn")
      .find("input")
      .each(function () {
        $(this).prop("disabled", false);
      });
  } else {
    $("#barChartSortBtn").addClass("disabledSort");
    $("#barChartSortBtn")
      .find("input")
      .each(function () {
        $(this).attr("disabled", true);
      });
  }
}

function sortIsDisabled() {
  return $("#barChartSortBtn").hasClass("disabledSort");
}
