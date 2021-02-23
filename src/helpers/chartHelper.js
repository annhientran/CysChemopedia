import _ from "lodash";

export const barChartSortOptions = [
  { label: "R-value", value: 1 },
  { label: "Compound", value: 2 }
];

export const getHeatmapOptions = (
  proteinOnFasta,
  cysCellData,
  cellLines,
  proteinR_Values,
  compounds,
  onCysClick
) => {
  const chartTitle = proteinOnFasta
    ? `Cys-Oxidation Stoichiometry: ${proteinOnFasta["Entry"]} - Gene: ${proteinOnFasta["Gene names (primary)"]}`
    : "";
  return {
    chart: {
      // type: "heatmap",
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
          if (!cysCellData || !cellLines) return;

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

          onCysClick(selectedProtein.name, selectedProtein.values, compounds);
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
      text: chartTitle,
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
    // yaxis: {
    //   formatter: value => {
    //     return value;
    //   }
    // }
  };
};

export const getBarChartOptions = (site, compounds, setXAxisLabelImages) => {
  return {
    chart: {
      type: "bar",
      height: 350,
      // redrawOnWindowResize: true,
      // redrawOnParentResize: true,
      events: {
        mounted: function (chartContext, config) {
          setXAxisLabelImages();
        },
        updated: function (chartContext, config) {
          setXAxisLabelImages();
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
};
