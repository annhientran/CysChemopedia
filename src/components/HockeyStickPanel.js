import _ from "lodash";
import React, { Component } from "react";
import { Col } from "react-bootstrap";
import Tabs, { TabPane } from "rc-tabs";
import TabContent from "rc-tabs/lib/TabContent";
import ScrollableInkTabBar from "rc-tabs/lib/ScrollableInkTabBar";
import HockeyStickChart from "components/HockeyStickChart";
import IconLabel from "./IconLabel";
import InlinePreloader from "components/Preloader/InlinePreloader/index";
import {
  hockeyStick1stTabText,
  fetchCompoundCellLines
} from "helpers/siteHelper";
import "rc-tabs/assets/index.css";

class HockeyStickPanel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeCompound: "0",
      filteredCellData: null,
      cellLineList: null
    };
  }

  componentDidUpdate(prevProps) {
    const { cellData, compoundList, compound } = this.props;

    if (prevProps.compound !== compound && !_.isEmpty(compoundList)) {
      const compoundIndex = _.findIndex(compoundList, ["name", compound]);
      const filteredCellData =
        compoundIndex === -1 && compound === hockeyStick1stTabText
          ? [] // return empty list for unknown compound tab
          : _.reject(cellData, [compound, ""]);
      const cellLineList =
        compoundIndex === -1 && compound === hockeyStick1stTabText
          ? []
          : fetchCompoundCellLines(compound, filteredCellData);

      this.setState({
        activeCompound: String(compoundIndex + 1),
        filteredCellData,
        cellLineList
      });
    }
  }

  saveBar = bar => {
    this.bar = bar;
  };

  onTabChange = key => {
    const keyInt = parseInt(key);

    if (keyInt === 0) {
      this.props.setCompound(hockeyStick1stTabText);
    } else this.props.setCompound(this.props.compoundList[keyInt - 1].name);
  };

  renderTabContent = () => {
    const { filteredCellData, cellLineList } = this.state;
    const { compound, colsInDownloadCSV } = this.props;

    return (
      <div className="hkChartFrame">
        <HockeyStickChart
          compound={compound}
          compoundCellLines={cellLineList}
          cellData={filteredCellData}
          colsInDownloadCSV={colsInDownloadCSV}
        />
      </div>
    );
  };

  renderTabPane = () => {
    return this.props.compoundList.map((compound, i) => (
      <TabPane tab={compound.name} key={i + 1} style={{ minHeight: 540 }}>
        {parseInt(this.state.activeCompound) !== i + 1
          ? null
          : this.renderTabContent()}
      </TabPane>
    ));
  };

  render() {
    return (
      <>
        <Col className="d-flex justify-content-center align-items-center">
          <div
            id="hockeyStickPanel"
            className="card card-frame"
            style={{ height: "600px", width: "1200px" }}
          >
            {_.isEmpty(this.props.compoundList) || !this.props.compound ? (
              <div className="card-body hockeyStickContent">
                <InlinePreloader />
              </div>
            ) : (
              <div className="card-body">
                <Tabs
                  activeKey={this.state.activeCompound}
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
                    {parseInt(this.state.activeCompound) !== 0
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

export default HockeyStickPanel;
