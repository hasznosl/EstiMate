import React, { useContext } from 'react';
import { View, Dimensions, Animated, ActivityIndicator } from 'react-native';
import { Svg, Path, Line, Text, G } from 'react-native-svg';
import { isSameDay, endOfMonth, startOfYear, getYear, isWithinRange, isLastDayOfMonth } from 'date-fns';
import { GlobalContext } from '../Contexts';
import {
	chartContainer,
	generalStyles,
	lineColor,
	backgroundLineColor,
	yAxis,
	xAxis,
	averageLineColor
} from '../styles';
import { Destinations, NetWorthOverTimeType, IFinancialGoalType } from '../utils/types';
import formatDate from '../utils/formatDate';
import { PinchGestureHandler, State } from 'react-native-gesture-handler';
import NavBar from '../components/NavBar';
import getRelevantDates from '../utils/getRelevantDates';
import Axes from '../components/Axes';
import getScales from '../utils/getScales';
import getGraphLine from '../utils/getGraphLine';
import useZooming from '../../hooks/useZooming';
import * as myjson from  '../utils/bnk.json';

interface IProps {
	navigation: {
		navigate: (destination: Destinations) => void;
	};
}

interface IContextType {
	readonly accounts: ReadonlyArray<any>;
	readonly birthDay: Date;
	readonly importantDates: ReadonlyArray<Date>;
	readonly monthlyAverageSpending: object;
	readonly netWorthOverTimeToFuture: NetWorthOverTimeType;
	readonly financialGoal: IFinancialGoalType;
}

const NetWorthOverTime = ({ navigation: { navigate } }: IProps) => {
	// global context --> refactor: can separate the context to different pieces now, because
	//  with useContext won't have 10000 level of calling FAC depth
	const {
		accounts,
		birthDay,
		importantDates,
		monthlyAverageSpending,
		netWorthOverTimeToFuture,
		financialGoal
	} = useContext(GlobalContext) as IContextType;
	//console.log('accounts', accounts)
	const { width, height } = Dimensions.get('window');
	const dateValueMap = netWorthOverTimeToFuture;
	const { hasZoomed, zoomedDates, onPinchHandlerStateChange, onPinchGestureEvent } = useZooming({
		dateValueMap,
		State,
		width
	});
	const relevantDates = getRelevantDates({
		dateValueMap,
		hasZoomed,
		zoomedDates
	});
	const showNetWorthOverTimeChart = relevantDates.length > 0;

	const renderChart = ({ netWorthOverTimeToFuture, birthDay }) => {

		console.log('\n\n\n\n relevant dates', relevantDates.length, relevantDates, Object.keys(dateValueMap).length)

		const xyData = relevantDates.map((date: string) => ({
			x: new Date(date),
			y: isNaN(dateValueMap[date]) ? 0 : dateValueMap[date]
		}));

		/*
		let rollingBalance = 0.0;
		const xyData = myjson.rows.map(row =>
			
			{
				rollingBalance = rollingBalance + parseFloat(row.Amount)
				return {
					x: new Date(row.Date),
					y: rollingBalance
			}
			}
			
			)	;
*/
		//console.log('\n\n\n\nxtdata', xyData)

		const svgHeight = height - 150;
		const { scaleX, scaleY } = getScales({
			width,
			height: svgHeight,
			xyData
		});
		const line = getGraphLine({
			scaleX,
			scaleY,
			xyData
		});

		return (
			<Animated.View style={chartContainer} collapsable={false}>
				<Svg {...{ width, height: svgHeight }}>
					<Axes height={svgHeight} width={width} />
					{/* X labels*/}
					{xyData
						.reduce((acc, dat) => {
							if (acc.find((accDate) => isSameDay(endOfMonth(startOfYear(dat.x)), accDate))) {
								return acc;
							} else {
								return [ ...acc, endOfMonth(startOfYear(dat.x)) ];
							}
						}, [])
						.map((date) => {
							const yCoord = scaleY(netWorthOverTimeToFuture[formatDate(date)]);
							const xCoord = scaleX(date);

							return xCoord < 10 ? null : (
								<G key={date.toString()}>
									{/* dates on the top */}
									<Text x={xCoord} fontSize="8" y={yAxis.outerMargin}>
										{`${getYear(date)}`}
									</Text>
									{/* years of age on bottom */}
									{birthDay && (
										<Text x={xCoord} fontSize="8" y={svgHeight}>
											{`${getYear(date) - getYear(birthDay)}`}
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
										{`${Math.floor(netWorthOverTimeToFuture[formatDate(date)] / 1000)} k`}
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
					{[
						...importantDates,
						...(financialGoal ? [ financialGoal.date ] : [])
					].map((importantDate, index) => {
						const dateImportantDate = new Date(importantDate);
						const xCoord = scaleX(dateImportantDate);
						const yCoord = scaleY(netWorthOverTimeToFuture[formatDate(dateImportantDate)]);

						const x1 = index === 0 ? 0 + xAxis.outerMargin : scaleX(new Date(importantDates[index - 1]));
						const y1 =
							index === 0
								? svgHeight - yAxis.innerMargin
								: scaleY(netWorthOverTimeToFuture[formatDate(importantDates[index - 1])]);

						return (
							<G key={importantDate.toString()}>
								<Line
									x1={x1}
									y1={y1}
									x2={xCoord}
									y2={yCoord}
									stroke={averageLineColor}
									strokeWidth={2}
								/>
							</G>
						);
					})}
					{/* the graph */}
					<Path d={line} fill="transparent" stroke={lineColor} strokeWidth={2} />
				</Svg>
			</Animated.View>
		);
	};

	return (
		<View style={generalStyles.container}>
			{showNetWorthOverTimeChart ? (
				<PinchGestureHandler
					onGestureEvent={onPinchGestureEvent}
					onHandlerStateChange={onPinchHandlerStateChange}
				>
					{renderChart({ netWorthOverTimeToFuture, birthDay })}
				</PinchGestureHandler>
			) : (
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
				showNetWorthOverTimeChart={showNetWorthOverTimeChart}
			/>
		</View>
	);
};

NetWorthOverTime.navigationOptions = {
	title: 'Net Worth Over Time'
};

export default NetWorthOverTime;
