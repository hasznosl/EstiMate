import React, { Component } from "react";
import { Text, View, TouchableOpacity, Dimensions, Animated } from "react-native";
import { Svg, Path, Line, Text as SvgText, G } from "react-native-svg";
import { isSameDay, endOfMonth, startOfYear, getYear, subDays, addDays, isWithinRange } from "date-fns";
import { GlobalContext } from "../Contexts";
import {
  chartContainer,
  generalStyles,
  navbarStyles,
  lineColor,
  backgroundLineColor
} from "../styles";
import { get, isEmpty, min, max } from "lodash";
import { IAppContext, Destinations } from "../utils/types";
import { Icon } from "react-native-elements";
import * as d3 from "d3";
import formatDate from "../utils/formatDate";
import { PinchGestureHandler, State } from 'react-native-gesture-handler'

interface IProps {
  navigation: {
    navigate: (destination: Destinations) => void;
  };
}

class NetWorthOverTime extends Component<IProps> {
  static navigationOptions = {
    title: "Net Worth Over Time"
  };

  state = { hasZoomed: false, lastScale: 1, dates: [], }

  getDatesBeforeZoomed = ({ netWorthOverTimeToFuture }) => Object.keys(netWorthOverTimeToFuture)

  renderChart = ({ netWorthOverTimeToFuture, birthDay }) => {
    const { hasZoomed, dates: datesState } = this.state
    const dates = hasZoomed ? datesState : this.getDatesBeforeZoomed({ netWorthOverTimeToFuture });
    const { height } = Dimensions.get("window");
    const width = this.getGraphWidth()
    const startDate = dates[0]
    const endDate = dates[dates.length - 1]
    const data = dates
      .filter(date => isSameDay(date, endOfMonth(date)))
      .filter(date => {
        if (hasZoomed) {
          const { dates } = this.state
          return (isWithinRange(date, dates[0], dates[dates.length - 1]))
        }
        return true
      })
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
              if (scaleX(dat) < 10) {
                return null;
              }
              const yCoord = scaleY(netWorthOverTimeToFuture[formatDate(dat)]);
              const xCoord = scaleX(dat);

              return (
                <G key={dat.toString()}>
                  {/* dates on the top */}
                  <SvgText x={xCoord} fontSize="8" y={y.outerMargin}>
                    {`${getYear(dat)}`}
                  </SvgText>
                  {/* years of age on bottom */}
                  {birthDay && (
                    <SvgText x={xCoord} fontSize="8" y={svgHeight}>
                      {`${getYear(dat) - getYear(birthDay)}`}
                    </SvgText>
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
                  {/* horizontal line labels */}
                  <SvgText x={y.innerMargin + 1} fontSize="8" y={yCoord - 1}>
                    {`${Math.floor(
                      netWorthOverTimeToFuture[formatDate(dat)] / 1000
                    )} k`}
                  </SvgText>
                  {/* horizontal lines */}
                  <Line
                    x1={0}
                    y1={yCoord}
                    x2={width}
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

  getGraphWidth = () => Dimensions.get("window").width

  baseScale = new Animated.Value(1);
  pinchScale = new Animated.Value(1)
  focalX = Math.ceil(this.getGraphWidth() / 2)

  onPinchGestureEvent = Animated.event(
    [{ nativeEvent: { scale: this.pinchScale } }],
    { useNativeDriver: true }
  )

  isZoomingOutMoreThanPossible = ({ newScaleEvent }) => (this.state.lastScale * newScaleEvent <= 1)
  isBetweenFilter = (startDate, endDate) => date => isWithinRange(date, new Date(startDate), new Date(endDate))

  onPinchHandlerStateChange = (netWorthOverTimeToFuture) => (event) => {
    const { oldState, scale, focalX } = event.nativeEvent
    if (oldState === State.ACTIVE || oldState === State.BEGAN) {
      const newScaleEvent = scale
      const { lastScale, hasZoomed, dates } = this.state
      const datesLength = hasZoomed ? dates.length : this.getDatesBeforeZoomed({ netWorthOverTimeToFuture }).length
      const newScale = this.isZoomingOutMoreThanPossible({ newScaleEvent }) ? 1 : lastScale * scale
      this.baseScale.setValue(lastScale);
      this.pinchScale.setValue(1);
      this.focalX = focalX

      const centralDateIndex = Math.ceil(event.nativeEvent.focalX / this.getGraphWidth() * datesLength)
      const centralDate = hasZoomed ? dates[centralDateIndex] : this.getDatesBeforeZoomed({ netWorthOverTimeToFuture })[centralDateIndex]
      const daysLeftAndRight = Math.ceil(datesLength / lastScale / 2)
      const startDate = subDays(centralDate, daysLeftAndRight)
      const endDate = addDays(centralDate, daysLeftAndRight)
      const zoomingIn = newScale <= lastScale
      this.setState((state: any) => ({
        dates: state.hasZoomed ?
          state.dates.filter(this.isBetweenFilter(startDate, endDate)) :
          this.getDatesBeforeZoomed({ netWorthOverTimeToFuture }).filter(this.isBetweenFilter(startDate, endDate)),
        lastScale: zoomingIn ? newScale : 1,
        hasZoomed: zoomingIn ? false : true
      }))

    }
  }


  render() {
    const { navigate } = this.props.navigation;


    return (
      <GlobalContext.Consumer>
        {({
          netWorthOverTimeToFuture,
          birthDay,
          monthlyAverageSpending,
          importantDates,
          accounts
        }: IAppContext) => {
          const { hasZoomed, dates } = this.state
          const showNetWorthOverTimeChart = hasZoomed ? dates.length > 0 : this.getDatesBeforeZoomed({ netWorthOverTimeToFuture }).length > 0

          return (
            <View style={generalStyles.container}>
              {showNetWorthOverTimeChart ? (
                <PinchGestureHandler
                  onGestureEvent={this.onPinchGestureEvent}
                  onHandlerStateChange={this.onPinchHandlerStateChange(netWorthOverTimeToFuture)}
                >
                  {this.renderChart({ netWorthOverTimeToFuture, birthDay })}
                </PinchGestureHandler>
              ) : (
                  <View style={chartContainer}>
                    <Text>No data to show</Text>
                  </View>
                )}
              <View style={navbarStyles.container}>
                <TouchableOpacity
                  style={navbarStyles.button}
                  onPress={() => navigate(Destinations.Possibilities)}
                >
                  <Icon
                    name="bar-chart-2"
                    type="feather"
                    color={lineColor}
                    size={18}
                  />
                </TouchableOpacity>
                {showNetWorthOverTimeChart && (
                  <TouchableOpacity
                    style={navbarStyles.button}
                    onPress={() =>
                      navigate(Destinations.TotalAveragePerDayOverTime)
                    }
                  >
                    <Icon
                      name="trending-up"
                      type="feather"
                      color={lineColor}
                      size={18}
                    />
                  </TouchableOpacity>
                )}
                {get(importantDates, "length") > 0 &&
                  !isEmpty(netWorthOverTimeToFuture) && (
                    <TouchableOpacity
                      style={navbarStyles.button}
                      onPress={() =>
                        navigate(Destinations.PeriodsAveragePerDay)
                      }
                    >
                      <Icon
                        name="activity"
                        type="feather"
                        color={lineColor}
                        size={18}
                      />
                    </TouchableOpacity>
                  )}
                {!isEmpty(monthlyAverageSpending) &&
                  !isEmpty(netWorthOverTimeToFuture) && (
                    <TouchableOpacity
                      style={navbarStyles.button}
                      onPress={() => navigate(Destinations.Monthly)}
                    >
                      <Icon
                        name="calendar"
                        type="feather"
                        color={lineColor}
                        size={18}
                      />
                    </TouchableOpacity>
                  )}
                {accounts.length > 0 && (
                  <TouchableOpacity
                    style={navbarStyles.button}
                    onPress={() => navigate(Destinations.Accounts)}
                  >
                    <Icon
                      name="database"
                      type="feather"
                      color={lineColor}
                      size={18}
                    />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={navbarStyles.button}
                  onPress={() => navigate(Destinations.Settings)}
                >
                  <Icon
                    name="sliders"
                    type="feather"
                    color={lineColor}
                    size={18}
                  />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      </GlobalContext.Consumer>
    );
  }
}

export default NetWorthOverTime;
