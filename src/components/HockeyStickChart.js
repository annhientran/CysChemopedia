import _ from "lodash";
import React, { Component } from "react";
import { Col } from "react-bootstrap";
import Tabs, { TabPane } from "rc-tabs";
import TabContent from "rc-tabs/lib/TabContent";
import ScrollableInkTabBar from "rc-tabs/lib/ScrollableInkTabBar";
import Chart from "react-apexcharts";
import IconLabel from "./IconLabel";
import InlinePreloader from "components/Preloader/InlinePreloader/index";
import { getHockeyStickCSV } from "helpers/siteHelper";
import { getHockeyStickOptions } from "helpers/chartHelper";
import CompoundImgTooltip from "components/CompoundImgTooltip";
import { CSVLink } from "react-csv";
import "rc-tabs/assets/index.css";

class HockeyStickChart extends Component {
  constructor(props) {
    super(props);
    // const { compoundData, compound } = this.props;
    // const initialSeries =
    //   compound && _.isEmpty(compoundData)
    //     ? _.find(this.props.compoundData, ["name", this.props.compound])
    //     : null;

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
      const foundSeries = seriesIndex >= 0 ? [compoundData[seriesIndex]] : null;
      this.setState({
        hockeyStickSeries: foundSeries,
        activeTab: String(seriesIndex) //seriesIndex >= 0 ? String(seriesIndex) : 0
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

  saveBar = bar => {
    this.bar = bar;
  };

  onTabChange = key => {
    this.setState({ hockeyStickSeries: null, activeTab: key });
    this.props.setCompound(this.props.compoundData[key].name);
  };

  renderTabContent = () => {
    const {
      activeTab,
      hockeyStickSeries,
      hockeyStickOptions,
      csvData
    } = this.state;

    return _.isNull(hockeyStickSeries) ? (
      <div className="card-body hockeyStickContent">
        {/* <InlinePreloader /> */}
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
          <div style={{float:"right"}}>
            <CompoundImgTooltip
              compound={this.props.compound}
              placement="left"
              width="150"
              height="150"
            />
            <CSVLink
              data={csvData}
              filename={`${this.props.compound}.csv`}
              className="btn btn-primary"
              target="_blank"
            >
              <IconLabel
                awesomeIcon="download" //"sync"
                label={`Download ${this.props.compound} CSV`}
              />
            </CSVLink>
          </div>
        ) : null}
      </>
    );
  };

  renderTabPane = () => {
    return this.props.compoundData.map((compound, i) => {
      return (
        <TabPane tab={compound.name} key={i} style={{ minHeight: 540 }}>
          {parseInt(this.state.activeTab) !== i
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
