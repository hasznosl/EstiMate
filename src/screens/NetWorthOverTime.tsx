import React, { useState, useContext } from "react";
import { View, Dimensions, Animated, ActivityIndicator } from "react-native";
import { Svg, Path, Line, Text, G } from "react-native-svg";
import { isSameDay, endOfMonth, startOfYear, getYear, isWithinRange } from "date-fns";
import { GlobalContext } from "../Contexts";
import {
  chartContainer,
  generalStyles,
  lineColor,
  backgroundLineColor,
  yAxis,
  xAxis
} from "../styles";
import { Destinations, INetWorthOverTimeType, IFinancialGoalType } from "../utils/types";
import formatDate from "../utils/formatDate";
import { PinchGestureHandler, State } from 'react-native-gesture-handler'
import NavBar from "../components/NavBar";
import zoomingOut from "../utils/zoomingOut";
import getRelevantDates from "../utils/getRelevantDates";
import getStartAndEndDates from "../utils/getStartAndEndDates";
import Axes from "../components/Axes";
import getScales from "../utils/getScales";
import getGraphLine from "../utils/getGraphLine";
import useZooming from "../../hooks/useZooming";

interface IProps {
  navigation: {
    navigate: (destination: Destinations) => void;
  };
}

interface IContextType {
  readonly accounts: ReadonlyArray<any>
  readonly birthDay: Date
  readonly importantDates: ReadonlyArray<Date>
  readonly monthlyAverageSpending: object
  readonly netWorthOverTimeToFuture: INetWorthOverTimeType
  readonly financialGoal: IFinancialGoalType
}

const NetWorthOverTime = ({
  navigation: { navigate }
}: IProps) => {
  // global context --> refactor: can separate the context to different pieces now, because
  //  with useContext won't have 10000 level of calling FAC depth
  const {
    accounts,
    birthDay,
    importantDates,
    monthlyAverageSpending,
    netWorthOverTimeToFuture,
    financialGoal
  } = useContext(GlobalContext) as IContextType
  const { width, height } = Dimensions.get("window")
  const pinchScale = new Animated.Value(1)
  const {
    hasZoomed,
    zoomedDates,
    onPinchHandlerStateChange,
    onPinchGestureEvent
  } = useZooming({
    netWorthOverTimeToFuture,
    State,
    pinchScale,
    width
  })
  const showNetWorthOverTimeChart = getRelevantDates({
    netWorthOverTimeToFuture,
    hasZoomed,
    zoomedDates
  }).length > 0


  const renderChart = ({ netWorthOverTimeToFuture, birthDay }) => {
    const datesInternal = getRelevantDates({ netWorthOverTimeToFuture, hasZoomed, zoomedDates });
    const data = datesInternal
      .filter(date => (
        isSameDay(date, endOfMonth(date)) &&
        (hasZoomed ?
          (isWithinRange(date, datesInternal[0], datesInternal[datesInternal.length - 1])) :
          true)))
      .map(key => ({
        x: new Date(key),
        y: netWorthOverTimeToFuture[key]
      }));
    const svgHeight = height - 150;
    const { scaleX, scaleY } = getScales({
      width,
      height: svgHeight,
      startDate: datesInternal[0],
      endDate: datesInternal[datesInternal.length - 1],
      data
    })
    const line = getGraphLine({ scaleX, scaleY, data });

    return (
      <Animated.View style={chartContainer} collapsable={false}>
        <Svg {...{ width, height: svgHeight }}>
          <Axes height={svgHeight} width={width} />
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
              const yCoord = scaleY(netWorthOverTimeToFuture[formatDate(dat)]);
              const xCoord = scaleX(dat);

              return xCoord < 10 ?
                null :
                (
                  <G key={dat.toString()}>
                    {/* dates on the top */}
                    <Text x={xCoord} fontSize="8" y={yAxis.outerMargin}>
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
                      y2={yCoord}
                      stroke={backgroundLineColor}
                      strokeWidth={1}
                    />
                    {/* horizontal line labels */}
                    <Text x={yAxis.innerMargin + 1} fontSize="8" y={yCoord - 1}>
                      {`${Math.floor(
                        netWorthOverTimeToFuture[formatDate(dat)] / 1000
                      )} k`}
                    </Text>
                    {/* horizontal lines */}
                    <Line
                      x1={0}
                      y1={yCoord}
                      x2={xCoord}
                      y2={yCoord}
                      stroke={backgroundLineColor}
                      strokeWidth={1}
                    />
                  </G>
                );
            })}
          {/* averaging red lines */}
          {
            [...importantDates, ...(financialGoal ? [financialGoal.date] : [])].map(
              (importantDate, index) => {
                const dateImportantDate = new Date(importantDate)
                const xCoord = scaleX(dateImportantDate)
                const yCoord = scaleY(netWorthOverTimeToFuture[formatDate(dateImportantDate)])

                const x1 = index === 0 ? 0 + xAxis.outerMargin : scaleX(new Date(importantDates[index - 1]))
                const y1 = index === 0 ? svgHeight - yAxis.innerMargin : scaleY(netWorthOverTimeToFuture[formatDate(importantDates[index - 1])])

                return <G key={importantDate.toString()}>
                  <Line
                    x1={x1}
                    y1={y1}
                    x2={xCoord}
                    y2={yCoord}
                    stroke={'red'}
                    strokeWidth={2}
                  />
                </G>
              }
            )
          }
          {/* the graph */}
          <Path
            d={line}
            fill="transparent"
            stroke={lineColor}
            strokeWidth={2}
          />
        </Svg>
      </Animated.View>
    );
  };

  return (
    <View style={generalStyles.container}>
      {showNetWorthOverTimeChart ?
        (
          <PinchGestureHandler
            onGestureEvent={onPinchGestureEvent}
            onHandlerStateChange={onPinchHandlerStateChange}
          >
            {renderChart({ netWorthOverTimeToFuture, birthDay })}
          </PinchGestureHandler>
        ) :
        (
          <View style={chartContainer}>
            <ActivityIndicator size="large" color={lineColor} />
          </View>
        )}
      <NavBar
        accounts={accounts}
        navigate={navigate}
        importantDates={importantDates}
        netWorthOverTimeToFuture={netWorthOverTimeToFuture}
        monthlyAverageSpending={monthlyAverageSpending}
        showNetWorthOverTimeChart={showNetWorthOverTimeChart} />
    </View>

  );
}

NetWorthOverTime.navigationOptions = {
  title: "Net Worth Over Time"
};


export default NetWorthOverTime;
