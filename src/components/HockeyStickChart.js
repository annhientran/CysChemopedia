import _ from "lodash";
import React, { Component } from "react";
import {
  Col,
  Row,
  Form,
  ToggleButtonGroup,
  ToggleButton
} from "react-bootstrap";
import Tabs, { TabPane } from "rc-tabs";
import TabContent from "rc-tabs/lib/TabContent";
import ScrollableInkTabBar from "rc-tabs/lib/ScrollableInkTabBar";
import Chart from "react-apexcharts";
import InlinePreloader from "components/Preloader/InlinePreloader/index";
import { parseGeneData } from "helpers/siteHelper";
import * as chart from "helpers/chartHelper";
import "styles/sites.css";

class HockeyStickChart extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hockeyStickSeries: null,
      hockeyStickOptions: null
    };
  }

  componentDidUpdate(prevProps) {
    const { compoundData, compound } = this.props;

    if (
      !_.isEqual(prevProps.compoundData, compoundData) &&
      !_.isEmpty(gene.fasta) &&
      !_.isEmpty(gene.cell)
    ) {
      this.setState({
        hockeyStickSeries: this.props.compound,
        hockeyStickOptions: chart.getHeatmapOptions(
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
          compounds,
          this.tooltipBarChartLabel
        )
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
      barChartOptions: chart.getBarChartOptions(
        proteinName,
        compoundLabels,
        this.tooltipBarChartLabel
      ),
      sortedBarChartSeries: [{ name: "R-values", data: sortedR_Values }],
      sortedBarChartOptions: chart.getBarChartOptions(
        proteinName,
        sortedCompoundLabels,
        this.tooltipBarChartLabel
      )
    });
  };

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
      <>
        <Col className="d-flex justify-content-center align-items-center">
          <div className="card card-frame">
            {/* {!this.state.hockeyStickSeries || !this.state.hockeyStickOptions ? (
              <div className="card-body heatmapContent">
                <InlinePreloader />
              </div>
            ) : (
              <div className="card-body">
                <Tabs
                  activeKey={this.state.activeKey}
                  // className={cls}
                  // style={style}
                  tabBarPosition="left"
                  renderTabBar={() => (
                    <ScrollableInkTabBar
                      ref={this.saveBar}
                      onTabClick={this.onTabClick}
                      {...iconProps}
                    />
                  )}
                  renderTabContent={() => <TabContent style={contentStyle} />}
                  onChange={this.onChange2}
                >
                  {ends}
                </Tabs>
                
              </div>
            )} */}
          </div>
        </Col>
      </>
    );
  }
}

export default HockeyStickChart;
