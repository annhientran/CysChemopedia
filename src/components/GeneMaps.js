import _ from "lodash";
import React, { Component } from "react";
import $ from "jquery";
import {
  Alert,
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
import IconLabel from "./IconLabel";

class GeneMaps extends Component {
  constructor(props) {
    super(props);

    this.state = {
      heatmapSeries: null,
      heatmapOptions: null,
      barChartSeries: null,
      barChartOptions: null,
      rvalsSorted: false,
      cysNumber: "none selected"
    };
  }

  componentDidUpdate(prevProps) {
    const { gene, compounds } = this.props;

    if (
      !_.isEqual(prevProps.gene, gene) &&
      !_.isEmpty(gene.fasta) &&
      !_.isEmpty(gene.cell) &&
      !_.isEmpty(compounds)
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
        barChartOptions: chart.getBarChartOptions(
          "none selected",
          _.map(compounds, "name"),
          this.tooltipBarChartLabel
        )
      });
    }
  }

  onCysClick = (cysNumber, siteR_Values, compoundLabels) => {
    const labeledRvals = siteR_Values.map((e, i) => ({
      R_Value: e,
      label: compoundLabels[i].name
    }));
    const filtered = labeledRvals.filter(e => e.R_Value);
    const sorted = _.orderBy(filtered, ["R_Value"], ["desc"]);
    const sortedR_Values = _.map(sorted, "R_Value");
    const sortedCompoundLabels = _.map(sorted, "label");

    this.setState({
      cysNumber: cysNumber,
      barChartSeries: [{ name: "R-values", data: _.map(filtered, "R_Value") }],
      barChartOptions: chart.getBarChartOptions(
        cysNumber,
        _.map(filtered, "label"),
        this.tooltipBarChartLabel
      ),
      sortedBarChartSeries: [{ name: "R-values", data: sortedR_Values }],
      sortedBarChartOptions: chart.getBarChartOptions(
        cysNumber,
        sortedCompoundLabels,
        this.tooltipBarChartLabel
      )
    });
  };

  tooltipBarChartLabel = () => {
    const { setHockeyStickCompound } = this.props;
    $(function () {
      $(".barchart-xlabel").each(function () {
        let currId = $(this).attr("id");
        let compound = $("#" + currId + " > title").text();

        $("#" + currId).click(() => {
          setHockeyStickCompound(compound);
        });
      });
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
        variant="outline-secondary"
      >
        {option.label}
      </ToggleButton>
    );
  };

  render() {
    const {
      barChartSeries,
      barChartOptions,
      sortedBarChartSeries,
      sortedBarChartOptions,
      rvalsSorted,
      heatmapSeries,
      heatmapOptions
    } = this.state;

    const barChartWidth =
      barChartSeries && barChartSeries[0].data.length > 0
        ? barChartSeries[0].data.length * 42
        : "600";

    return (
      <>
        <Col className="d-flex justify-content-center align-items-center">
          <div className="card card-frame">
            {!heatmapSeries || !heatmapOptions ? (
              <div className="card-body heatmapContent">
                <InlinePreloader />
              </div>
            ) : (
              <div className="card-body">
                <Chart
                  options={heatmapOptions}
                  series={heatmapSeries}
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
            <div className="card border-0 geneInfoContent">
              {!this.props.gene.fasta ? (
                <div className="card-header">
                  <InlinePreloader />
                </div>
              ) : (
                <GeneInfo geneData={this.props.gene.fasta} />
              )}
            </div>
          </Row>
          <Row>
            <Col className="d-flex flex-column space card card-frame barChart">
              {!barChartSeries || !barChartOptions ? (
                <div className="card-body barChartFrame">
                  &nbsp;
                  <InlinePreloader />
                </div>
              ) : (
                <div className="card-body">
                  <Row>
                    <Col>
                      <div
                        style={{
                          textAlign: "center",
                          fontFamily: "Helvetica"
                        }}
                      >
                        <h2>Site Stoichiometry</h2>
                        <h3>Site: {this.state.cysNumber}</h3>
                      </div>
                      <Alert key="bar-chart-direction" variant="info">
                        <IconLabel awesomeIcon="info-circle" />
                        Please click on the compound name to see its Hockey
                        Stick plot
                      </Alert>
                      <div className="barChartFrame">
                        <Chart
                          options={
                            rvalsSorted
                              ? sortedBarChartOptions
                              : barChartOptions
                          }
                          series={
                            rvalsSorted ? sortedBarChartSeries : barChartSeries
                          }
                          type="bar"
                          height="350"
                          width={barChartWidth}
                        />
                      </div>
                    </Col>
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
      </>
    );
  }
}

export default GeneMaps;
