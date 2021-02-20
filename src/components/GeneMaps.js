import _ from "lodash";
import React, { Component } from "react";
import {
  Col,
  Row,
  Form,
  ToggleButtonGroup,
  ToggleButton
} from "react-bootstrap";
import Chart from "react-apexcharts";
import InlinePreloader from "components/Preloader/InlinePreloader/index";
import GeneInfo from "components/GeneInfo";
import { parseGeneData } from "helpers/siteHelper";
import * as chart from "helpers/chartHelper";
import "styles/sites.css";

class GeneMaps extends Component {
  constructor(props) {
    super(props);

    this.state = {
      heatmapSeries: null,
      heatmapOptions: null,
      barChartSeries: null,
      barChartOptions: null,
      rvalsSorted: false
    };
  }

  componentDidUpdate(prevProps) {
    const { gene, compounds } = this.props;

    if (
      !_.isEqual(prevProps.gene, gene) &&
      !_.isEmpty(gene.fasta) &&
      !_.isEmpty(gene.cell)
    ) {
      const { cysCellData, cellLineList, rVals } = parseGeneData(
        gene.fasta,
        gene.cell,
        compounds
      );

      this.setState({
        heatmapSeries: cysCellData,
        heatmapOptions: chart.getHeatmapOptions(
          gene.fasta,
          cysCellData,
          cellLineList,
          rVals,
          compounds,
          this.onCysClick
        ),
        barChartSeries: [{ name: "R-values", data: [] }],
        barChartOptions: chart.getBarChartOptions("none selected", compounds)
      });
    }
  }

  onCysClick = (proteinName, siteR_Values, compoundLabels) => {
    const labeledRvals = siteR_Values.map((e, i) => ({
      R_Value: e,
      label: compoundLabels[i]
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

  onSortToggleChange = () =>
    this.setState({ rvalsSorted: !this.state.rvalsSorted });

  renderSortButtons = option => {
    const { barChartSeries, barChartOptions } = this.state;
    const isDisabled =
      !barChartSeries || !barChartOptions || _.isEmpty(barChartSeries[0].data);

    return (
      <ToggleButton
        key={`barChart-${option.label}`}
        value={option.value}
        disabled={isDisabled}
      >
        {option.label}
      </ToggleButton>
    );
  };

  render() {
    return (
      <Row>
        <Col className="d-flex justify-content-center align-items-center">
          <div className="card card-frame">
            {!this.state.heatmapSeries || !this.state.barChartOptions ? (
              <div className="card-body heatmapContent">
                <InlinePreloader />
              </div>
            ) : (
              <div className="card-body">
                <Chart
                  options={this.state.heatmapOptions}
                  series={this.state.heatmapSeries}
                  type="heatmap"
                  height="900"
                  width="600"
                />
              </div>
            )}
          </div>
        </Col>
        <Col className="d-flex flex-column justify-content-center align-items-center">
          <Row className="d-flex align-content-center">
            <div className="card card-header border-0 bg-secondary geneInfoContent">
              {!this.props.gene.fasta ? (
                <InlinePreloader />
              ) : (
                <GeneInfo geneData={this.props.gene.fasta} />
              )}
            </div>
          </Row>
          <Row>
            <Col className="d-flex flex-column space card card-frame barChart">
              {!this.state.barChartSeries || !this.state.barChartOptions ? (
                <div className="card-body barChartContent">
                  &nbsp;
                  <InlinePreloader />
                </div>
              ) : (
                <div className="card-body">
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
                      height="350"
                      width="600"
                    />
                  </Row>
                  <Form.Group controlId="barChartSortRow">
                    <Form.Row>
                      <Form.Label column lg={2}>
                        Sorted by:
                      </Form.Label>
                      <Col sm={0} md={0}>
                        <ToggleButtonGroup
                          type="radio"
                          name="barChartSortOptions"
                          size="sm"
                          onChange={this.onSortToggleChange}
                          defaultValue={chart.barChartSortOptions[0].value}
                        >
                          {chart.barChartSortOptions.map(option =>
                            this.renderSortButtons(option)
                          )}
                        </ToggleButtonGroup>
                      </Col>
                    </Form.Row>
                  </Form.Group>
                </div>
              )}
            </Col>
          </Row>
        </Col>
      </Row>
    );
  }
}

export default GeneMaps;
