import _ from "lodash";
import { hockeyStick1stTabText } from "helpers/siteHelper";

const engagedValue = 1.5;
const isEngaged = 1;
const isMapped = 0;

export const isUnmapped = 2;

export const barChartDefaultWidth = 600;
export const barChartSortOptions = [
  { label: "Compound", value: 1 },
  { label: "R-value", value: 2 }
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
    ? `Cys-Oxidation Stoichiometry: ${proteinOnFasta["Entry"]} — Gene: ${proteinOnFasta["Gene names (primary)"]}`
    : "";
  return {
    chart: {
      zoom: {
        enabled: true,
        type: "xy"
      },
      animations: {
        enabled: false
      },
      events: {
        click: function (event) {
          if (!cysCellData || !cellLines) return;

          const el = event.target;
          const i = el.getAttribute("i");
          const j = el.getAttribute("j");

          if (!i || !j) return;

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
        useFillColorAsStroke: true,
        colorScale: {
          ranges: [
            {
              from: isUnmapped,
              to: isUnmapped,
              name: "Unmapped Cysteine",
              color: "#D9D9D9" //"#d3d3d3"
            },
            {
              from: isMapped,
              to: isMapped,
              name: "Mapped Cysteine",
              color: "#909FF1" //"#203ee3"
            },
            {
              from: isEngaged,
              to: isEngaged,
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
          if (value === isEngaged) return "Engaged";
          else if (value === isMapped) return "Mapped";
          else return "Unmaped";
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
      text: chartTitle,
      align: "left",
      margin: 10,
      offsetX: 0,
      offsetY: 0,
      floating: false,
      style: {
        fontSize: "20px",
        fontFamily: "Helvetica",
        fontWeight: "700",
        color: "#32325d"
      }
    }
  };
};

export const getBarChartOptions = (site, compounds, linkXAxisLabelToHK) => {
  return {
    chart: {
      type: "bar",
      events: {
        mounted: function (chartContext, config) {
          linkXAxisLabelToHK();
        },
        updated: function (chartContext, config) {
          linkXAxisLabelToHK();
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
      hideOverlappingLabels: true,
      title: {
        text: "Compounds",
        style: {
          fontSize: "16px",
          fontFamily: "Helvetica",
          fontWeight: 600
        }
      },
      labels: {
        style: {
          cssClass: "barchart-xlabel"
        }
      }
    },
    yaxis: {
      title: {
        text: "R-values",
        style: {
          fontSize: "16px",
          fontFamily: "Helvetica",
          fontWeight: 600
        }
      },
      labels: {
        formatter: function (val) {
          return val.toFixed(2);
        }
      },
      max: function (val) {
        return val <= 3 ? 3 : val;
      },
      forceNiceScale: true
    },
    noData: {
      text: "No R values",
      align: "center",
      verticalAlign: "middle",
      offsetX: 0,
      offsetY: 0,
      style: {
        color: "black",
        fontSize: "20px",
        fontFamily: "Helvetica"
      }
    },
    annotations: {
      yaxis: [
        {
          y: 1.5,
          strokeDashArray: 1,
          borderColor: "#ff0000",
          label: {
            borderColor: "#ff0000",
            style: {
              color: "#ff0000"
            },
            text: "Hit Compound",
            position: "left",
            offsetX: 70
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
    }
  };
};

export function getHockeyStickOptions(compoundName = "") {
  return {
    chart: {
      zoom: {
        enabled: true,
        type: "xy"
      },
      toolbar: {
        tools: {
          download: false
        }
      },
      animations: {
        enabled: false
      }
    },
    title: {
      text:
        compoundName && compoundName !== hockeyStick1stTabText
          ? `Hockey Stick Chart — ${compoundName}`
          : "Hockey Stick Chart",
      align: "left",
      margin: 10,
      offsetX: 0,
      offsetY: 0,
      floating: false,
      style: {
        fontSize: "20px",
        fontFamily: "Helvetica",
        fontWeight: "700",
        color: "#32325d"
      }
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
          if (value >= engagedValue) {
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
          if (value >= engagedValue) {
            return "#e60000";
          } else {
            return "#4961e9";
          }
        }
      ]
    },
    tooltip: {
      custom: function ({ series, seriesIndex, dataPointIndex, w }) {
        if (series[seriesIndex][dataPointIndex] >= engagedValue) {
          const pointData =
            w.globals.initialSeries[seriesIndex].data[dataPointIndex];
          const geneList = formatGeneString(pointData[2], 5);

          return `<div class="apexcharts-tooltip-title" style="font-family: Helvetica, Arial, sans-serif; font-size: 12px;">
              ${w.globals.initialSeries[seriesIndex].name}
            </div>
            <div class="apexcharts-tooltip-series-group apexcharts-active" style="order: 1; display: flex;"> 
              <span class="apexcharts-tooltip-marker" style="background-color: rgb(144, 159, 241); display: none;"></span> 
              <div class="apexcharts-tooltip-text" style="font-family: Helvetica, Arial, sans-serif; font-size: 12px;">
                <div class="apexcharts-tooltip-y-group">
                  <span class="apexcharts-tooltip-text-value">Cys order:&nbsp;</span>
                  <span class="apexcharts-tooltip-text-label">${pointData[0]}</span>
                </div>
                <div class="apexcharts-tooltip-y-group">
                  <span class="apexcharts-tooltip-text-value">Cys number:&nbsp;</span>
                  <span class="apexcharts-tooltip-text-label">${pointData[3]}</span>
                </div>
                <div class="apexcharts-tooltip-z-group">
                  <span class="apexcharts-tooltip-text-value">R-value:&nbsp;</span>
                  <span class="apexcharts-tooltip-text-label">${pointData[1]}</span>
                </div>
                <div class="apexcharts-tooltip-y-group">
                  <span class="apexcharts-tooltip-text-value">Genes:&nbsp;</span>
                  <span class="apexcharts-tooltip-text-label">${geneList}</span>
                </div>
              </div>
            </div>`;
        }

        return null;
      }
    },
    xaxis: {
      title: {
        text: "Cys Order",
        style: {
          fontSize: "15px",
          fontFamily: "Helvetica",
          fontWeight: 600
        }
      },
      tickAmount: 5,
      min: 0,
      max: 25000,
      forceNiceScale: true
    },
    yaxis: {
      title: {
        text: "R-Values",
        style: {
          fontSize: "15px",
          fontFamily: "Helvetica",
          fontWeight: 600
        }
      },
      tickAmount: 8,
      min: 0,
      max: 9,
      forceNiceScale: true,
      labels: {
        formatter: function (val) {
          return parseFloat(val).toFixed(1);
        }
      }
    }
  };
}

const formatGeneString = (str, genePerLine) => {
  if (!str) return null;

  return str
    .split(",")
    .reduce((accumulator, currentValue, currentIndex, array) => {
      return currentIndex === 0
        ? accumulator + currentValue
        : (currentIndex + 1) % genePerLine === 1
        ? accumulator + ",<br />" + currentValue
        : accumulator + ", " + currentValue;
    }, "");
};
