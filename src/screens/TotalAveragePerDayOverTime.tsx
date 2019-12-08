import React, { useContext } from "react";
import { View, Animated, Dimensions } from "react-native";
import { isSameDay, endOfMonth, startOfYear, getYear, isLastDayOfMonth } from "date-fns";
import { GlobalContext } from "../Contexts";
import { calculateTotalAveragePerDayOverTimeData } from "../utils";
import {
  chartContainer,
  generalStyles,
  yAxis,
  backgroundLineColor,
  lineColor,
} from "../styles";
import { IDateValueMapType } from "../utils/types";
import { State, PinchGestureHandler } from "react-native-gesture-handler";
import useZooming from "../../hooks/useZooming";
import getRelevantDates from "../utils/getRelevantDates";
import getScales from "../utils/getScales";
import getGraphLine from "../utils/getGraphLine";
import Svg, { G, Line, Text, Path } from "react-native-svg";
import Axes from "../components/Axes";
import formatDate from "../utils/formatDate";

interface IContextType {
  readonly birthDay: Date
  readonly netWorthOverTimeToFuture: IDateValueMapType
}

const TotalAveragePerDayOverTime = () => {

  // todo: separate different contexts
  const { netWorthOverTimeToFuture, birthDay } = useContext(GlobalContext) as IContextType

  const { width, height } = Dimensions.get("window")
  const {
    hasZoomed,
    zoomedDates,
    onPinchHandlerStateChange,
    onPinchGestureEvent
  } = useZooming({
    dateValueMap: netWorthOverTimeToFuture,
    State,
    width
  })
  const relevantDates = getRelevantDates({
    dateValueMap: netWorthOverTimeToFuture,
    hasZoomed,
    zoomedDates
  });

  const dateValueMap = calculateTotalAveragePerDayOverTimeData({
    netWorthOverTimeToFuture
  });
  const xyData = relevantDates
    .filter(isLastDayOfMonth)
    .map(date => ({
      x: new Date(date),
      y: dateValueMap[date]
    }));
  const svgHeight = height - 150
  const { scaleX, scaleY } = getScales({
    width,
    height: svgHeight,
    xyData
  })
  const line = getGraphLine({
    scaleX,
    scaleY,
    xyData
  })
  return (
    <PinchGestureHandler
      onGestureEvent={onPinchGestureEvent}
      onHandlerStateChange={onPinchHandlerStateChange}
    >
      <Animated.View style={generalStyles.container}>
        <View style={chartContainer}>
          <Svg {...{ width, height: svgHeight }}>
            <Axes height={svgHeight} width={width} />
            {/* the graph */}
            <Path
              d={line}
              fill="transparent"
              stroke={lineColor}
              strokeWidth={2}
            />
            {xyData
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
                const yCoord = scaleY(dateValueMap[formatDate(dat)]);
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
                        {Math.floor(
                          dateValueMap[formatDate(dat)] * 10
                        ) / 10}
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

          </Svg>
        </View>

      </Animated.View>
    </PinchGestureHandler>
  );
}

export default TotalAveragePerDayOverTime

TotalAveragePerDayOverTime.navigationOptions = {
  title: "Total Average Per Day Over Time"
};