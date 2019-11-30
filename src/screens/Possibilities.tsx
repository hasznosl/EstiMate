import React, { Component } from "react";
import { View } from "react-native";
import { BarChart, Grid, XAxis } from "react-native-svg-charts";
import { GlobalContext } from "../Contexts";
import {
  chartContainer,
  generalStyles,
  lineColor,
  xAxisContentInset
} from "../styles";
import { IAppContext } from "../utils/types";
import calculatePossibilitiesData from "../utils/calculatePossibilitiesData";

export default class Possibilities extends Component {
  static navigationOptions = {
    title: "Possible worth"
  };

  render() {
    return (
      <GlobalContext.Consumer>
        {({ netWorthOverTime, financialGoal, importantDates }: IAppContext) => {
          const xAxisHeight = 30;
          const response = calculatePossibilitiesData({
            netWorthOverTime,
            firstStepLevel: 30000,
            bucketWidth: 10000,
            bucketsNumber: 10,
            financialGoal,
            importantDates
          });
          return (
            <View style={generalStyles.container}>
              <View style={chartContainer}>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <BarChart
                    style={{ height: "100%" }}
                    data={Object.keys(response.buckets).map(
                      bucketKey => response.buckets[bucketKey]
                    )}
                    svg={{ fill: lineColor }}
                    contentInset={{ top: 30, bottom: 30 }}
                  >
                    <Grid />
                  </BarChart>
                  <View style={{ flex: 1, paddingLeft: 35 }}>
                    <XAxis
                      style={{ marginHorizontal: -10, height: xAxisHeight }}
                      data={response.ranges}
                      formatLabel={(value, index) => {
                        return `${response.ranges[index] / 1000}k`;
                      }}
                      contentInset={xAxisContentInset}
                      svg={{ fontSize: 10, fill: "black" }}
                      numberOfTicks={response.ranges.length}
                    />
                  </View>
                </View>
              </View>
            </View>
          );
        }}
      </GlobalContext.Consumer>
    );
  }
}
