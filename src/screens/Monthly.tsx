import React from "react";
import { Text, View, StyleSheet } from "react-native";
import { GlobalContext } from "../Contexts";
import { LineChart, YAxis } from "react-native-svg-charts";
import {
  getMonth,
  startOfMonth,
  subDays,
  isAfter,
  getDate,
  addMonths,
  subMonths,
  endOfMonth,
  getDaysInMonth,
  isBefore,
  differenceInMonths
} from "date-fns";
import {
  differenceInFuture,
  getMonthString,
  getCanSpendAmount
} from "../utils";
import {
  lineChartSVGPropsPrimary,
  lineChartSVGPropsSecondary,
  lineChartSVGPropsTertiary,
  verticalContentInset,
  twoMainItemsScreen,
  tableStyles,
  appBackground,
  lineColor
} from "../styles";
import { Table, Row } from "react-native-table-component";
import { Orientation, IAppContext } from "../utils/types";
import formatDate from "../utils/formatDate";

export default class Monthly extends React.Component {
  static navigationOptions = {
    title: "Monthly"
  };

  renderChart = ({
    monthlyAverageSpending,
    netWorthOverTimeToFuture,
    orientation
  }) => {
    let averagesData = Object.keys(monthlyAverageSpending).map(key => ({
      day: key,
      relativeWorth: monthlyAverageSpending[key]
    }));
    let newestData = Object.keys(netWorthOverTimeToFuture)
      .filter(
        key =>
          isBefore(key, startOfMonth(addMonths(new Date(), 1))) &&
          isAfter(key, endOfMonth(subMonths(new Date(), 1)))
      )
      .map(key => ({
        day: `${getDate(key)}`,
        relativeWorth: Math.floor(
          netWorthOverTimeToFuture[key] -
            netWorthOverTimeToFuture[formatDate(endOfMonth(subMonths(key, 1)))]
        )
      }));
    let oneMonthAgoData = Object.keys(netWorthOverTimeToFuture)
      .filter(
        key =>
          isBefore(key, startOfMonth(new Date())) &&
          isAfter(key, endOfMonth(subMonths(new Date(), 2)))
      )
      .map(key => ({
        day: `${getDate(key)}`,
        relativeWorth: Math.floor(
          netWorthOverTimeToFuture[key] -
            netWorthOverTimeToFuture[formatDate(endOfMonth(subMonths(key, 1)))]
        )
      }));
    const min = Math.min(
      ...averagesData.map(dat => dat.relativeWorth),
      ...newestData.map(dat => dat.relativeWorth),
      ...oneMonthAgoData.map(dat => dat.relativeWorth)
    );
    const max = Math.max(
      ...averagesData.map(dat => dat.relativeWorth),
      ...newestData.map(dat => dat.relativeWorth),
      ...oneMonthAgoData.map(dat => dat.relativeWorth)
    );
    averagesData = [
      { day: "0", relativeWorth: min },
      ...averagesData,
      { day: "32", relativeWorth: max }
    ];
    newestData = [
      { day: "0", relativeWorth: min },
      ...newestData,
      { day: "32", relativeWorth: max }
    ];
    oneMonthAgoData = [
      { day: "0", relativeWorth: min },
      ...oneMonthAgoData,
      { day: "32", relativeWorth: max }
    ];
    return (
      <View
        style={{
          flex: orientation === Orientation.LANDSCAPE ? 1 : 2,
          padding: 20,
          flexDirection: "row",
          height: orientation === Orientation.LANDSCAPE ? "100%" : "auto"
        }}
      >
        <YAxis
          data={[max, min]}
          contentInset={verticalContentInset}
          svg={{
            fill: lineColor,
            fontSize: 10
          }}
          formatLabel={value => value}
        />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <LineChart
            style={{ flex: 1 }}
            data={averagesData.map(dat => dat.relativeWorth)}
            svg={lineChartSVGPropsTertiary}
            contentInset={verticalContentInset}
          />
          <View style={styles.coverPanel({ isLeft: true })} />
          <LineChart
            style={StyleSheet.absoluteFill}
            data={newestData.map(dat => dat.relativeWorth)}
            svg={lineChartSVGPropsPrimary}
            contentInset={verticalContentInset}
          />
          <LineChart
            style={StyleSheet.absoluteFill}
            data={oneMonthAgoData.map(dat => dat.relativeWorth)}
            svg={lineChartSVGPropsSecondary}
            contentInset={verticalContentInset}
          />
          <View style={styles.coverPanel({ isLeft: false })} />
        </View>
      </View>
    );
  };

  renderTable = ({
    levelToday,
    canSpendOrNeedToSaveAmount,
    stableIncome,
    projectedSavingForThisMonth,
    lastOneMonthGrowthRate,
    longTermGrowthRate,
    monthlyAverageSpending,
    netWorthOverTimeToFuture,
    importantDates
  }) => {
    const tableHead = ["", "1 month", "long term"];
    const worthEndOfLastMonth =
      netWorthOverTimeToFuture[
        formatDate(endOfMonth(subMonths(new Date(), 1)))
      ];
    const worthEndOfLastLastMonth =
      netWorthOverTimeToFuture[
        formatDate(endOfMonth(subMonths(new Date(), 2)))
      ];
    const lastMonthFinalSaving = worthEndOfLastMonth - worthEndOfLastLastMonth;
    const oneMonthAgoLevel =
      netWorthOverTimeToFuture[formatDate(subMonths(new Date(), 1))] -
      worthEndOfLastLastMonth;
    const cumulatedGrowth =
      netWorthOverTimeToFuture[formatDate(endOfMonth(new Date()))] -
        netWorthOverTimeToFuture[
          formatDate(importantDates[importantDates.length - 1])
        ] || netWorthOverTimeToFuture[formatDate(endOfMonth(new Date()))];

    const tableData = [
      [
        "How are you doing now",
        Math.floor(levelToday - oneMonthAgoLevel),
        Math.floor(levelToday - monthlyAverageSpending[getDate(new Date())])
      ],
      [
        "How will you be doing",
        Math.floor(projectedSavingForThisMonth - lastMonthFinalSaving),
        Math.floor(
          projectedSavingForThisMonth -
            monthlyAverageSpending[getDaysInMonth(new Date())]
        )
      ],
      ["How will you need to be doing", "-", canSpendOrNeedToSaveAmount],
      [
        "Save ratio",
        `${Math.floor((projectedSavingForThisMonth / stableIncome) * 100)}%`,
        `${Math.floor(
          (cumulatedGrowth /
            (stableIncome *
              differenceInMonths(
                endOfMonth(new Date()),
                importantDates[importantDates.length - 1] ||
                  Object.keys(netWorthOverTimeToFuture)[0]
              ))) *
            100
        )}%`
      ],
      [
        "Growth rate",
        Math.floor(lastOneMonthGrowthRate),
        Math.floor(longTermGrowthRate)
      ]
    ];
    return (
      <View style={tableStyles.container}>
        <Text style={{ fontWeight: "bold", fontSize: 24, paddingBottom: 10 }}>
          {`${getMonthString(getMonth(new Date()))} ${getDate(new Date())}`}
        </Text>
        <Table borderStyle={{ borderColor: "transparent" }}>
          <Row
            data={tableHead}
            style={tableStyles.head}
            flexArr={[3, 1, 1]}
            textStyle={tableStyles.headerText}
          />
          <Row
            data={tableData[0]}
            style={tableStyles.row({ index: 0 })}
            flexArr={[3, 1, 1]}
            textStyle={tableStyles.text}
          />
          <Row
            data={tableData[1]}
            style={tableStyles.row({ index: 1 })}
            flexArr={[3, 1, 1]}
            textStyle={tableStyles.text}
          />
          <Row
            data={tableData[2]}
            style={tableStyles.row({ index: 2 })}
            flexArr={[3, 1, 1]}
            textStyle={tableStyles.text}
          />
          <Row
            data={tableData[3]}
            style={tableStyles.row({ index: 3 })}
            flexArr={[3, 1, 1]}
            textStyle={tableStyles.text}
          />
          <Row
            data={tableData[4]}
            style={tableStyles.row({ index: 4 })}
            flexArr={[3, 1, 1]}
            textStyle={tableStyles.text}
          />
        </Table>
      </View>
    );
  };

  render() {
    return (
      <GlobalContext.Consumer>
        {({
          netWorthOverTimeToFuture,
          netWorthOverTime,
          financialGoal,
          importantDates,
          monthlyAverageSpending,
          stableIncome,
          projectedSavingForThisMonth,
          lastOneMonthGrowthRate,
          longTermGrowthRate,
          orientation
        }: IAppContext) => {
          const canSpendOrNeedToSaveAmount =
            financialGoal &&
            getCanSpendAmount({
              netWorthOverTimeToFuture,
              netWorthOverTime,
              financialGoal,
              importantDates
            }) * -1;
          let currentDate = formatDate(new Date());
          let lastValue = netWorthOverTime[currentDate];
          while (!lastValue) {
            lastValue = netWorthOverTime[currentDate];
            currentDate = formatDate(subDays(currentDate, 1));
          }
          const levelToday =
            lastValue -
              netWorthOverTime[
                formatDate(endOfMonth(subMonths(new Date(), 1)))
              ] || 0;
          const difference = differenceInFuture({
            netWorthOverTimeToFuture,
            financialGoal
          });
          return (
            <View
              style={twoMainItemsScreen.container({
                financialGoal,
                difference,
                orientation
              })}
            >
              {this.renderTable({
                levelToday,
                canSpendOrNeedToSaveAmount,
                stableIncome,
                projectedSavingForThisMonth,
                lastOneMonthGrowthRate,
                longTermGrowthRate,
                monthlyAverageSpending,
                netWorthOverTimeToFuture,
                importantDates
              })}
              {this.renderChart({
                monthlyAverageSpending,
                netWorthOverTimeToFuture,
                orientation
              })}
            </View>
          );
        }}
      </GlobalContext.Consumer>
    );
  }
}

const styles = StyleSheet.create({
  coverPanel: (({ isLeft }) => ({
    position: "absolute",
    ...(!isLeft ? { right: 0 } : {}),
    width: "3.125%",
    height: "100%",
    zIndex: 999,
    backgroundColor: appBackground
  })) as any
});
