import _ from "lodash";
import React, { Component } from "react";
import { Col, Row } from "react-bootstrap";
import Tabs, { TabPane } from "rc-tabs";
import TabContent from "rc-tabs/lib/TabContent";
import ScrollableInkTabBar from "rc-tabs/lib/ScrollableInkTabBar";
import { CSVLink } from "react-csv";
import Chart from "react-apexcharts";
import IconLabel from "./IconLabel";
import InlinePreloader from "components/Preloader/InlinePreloader/index";
import CompoundImgTooltip from "components/CompoundImgTooltip";
import {
  getHockeyStickCSV,
  fetchHockeyStickData,
  hockeyStick1stTabText
} from "helpers/siteHelper";
import {
  getHockeyStickOptions,
  getPromiscuityScore
} from "helpers/chartHelper";
import "rc-tabs/assets/index.css";

class HockeyStickChart extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hockeyStickSeries: null,
      hockeyStickOptions: getHockeyStickOptions(),
      activeCellLine: "0",
      csvData: []
    };
  }

  // select a compound tab
  componentDidMount() {
    const { compound, compoundCellLines, cellData, colsInDownloadCSV } =
      this.props;

    // select a regular compound tab
    if (!_.isEmpty(compoundCellLines) && !_.isEmpty(cellData)) {
      const selectedCellLine = compoundCellLines[0];
      const filteredCellData = _.filter(cellData, [
        "cell_line",
        selectedCellLine
      ]);

      const series = fetchHockeyStickData(compound, filteredCellData);
      const lastPoint = series ? series.data[series.data.length - 1][0] : null;
      const csvData = getHockeyStickCSV(
        compound,
        filteredCellData,
        colsInDownloadCSV
      );
      this.setState({
        hockeyStickSeries: [series],
        hockeyStickOptions: getHockeyStickOptions(compound, lastPoint),
        activeCellLine: "0",
        csvData,
        promiscuityScore: getPromiscuityScore(filteredCellData)
      });

      // select the "Select Compound" tab
    } else if (
      compound === hockeyStick1stTabText &&
      (_.isEmpty(compoundCellLines) || !_.isEmpty(cellData))
    ) {
      const series = fetchHockeyStickData(compound, cellData);

      this.setState({
        hockeyStickSeries: [series],
        hockeyStickOptions: getHockeyStickOptions(compound),
        activeCellLine: "0",
        csvData: [],
        promiscuityScore: null
      });
    }
  }

  // select a cell line tab of a compound tab
  componentDidUpdate(prevProps, prevState) {
    const { compound, compoundCellLines, cellData, colsInDownloadCSV } =
      this.props;

    if (
      prevState.activeCellLine !== this.state.activeCellLine &&
      !_.isEmpty(cellData) &&
      !_.isEmpty(compoundCellLines)
    ) {
      const selectedCellLine =
        compoundCellLines[parseInt(this.state.activeCellLine)];
      const filteredCellData = _.filter(cellData, [
        "cell_line",
        selectedCellLine
      ]);
      const series = fetchHockeyStickData(compound, filteredCellData);
      const lastPoint = series ? series.data[series.data.length - 1][0] : null;
      const csvData = series
        ? getHockeyStickCSV(compound, filteredCellData, colsInDownloadCSV)
        : [];

      this.setState({
        hockeyStickSeries: [series],
        hockeyStickOptions: getHockeyStickOptions(compound, lastPoint),
        csvData,
        promiscuityScore: getPromiscuityScore(filteredCellData)
      });
    }
  }

  saveBar = bar => {
    this.bar = bar;
  };

  onTabChange = key => {
    this.setState({
      hockeyStickSeries: null,
      activeCellLine: key
    });
  };

  renderTabContent = () => {
    const { hockeyStickSeries, hockeyStickOptions, csvData, promiscuityScore } =
      this.state;
    const { compound, compoundCellLines } = this.props;
    const selectedCellLine = compoundCellLines
      ? compoundCellLines[parseInt(this.state.activeCellLine)]
      : null;

    return _.isNull(hockeyStickSeries) ? (
      <div className="card-body hockeyStickContent">
        <InlinePreloader />
      </div>
    ) : (
      <>
        <Chart
          options={hockeyStickOptions}
          series={hockeyStickSeries}
          type="scatter"
          height="430"
          width="880"
        />
        {hockeyStickSeries && compound !== hockeyStick1stTabText ? (
          <Row>
            <Col sm={3} md={3}>
              {promiscuityScore && (
                <div class="col-form-label">
                  Promiscuity Score: {`${promiscuityScore}`}
                </div>
              )}
            </Col>
            <Col sm={9} md={9}>
              <div style={{ float: "right" }}>
                <CompoundImgTooltip
                  compound={compound}
                  placement="left"
                  width="150"
                  height="150"
                />
                {csvData && !_.isEmpty(csvData) && (
                  <CSVLink
                    data={csvData}
                    filename={`${compound}-${selectedCellLine}.csv`}
                    className="btn btn-primary"
                    target="_blank"
                  >
                    <IconLabel
                      awesomeIcon="download"
                      label={`Download ${compound} CSV`}
                    />
                  </CSVLink>
                )}
              </div>
            </Col>
          </Row>
        ) : null}
      </>
    );
  };

  renderTabPane = () => {
    return this.props.compoundCellLines.map((cellLine, i) => (
      <TabPane tab={cellLine} key={i} style={{ Height: 540 }}>
        {this.renderTabContent()}
      </TabPane>
    ));
  };

  renderView = () => {
    return (
      <>
        {_.isEmpty(this.props.compoundCellLines) ? (
          <div style={{ width: 950, height: 550 }}>
            {this.renderTabContent()}
          </div>
        ) : (
          <Tabs
            activeKey={this.state.activeCellLine}
            style={{ width: 900, height: 550 }}
            tabBarPosition="bottom"
            animated={false}
            renderTabBar={() => (
              <ScrollableInkTabBar
                ref={this.saveBar}
                onTabClick={this.onTabChange}
                // nextIcon={<IconLabel awesomeIcon="caret-right" />}
                // prevIcon={<IconLabel awesomeIcon="caret-left" />}
              />
            )}
            renderTabContent={() => (
              <TabContent
                style={{ height: 500 }}
                animated={false}
                animatedWithMargin={false}
              />
            )}
          >
            {this.renderTabPane()}
          </Tabs>
        )}
      </>
    );
  };

  render() {
    return (
      <>
        <Col className="d-flex justify-content-center align-items-center">
          <div id="hockeyStickChart">{this.renderView()}</div>
        </Col>
      </>
    );
  }
}

export default HockeyStickChart;
