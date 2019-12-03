import React, { useContext } from "react";
import { View, Dimensions, Animated } from "react-native";
import { isSameDay, endOfMonth, startOfYear, getYear, isWithinRange } from "date-fns";
import { calculatePeriodsAveragePerDayOverTimeData } from "../utils";
import { GlobalContext } from "../Contexts";
import {
  chartContainer,
  generalStyles,
  lineColor,
  backgroundLineColor,
  yAxis,
  xAxis
} from "../styles";
import { INetWorthOverTimeType, IFinancialGoalType } from "../utils/types";
import { Svg, Path, Line, G, Text } from "react-native-svg";
import getRelevantDates from "../utils/getRelevantDates";
import formatDate from "../utils/formatDate";
import Axes from "../components/Axes";
import getScales from "../utils/getScales";
import getGraphLine from "../utils/getGraphLine";
import useZooming from "../../hooks/useZooming";
import { State, PinchGestureHandler } from "react-native-gesture-handler";

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
  const periodsAverageData = calculatePeriodsAveragePerDayOverTimeData({
    netWorthOverTimeToFuture,
    importantDates
  });
  const pinchScale = new Animated.Value(1)
  const { width, height } = Dimensions.get("window")
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
  const datesInternal = getRelevantDates({
    netWorthOverTimeToFuture,
    hasZoomed,
    zoomedDates
  });
  const data = Object.keys(periodsAverageData)
    .filter(date => isSameDay(date, endOfMonth(date)) &&
      (hasZoomed ?
        (isWithinRange(date, datesInternal[0], datesInternal[datesInternal.length - 1])) :
        true))
    .map(key => ({
      x: new Date(key),
      y: periodsAverageData[key]
    }));
  const svgHeight = height - 150
  const { scaleX, scaleY } = getScales({
    width,
    height: svgHeight,
    startDate: datesInternal[0],
    endDate: datesInternal[datesInternal.length - 1],
    data
  })
  const line = getGraphLine({ scaleX, scaleY, data })

  return (
    <PinchGestureHandler
      onGestureEvent={onPinchGestureEvent}
      onHandlerStateChange={onPinchHandlerStateChange}
    >
      <Animated.View style={generalStyles.container}>
        <View style={chartContainer}>
          <Svg {...{ width, height: svgHeight }}>
            <Axes height={svgHeight} width={width} />
            {[...importantDates, ...(financialGoal ? [new Date(financialGoal.date)] : [])].map(
              (importantDate, index) => {
                const x1 = index === 0 ? xAxis.outerMargin : scaleX(new Date(importantDates[index - 1]))
                const y1 = scaleY(periodsAverageData[formatDate(importantDate)])

                const x2 = scaleX(new Date(formatDate(importantDate)))
                const y2 = y1

                return (
                  <G key={importantDate.toString()}>
                    <Text x={yAxis.innerMargin + 1} fontSize="8" y={y2 - 1}>
                      {`${Math.floor(
                        periodsAverageData[formatDate(importantDate)] * 10000
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
                        y2={0}
                        stroke={backgroundLineColor}
                        strokeWidth={1}
                      />

                    </G>
                  );
              })}

          </Svg>
        </View>
      </Animated.View>
    </PinchGestureHandler>
  );
}


PeriodsAveragePerDay.navigationOptions = {
  title: "Average Per Day Over Periods"
};

export default PeriodsAveragePerDay