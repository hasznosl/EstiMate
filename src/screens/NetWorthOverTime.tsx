import React, { useState, useContext } from "react";
import { View, Dimensions, Animated, ActivityIndicator } from "react-native";
import { Svg, Path, Line, Text, G } from "react-native-svg";
import { isSameDay, endOfMonth, startOfYear, getYear, subDays, addDays, isWithinRange } from "date-fns";
import { GlobalContext } from "../Contexts";
import {
  chartContainer,
  generalStyles,
  lineColor,
  backgroundLineColor
} from "../styles";
import { min, max } from "lodash";
import { Destinations, INetWorthOverTimeType } from "../utils/types";
import * as d3 from "d3";
import formatDate from "../utils/formatDate";
import { PinchGestureHandler, State } from 'react-native-gesture-handler'
import NavBar from "../components/NavBar";
import zoomingOut from "../utils/zoomingOut";
import getRelevantDates from "../utils/getRelevantDates";
import getStartAndEndDates from "../utils/getStartAndEndDates";

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
}

const NetWorthOverTime = ({
  navigation: { navigate }
}: IProps) => {
  // state 
  const [hasZoomed, setHasZoomed] = useState(false)
  const [zoomedDates, setZoomedDates] = useState([])
  // global context --> refactor: can separate the context to different pieces now, because
  //  with useContext won't have 10000 level of calling FAC depth
  const {
    accounts,
    birthDay,
    importantDates,
    monthlyAverageSpending,
    netWorthOverTimeToFuture,
  } = useContext(GlobalContext) as IContextType


  const { width, height } = Dimensions.get("window")
  const showNetWorthOverTimeChart = getRelevantDates({ netWorthOverTimeToFuture, hasZoomed, zoomedDates }).length > 0
  const pinchScale = new Animated.Value(1)

  const onPinchGestureEvent = Animated.event(
    [{ nativeEvent: { scale: pinchScale } }],
    { useNativeDriver: true }
  )


  const onPinchHandlerStateChange = (netWorthOverTimeToFuture) => (event) => {
    const { oldState, scale } = event.nativeEvent
    if (oldState === State.ACTIVE || oldState === State.BEGAN) {
      pinchScale.setValue(1);
      const { startDate, endDate } = getStartAndEndDates({
        scale,
        focalX: event.nativeEvent.focalX,
        width,
        netWorthOverTimeToFuture,
        hasZoomed,
        zoomedDates
      })
      console.log(new Date(startDate))
      setZoomedDates(
        getRelevantDates({ netWorthOverTimeToFuture, hasZoomed, zoomedDates }).filter(date => isWithinRange(date, new Date(startDate), new Date(endDate)))
      )
      setHasZoomed(!zoomingOut({ scale }))
    }
  }

  const renderChart = ({ netWorthOverTimeToFuture, birthDay }) => {
    const datesInternal = getRelevantDates({ netWorthOverTimeToFuture, hasZoomed, zoomedDates });
    const startDate = datesInternal[0]
    const endDate = datesInternal[datesInternal.length - 1]
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
      .curve(d3.curveLinear)(data);

    return (
      <Animated.View style={chartContainer} collapsable={false}>
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
          {/* X labels on the top */}
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
                      y2={yCoord}
                      stroke={backgroundLineColor}
                      strokeWidth={1}
                    />
                    {/* horizontal line labels */}
                    <Text x={y.innerMargin + 1} fontSize="8" y={yCoord - 1}>
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
            onHandlerStateChange={onPinchHandlerStateChange(netWorthOverTimeToFuture)}
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
