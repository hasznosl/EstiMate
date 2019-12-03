import React, { useContext } from "react";
import { View, Dimensions } from "react-native";
import { isSameDay, endOfMonth, startOfYear, getYear } from "date-fns";
import { calculatePeriodsAveragePerDayOverTimeData } from "../utils";
import { GlobalContext } from "../Contexts";
import {
  chartContainer,
  generalStyles,
  lineColor,
  backgroundLineColor
} from "../styles";
import { INetWorthOverTimeType, IFinancialGoalType } from "../utils/types";
import { Svg, Path, Line, G, Text } from "react-native-svg";
import * as d3 from "d3";
import { min, max } from "lodash";
import getRelevantDates from "../utils/getRelevantDates";
import formatDate from "../utils/formatDate";

interface IContextType {
  readonly birthDay: Date
  readonly importantDates: ReadonlyArray<Date>
  readonly netWorthOverTimeToFuture: INetWorthOverTimeType
  readonly financialGoal: IFinancialGoalType
}

const PeriodsAveragePerDay = () => {

  const {
    birthDay,
    importantDates,
    netWorthOverTimeToFuture,
    financialGoal
  } = useContext(GlobalContext) as IContextType
  const pastAndFuture = calculatePeriodsAveragePerDayOverTimeData({
    netWorthOverTimeToFuture,
    importantDates
  });
  const data = Object.keys(pastAndFuture)
    .filter(date => isSameDay(date, endOfMonth(date)))
    .map(key => ({
      x: new Date(key),
      y: pastAndFuture[key]
    }));
  const datesInternal = getRelevantDates({ netWorthOverTimeToFuture, hasZoomed: false, zoomedDates: [] });
  const startDate = datesInternal[0]
  const endDate = datesInternal[datesInternal.length - 1]
  const { width, height } = Dimensions.get("window")
  const svgHeight = height - 150
  const x = { outerMargin: 10 };
  const y = { outerMargin: 10, innerMargin: 10 };
  const scaleX = d3
    .scaleTime()
    .domain([new Date(startDate), new Date(endDate)])
    .range([y.outerMargin, width - (y.innerMargin + y.outerMargin)]);
  const scaleY = d3
    .scaleLinear()
    .domain([min(data.map(dat => dat.y)), max(data.map(dat => dat.y))])
    .range([svgHeight - x.outerMargin, 0]);
  const line = d3
    .line()
    .x(d => scaleX(d.x))
    .y(d => scaleY(d.y))
    .curve(d3.curveBasis)(data);

  return (
    <View style={generalStyles.container}>
      <View style={chartContainer}>
        <Svg {...{ width, height: svgHeight }}>
          {/* X axis */}
          <Line
            x1={0}
            y1={svgHeight - x.outerMargin}
            x2={width}
            y2={svgHeight - x.outerMargin}
            stroke={lineColor}
            strokeWidth={1}
          />
          {/* Y Axis */}
          <Line
            x1={y.outerMargin}
            y1={svgHeight}
            x2={y.outerMargin}
            y2={0}
            stroke={lineColor}
            strokeWidth={1}
          />
          {[...importantDates, ...(financialGoal ? [new Date(financialGoal.date)] : [])].map(
            (importantDate, index) => {
              const x1 = index === 0 ? x.outerMargin : scaleX(new Date(importantDates[index - 1]))
              const y1 = scaleY(pastAndFuture[formatDate(importantDate)])

              const x2 = scaleX(new Date(formatDate(importantDate)))
              const y2 = y1

              return (
                <G key={importantDate.toString()}>
                  <Text x={y.innerMargin + 1} fontSize="8" y={y2 - 1}>
                    {`${Math.floor(
                      pastAndFuture[formatDate(importantDate)] * 10000
                    ) / 10000} k`}
                  </Text>
                  {/* horizontal lines */}
                  <Line
                    x1={0}
                    y1={y2}
                    x2={x2}
                    y2={y2}
                    stroke={backgroundLineColor}
                    strokeWidth={1}
                  />
                  {/* red lines */}
                  <Line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={'red'}
                    strokeWidth={2}
                  />
                  {/* horizontal line labels */}

                </G>
              )
            }
          )}

          {/* The graph */}
          <Path
            d={line}
            fill="transparent"
            stroke={lineColor}
            strokeWidth={2}
          />
          {/* X labels*/}
          {data
            .reduce((acc, dat) => {
              if (
                acc.find(accDate =>
                  isSameDay(endOfMonth(startOfYear(dat.x)), accDate)
                )
              ) {
                return acc;
              } else {
                return [...acc, endOfMonth(startOfYear(dat.x))];
              }
            }, [])
            .map(dat => {
              const yCoord = scaleY(pastAndFuture[formatDate(dat)]);
              const xCoord = scaleX(dat);

              return xCoord < 10 ?
                null :
                (
                  <G key={dat.toString()}>
                    {/* dates on the top */}
                    <Text x={xCoord} fontSize="8" y={y.outerMargin}>
                      {`${getYear(dat)}`}
                    </Text>
                    {/* years of age on bottom */}
                    {birthDay && (
                      <Text x={xCoord} fontSize="8" y={svgHeight}>
                        {`${getYear(dat) - getYear(birthDay)}`}
                      </Text>
                    )}
                    {/* vertical lines */}
                    <Line
                      x1={xCoord}
                      y1={svgHeight}
                      x2={xCoord}
                      y2={0}
                      stroke={backgroundLineColor}
                      strokeWidth={1}
                    />

                  </G>
                );
            })}

        </Svg>
      </View>
    </View>
  );
}


PeriodsAveragePerDay.navigationOptions = {
  title: "Average Per Day Over Periods"
};

export default PeriodsAveragePerDay