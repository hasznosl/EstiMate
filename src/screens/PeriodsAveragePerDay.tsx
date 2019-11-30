import React, { Component } from "react";
import { View } from "react-native";
import { LineChart, XAxis, YAxis } from "react-native-svg-charts";
import { isSameDay, endOfMonth, differenceInYears } from "date-fns";
import { calculatePeriodsAveragePerDayOverTimeData } from "../utils";
import { GlobalContext } from "../Contexts";
import {
  chartSVGProps,
  chartContainer,
  verticalContentInset,
  xAxisContentInset,
  generalStyles,
  lineColor
} from "../styles";
import { IAppContext } from "../utils/types";

export default class PeriodsAveragePerDay extends Component {
  static navigationOptions = {
    title: "Average Per Day Over Periods"
  };

  render() {
    return (
      <GlobalContext.Consumer>
        {({
          netWorthOverTimeToFuture,
          importantDates,
          birthDay
        }: IAppContext) => {
          const pastAndFuture = calculatePeriodsAveragePerDayOverTimeData({
            netWorthOverTimeToFuture,
            importantDates
          });
          const xAxisHeight = 30;
          const data = Object.keys(pastAndFuture)
            .filter(date => isSameDay(date, endOfMonth(date)))
            .map(key => ({
              date: key,
              value: pastAndFuture[key]
            }));

          return (
            <View style={generalStyles.container}>
              <View style={chartContainer}>
                <YAxis
                  data={data.map(dat => dat.value)}
                  contentInset={verticalContentInset}
                  svg={{
                    fill: lineColor,
                    fontSize: 10
                  }}
                  formatLabel={value => value}
                  style={{ marginBottom: xAxisHeight }}
                />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <LineChart
                    style={{ flex: 1 }}
                    data={data.map(dat => dat.value)}
                    svg={chartSVGProps}
                    contentInset={verticalContentInset}
                  />
                  <XAxis
                    style={{ marginHorizontal: -10, height: xAxisHeight }}
                    data={data}
                    formatLabel={(value, index) => {
                      if (index === 0 || index === data.length - 1) {
                        return birthDay
                          ? differenceInYears(data[index].date, birthDay)
                          : data[index].date;
                      } else {
                        return "";
                      }
                    }}
                    contentInset={xAxisContentInset}
                    svg={{ fontSize: 10, fill: "black" }}
                    numberOfTicks={data.length}
                  />
                </View>
              </View>
            </View>
          );
        }}
      </GlobalContext.Consumer>
    );
  }
}
