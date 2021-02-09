import React, { Component } from "react";
import {
  Button,
  Col,
  Row,
  FormGroup,
  FormControl,
  FormLabel
} from "react-bootstrap";
import Chart from "react-apexcharts";

class GeneMaps extends Component {
  constructor(props) {
    super(props);

    this.state = {
      options: {
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
              let el = event.target;
              const i = el.getAttribute("i");
              const j = el.getAttribute("j");
              const selectedCysteine = cysCellData[i].name;
              const selectedCellLine = cellLines[j];
              let selectedProtein = _.find(
                proteinR_Values,
                p =>
                  p.name === selectedCysteine && p.cellLine === selectedCellLine
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
      },
      series: props.series
    };
  }

  render() {
    return (
      <Row>
        <Col className="d-flex justify-content-center align-items-center">
          <div className="card card-frame">
            <Chart
              options={this.state.options}
              series={this.state.series}
              type="heatmap"
              height="900"
              width="600"
            />
          </div>
        </Col>
      </Row>
    );
  }
}

export default GeneMaps;
