import _ from "lodash";
import React, { Component } from "react";
import { Col } from "react-bootstrap";
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
import { getHockeyStickOptions } from "helpers/chartHelper";
import "rc-tabs/assets/index.css";

class HockeyStickChart extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hockeyStickSeries: null,
      hockeyStickOptions: getHockeyStickOptions(),
      activeTab: "0",
      csvData: []
    };
  }

  componentDidUpdate(prevProps) {
    const { cellData, colsInDownloadCSV, compoundData, compound } = this.props;

    if (prevProps.compound !== compound && !_.isEmpty(compoundData)) {
      const seriesIndex = _.findIndex(compoundData, ["name", compound]);
      const series =
        seriesIndex === -1 && compound !== hockeyStick1stTabText
          ? null
          : fetchHockeyStickData(compound, this.props.cellData);
      const lastPoint = series ? series.data[series.data.length - 1][0] : null;

      this.setState({
        hockeyStickSeries: [series],
        hockeyStickOptions: getHockeyStickOptions(compound, lastPoint),
        activeTab: String(seriesIndex + 1)
      });
    }

    if (
      prevProps.compound !== compound &&
      !_.isEmpty(cellData) &&
      !_.isEmpty(compoundData)
    ) {
      const csv = getHockeyStickCSV(
        this.state.activeTab,
        cellData,
        colsInDownloadCSV,
        compound
      );
      this.setState({ csvData: csv });
    }
  }

  fetchCompound = label => {
    this.setState({
      hockeyStickSeries: fetchHockeyStickData(label, this.props.cellData)
    });
  };

  saveBar = bar => {
    this.bar = bar;
  };

  onTabChange = key => {
    this.setState(
      {
        hockeyStickSeries: null,
        activeTab: key
      },
      () => {
        const keyInt = parseInt(key);

        if (keyInt === 0) this.props.setCompound(hockeyStick1stTabText);
        else this.props.setCompound(this.props.compoundData[keyInt - 1].name);
      }
    );
  };

  renderTabContent = () => {
    const { activeTab, hockeyStickSeries, hockeyStickOptions, csvData } =
      this.state;
    const { compound } = this.props;

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
          height="480"
          width="950"
        />
        {hockeyStickSeries && parseInt(activeTab) !== 0 ? (
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
                filename={`${this.props.compound}.csv`}
                className="btn btn-primary"
                target="_blank"
              >
                <IconLabel
                  awesomeIcon="download"
                  label={`Download ${this.props.compound} CSV`}
                />
              </CSVLink>
            )}
          </div>
        ) : null}
      </>
    );
  };

  renderTabPane = () => {
    return this.props.compoundData.map((compound, i) => {
      return (
        <TabPane tab={compound.name} key={i + 1} style={{ minHeight: 540 }}>
          {parseInt(this.state.activeTab) !== i + 1
            ? null
            : this.renderTabContent()}
        </TabPane>
      );
    });
  };

  render() {
    return (
      <>
        <Col className="d-flex justify-content-center align-items-center">
          <div
            id="hockeyStickChart"
            className="card card-frame"
            style={{ height: "600px", width: "1200px" }}
          >
            {_.isEmpty(this.props.compoundData) || !this.props.compound ? (
              <div className="card-body hockeyStickContent">
                <InlinePreloader />
              </div>
            ) : (
              <div className="card-body">
                <Tabs
                  activeKey={this.state.activeTab}
                  style={{ height: 550 }}
                  tabBarPosition="left"
                  animated={false}
                  renderTabBar={() => (
                    <ScrollableInkTabBar
                      ref={this.saveBar}
                      onTabClick={this.onTabChange}
                      nextIcon={<IconLabel awesomeIcon="caret-down" />}
                      prevIcon={<IconLabel awesomeIcon="caret-up" />}
                    />
                  )}
                  renderTabContent={() => (
                    <TabContent
                      style={{ height: 550 }}
                      animated={false}
                      animatedWithMargin={false}
                    />
                  )}
                >
                  <TabPane
                    tab={hockeyStick1stTabText}
                    key={0}
                    style={{ minHeight: 540 }}
                  >
                    {parseInt(this.state.activeTab) !== 0
                      ? null
                      : this.renderTabContent()}
                  </TabPane>
                  {this.renderTabPane()}
                </Tabs>
              </div>
            )}
          </div>
        </Col>
      </>
    );
  }
}

export default HockeyStickChart;
