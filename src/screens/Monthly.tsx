import React, { useContext } from "react";
import { View, StyleSheet, Animated, Dimensions } from "react-native";
import { GlobalContext } from "../Contexts";
import {
  startOfMonth,
  isAfter,
  addMonths,
  subMonths,
  endOfMonth,
  isBefore,
  getDate,
  getDay,
} from "date-fns";
import {
  appBackground,
  lineColor,
  chartContainer,
  yAxis,
  backgroundLineColor,
  generalStyles
} from "../styles";
import { INetWorthOverTimeType } from "../utils/types";
import formatDate from "../utils/formatDate";
import getRelevantDates from "../utils/getRelevantDates";
import useZooming from "../../hooks/useZooming";
import { State, PinchGestureHandler } from "react-native-gesture-handler";
import Svg, { Path, G, Text, Line } from "react-native-svg";
import Axes from "../components/Axes";
import getScales from "../utils/getScales";
import getGraphLine from "../utils/getGraphLine";

interface IContextType {
  readonly netWorthOverTimeToFuture: INetWorthOverTimeType
}

const Monthly = () => {
  const {
    netWorthOverTimeToFuture,
  } = useContext(GlobalContext) as IContextType
  const { width, height } = Dimensions.get("window")
  const svgHeight = height - 150;
  const localNetWorthData = Object.keys(netWorthOverTimeToFuture)
    .filter(
      key =>
        isBefore(key, startOfMonth(addMonths(new Date(), 1))) &&
        isAfter(key, endOfMonth(subMonths(new Date(), 1)))
    )
    .reduce((acc, key) => ({
      ...acc,
      [formatDate(key)]:
        netWorthOverTimeToFuture[formatDate(key)] -
        netWorthOverTimeToFuture[formatDate(endOfMonth(subMonths(key, 1)))]
    }), {})
  const {
    hasZoomed,
    zoomedDates,
    onPinchHandlerStateChange,
    onPinchGestureEvent
  } = useZooming({
    netWorthData: localNetWorthData,
    State,
    width
  })

  const renderChart = ({
    netWorthOverTimeToFuture,
  }) => {

    const datesInternal = getRelevantDates({
      netWorthData: localNetWorthData, hasZoomed, zoomedDates
    });
    const data = datesInternal
      .map(key => ({
        x: new Date(key),
        y: netWorthOverTimeToFuture[formatDate(key)] -
          netWorthOverTimeToFuture[formatDate(endOfMonth(subMonths(key, 1)))]
      }));
    const { scaleX, scaleY } = getScales({
      width,
      height: svgHeight,
      startDate: datesInternal[0],
      endDate: datesInternal[datesInternal.length - 1],
      data
    })
    const line = getGraphLine({ scaleX, scaleY, data });

    return (
      <Animated.View style={generalStyles.container}>
        <View style={chartContainer}>
          <Svg {...{ width, height: svgHeight }}>
            <Axes height={svgHeight} width={width} />
            {/* X labels*/}
            {data.filter(dat => getDay(dat.x) === 0)
              .map(dat => {
                const yCoord = scaleY((dat.y));
                const xCoord = scaleX(dat.x);

                return xCoord < 10 ?
                  null :
                  (
                    <G key={dat.x.toString()}>
                      {/* dates on the top */}
                      <Text x={xCoord} fontSize="8" y={svgHeight}>
                        {`${getDate(dat.x)}`}
                      </Text>

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
                          dat.y
                        )}`}
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
        </View>
      </Animated.View>
    );
  };

  return (

    <PinchGestureHandler
      onGestureEvent={onPinchGestureEvent}
      onHandlerStateChange={onPinchHandlerStateChange}
    >
      {renderChart({
        netWorthOverTimeToFuture,
      })}
    </PinchGestureHandler>
  );
}



export default Monthly


Monthly.navigationOptions = {
  title: "Monthly"
};

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
