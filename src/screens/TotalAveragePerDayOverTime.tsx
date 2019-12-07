import React, { useContext } from "react";
import { View, Animated, Dimensions } from "react-native";
import { isSameDay, endOfMonth, startOfYear, getYear } from "date-fns";
import { GlobalContext } from "../Contexts";
import { calculateTotalAveragePerDayOverTimeData } from "../utils";
import {
  chartContainer,
  generalStyles,
  yAxis,
  backgroundLineColor,
  lineColor,
} from "../styles";
import { INetWorthOverTimeType } from "../utils/types";
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
  readonly netWorthOverTimeToFuture: INetWorthOverTimeType
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
    netWorthData: netWorthOverTimeToFuture,
    State,
    width
  })
  const datesInternal = getRelevantDates({
    netWorthData: netWorthOverTimeToFuture,
    hasZoomed,
    zoomedDates
  });

  const pastAndFuture = calculateTotalAveragePerDayOverTimeData({
    netWorthOverTimeToFuture
  });
  const data = Object.keys(pastAndFuture)
    .filter(date => isSameDay(date, endOfMonth(date)))
    .map(key => ({
      x: new Date(key),
      y: pastAndFuture[key]
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
            {/* the graph */}
            <Path
              d={line}
              fill="transparent"
              stroke={lineColor}
              strokeWidth={2}
            />
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
                          pastAndFuture[formatDate(dat)] * 10
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