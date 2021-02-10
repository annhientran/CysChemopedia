import _ from "lodash";
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
import { parseGeneData } from "helpers/siteHelper";
import * as chart from "helpers/chartHelper";

class GeneMaps extends Component {
  constructor(props) {
    super(props);

    const { proteinOnFasta, proteinOnCell, compounds } = this.props;
    const { cysCellData, cellLines, proteinR_Values } = parseGeneData(
      proteinOnFasta,
      proteinOnCell,
      compounds
    );

    this.state = {
      heatmapSeries: cysCellData && !_.isEmpty(cysCellData) ? cysCellData : [],
      heatmapOptions: chart.getHeatmapOptions(
        proteinOnFasta,
        cysCellData,
        cellLines,
        proteinR_Values,
        compounds,
        onCysClick
      ),
      barChartSeries: [{ name: "R-values", data: [] }],
      barChartOptions: chart.getBarChartOptions("none selected", compounds),
      rvalsSorted: false
    };
  }

  componentDidUpdate(prevProps) {
    const { proteinOnFasta, proteinOnCell, compounds } = this.props;

    if (
      !_.isEqual(prevProps.proteinOnFasta, proteinOnFasta) &&
      !_.isEqual(prevProps.proteinOnCell, proteinOnCell)
    ) {
      const { cysCellData, cellLines, proteinR_Values } = parseGeneData(
        proteinOnFasta,
        proteinOnCell,
        compounds
      );

      this.setState({
        heatmapSeries: cysCellData,
        heatmapOptions: chart.getHeatmapOptions(
          proteinOnFasta,
          cysCellData,
          cellLines,
          proteinR_Values,
          compounds,
          onCysClick
        ),

        barChartSeries: [{ name: "R-values", data: [] }],
        barChartOptions: chart.getBarChartOptions("none selected", compounds)
      });
    }
  }

  onCysClick = (proteinName, siteR_Values, compoundLabels) => {
    const labeledRvals = siteR_Values.map((e, i) => ({
      R_Value: e,
      label: compounds[i]
    }));
    const sorted = _.sortBy(labeledRvals, e => e.R_Value);
    const sortedR_Values = _.map(sorted, "R_Value");
    const sortedCompoundLabels = _.map(sorted, "label");

    this.setState({
      barChartSeries: [{ name: "R-values", data: siteR_Values }],
      barChartOptions: chart.getBarChartOptions(proteinName, compoundLabels),
      sortedBarChartSeries: [{ name: "R-values", data: sortedR_Values }],
      sortedBarChartOptions: chart.getBarChartOptions(
        proteinName,
        sortedCompoundLabels
      )
    });
  };

  render() {
    return (
      <Row>
        <Col className="d-flex justify-content-center align-items-center">
          <div className="card card-frame">
            <Chart
              options={this.state.heatmapOptions}
              series={this.state.heatmapSeries}
              type="heatmap"
              height="900"
              width="600"
            />
          </div>
        </Col>
        <Col className="d-flex flex-column justify-content-center align-items-center">
          <Row className="d-flex align-content-center">
            <div className="card card-header border-0 bg-secondary"></div>
          </Row>
          <Row id="barPlotDiv">
            <Col class="d-flex flex-column space card card-frame barChart">
              <Row>
                <Chart
                  options={
                    this.state.rvalsSorted
                      ? this.state.sortedBarChartOptions
                      : this.state.barChartOptions
                  }
                  series={
                    this.state.rvalsSorted
                      ? this.state.sortedBarChartSeries
                      : this.state.barChartSeries
                  }
                  type="bar"
                  height="900"
                  width="600"
                />
              </Row>
              <Row className="d-flex flex-row mt-2">
                Sorted by{" "}
                <ButtonToolbar>
                  <ToggleButtonGroup
                    type="checkbox"
                    value={listToggled}
                    onChange={onChange || onToggleChange}
                  >
                    <ToggleButton
                      key="barChartRvals"
                      value={chart.barChartSortOptions.rvals}
                      disabled={option.disabled}
                    >
                      {option.label}
                    </ToggleButton>
                    <ToggleButton
                      key="barChartCompound"
                      value={chart.barChartSortOptions.compounds}
                      disabled={option.disabled}
                    >
                      {option.label}
                    </ToggleButton>
                  </ToggleButtonGroup>
                </ButtonToolbar>
                {/* <div className="barChartSortWrapper">
                      <div className="barChartText"><b>Sort by</b></div>
                      <div className="barChartSort">
                          <div id="barChartSortBtn" className="disabledSort" disabled="true">
                              <input id="toggle-compound" className="toggle toggle-left"
                                  name="toggleBarChartSort" value="Compound" type="radio"
                                  disabled="true" checked>
                              <label for="toggle-compound"
                                  className="barChartSortLabel">Compound</label>
                              <input id="toggle-rval" className="toggle toggle-right"
                                  name="toggleBarChartSort" value="R-Value" type="radio"
                                  disabled="true">
                              <label for="toggle-rval" className="barChartSortLabel">R-Value</label>
                          </div>
                      </div>
                  </div> */}
              </Row>
            </Col>
          </Row>
        </Col>
      </Row>
    );
  }
}

export default GeneMaps;
