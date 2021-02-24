import _ from "lodash";
import React, { Component } from "react";
import { Col } from "react-bootstrap";
import Tabs, { TabPane } from "rc-tabs";
import TabContent from "rc-tabs/lib/TabContent";
import ScrollableInkTabBar from "rc-tabs/lib/ScrollableInkTabBar";
import Chart from "react-apexcharts";
import IconLabel from "./IconLabel";
import InlinePreloader from "components/Preloader/InlinePreloader/index";
import * as chart from "helpers/chartHelper";
import "rc-tabs/assets/index.css";

class HockeyStickChart extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hockeyStickSeries: null,
      hockeyStickOptions: chart.getHockeyStickOptions(),
      activeTab: "0"
    };
  }

  componentDidUpdate(prevProps) {
    const { compoundData, compound } = this.props;

    if (prevProps.compound !== compound && !_.isEmpty(compoundData)) {
      this.setState({
        hockeyStickSeries: _.find(compoundData, ["name", compound])
      });
      debugger;
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
    debugger;
    return !this.state.hockeyStickSeries ? (
      <div className="card-body hockeyStickContent">
        <InlinePreloader />
      </div>
    ) : (
      <Chart
        options={this.state.hockeyStickOptions}
        series={this.state.hockeyStickSeries}
        type="scatter"
        height="350"
        // width="600"
      />
    );
  };

  renderTabPane = () => {
    return this.props.compoundData.map((compound, i) => {
      return (
        <TabPane placeholder={`loading ${i}`} tab={compound.name} key={i}>
          {this.state.activeTab !== i ? null : this.renderTabContent()}
        </TabPane>
      );
    });
  };

  render() {
    debugger;
    return (
      <>
        <Col className="d-flex justify-content-center align-items-center">
          <div
            className="card card-frame"
            style={{ height: "500px", width: "1200px" }}
          >
            {_.isEmpty(this.props.compoundData) || !this.props.compound ? (
              <div className="card-body hockeyStickContent">
                <InlinePreloader />
              </div>
            ) : (
              <div className="card-body">
                <Tabs
                  activeKey={this.state.activeTab}
                  style={{ height: 400 }}
                  tabBarPosition="left"
                  renderTabBar={() => (
                    <ScrollableInkTabBar
                      ref={this.saveBar}
                      onTabClick={this.onTabChange}
                      nextIcon={<IconLabel awesomeIcon="caret-down" />}
                      prevIcon={<IconLabel awesomeIcon="caret-up" />}
                    />
                  )}
                  renderTabContent={() => (
                    <TabContent style={{ height: 400 }} />
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
