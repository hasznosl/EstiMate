

import React, { useContext, useRef } from 'react';
import { View, Dimensions, Animated, ActivityIndicator, TouchableWithoutFeedback } from 'react-native';
import { Svg, Path, Line, Text, G, Rect } from 'react-native-svg';
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
import { axisBottom, axisLeft, max, scaleBand, scaleLinear, select, stack, stackOrderAscending, ticks } from 'd3';
import { line } from 'd3-shape'

interface IContextType {
	readonly accounts: ReadonlyArray<any>;
	readonly birthDay: Date;
	readonly importantDates: ReadonlyArray<Date>;
	readonly monthlyAverageSpending: object;
	readonly netWorthOverTimeToFuture: NetWorthOverTimeType;
	readonly financialGoal: IFinancialGoalType;
	readonly n26Transactions: NetWorthOverTimeType;
}

const Settings = () => {



	const {
		accounts,
		birthDay,
		importantDates,
		monthlyAverageSpending,
		netWorthOverTimeToFuture,
		n26Transactions,
		financialGoal
	} = useContext(GlobalContext) as IContextType;
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





		const keys = ["total"]
		const data = [
			{
				year: 1999,
				total: 1000
			},
			{
				year: 2000,
				total: 2000
			},
			{
				year: 2001,
				total: 3000
			}
		]

		const colors = {
			total: "green"
		}
		const screen = Dimensions.get('window')
		const margin = { top: 50, right: 25, bottom: 200, left: 25 }
		const width = 300
		const height = 600
		console.log('at the beginning to render', width, height, screen.width, screen.height)

		const x = scaleBand()
			.rangeRound([0, width])
			.padding(0.1)
			.domain(data.map(d => d.year.toString()))
		const maxFrequency = max(data, d => d.total.toString())
		const y = scaleLinear()
			.rangeRound([height, 0])
			.domain([0, parseFloat(maxFrequency)])

		const firstLetterX = x(data[0].year.toString())
		const secondLetterX = x(data[1].year.toString())
		const lastLetterX = x(data[data.length - 1].year.toString())
		const labelDx = (secondLetterX - firstLetterX) / 2

		const bottomAxis = [firstLetterX - labelDx, lastLetterX + labelDx]
		const bottomAxisD = line()
			.x((d: any) => d + labelDx)
			.y(() => 0)
			(bottomAxis as any)

		const leftAxis = ticks(0, parseFloat(maxFrequency), 5)
		const leftAxisD = line()
			.x(() => bottomAxis[0] + labelDx)
			.y((d: any) => y(d) - height)
			(leftAxis as any)

		const notch = 5
		const labelDistance = 20

		const svg = (
			<Svg width={360} height={604}>
				<G translate={margin.left + "," + margin.top}>
					<G translate={"0," + height}>
						<G key={-1}>
							<Path stroke={"black"} d={bottomAxisD} key="-1" />
							{
								data.map((d, i) => (!console.log('num', i) &&
									< G key={i + 1} translate={x(d.year.toString()) + labelDx + ",0"}>
										<Line stroke={"black"} y2={notch} />
										<Text fill={"black"} y={labelDistance}>{d.year.toString()}</Text>
									</G>
								))
							}
						</G>
						<G key={-2}>
							<Path stroke={"black"} d={leftAxisD} key="-1" />
							{
								leftAxis.map((d, i) => (
									<G key={i + 1} translate={"0," + (y(d) - height)}>
										<Line stroke={"black"} x1={notch} x2={labelDistance} />
										<Text fill={"black"} x={-labelDistance} y={-notch}>{d}</Text>
									</G>
								))
							}
						</G>
						{
							data.map((d, i) => (
								!console.log('num', d, height - y(d.total)) &&
								//<TouchableWithoutFeedback key={i} onPress={() => this.toggleHighlight(i)}>
								<Rect x={x(d.year.toString())}
									y={10}
									width={x.bandwidth()}
									height={height - y(d.total)}
									fill={"green"}>
								</Rect>
								//</TouchableWithoutFeedback>
							))
						}
					</G>
				</G>
			</Svg >
		)

		return svg;
	};

	return (
		<View style={generalStyles.container}>
			{showNetWorthOverTimeChart ? (
				renderChart({ netWorthOverTimeToFuture, birthDay })
			) : (
					<View style={chartContainer}>
						<ActivityIndicator size="large" color={lineColor} />
					</View>
				)}

		</View>
	);


};

Settings.navigationOptions = {
	title: 'Nick',
};

export default Settings;

// /*

// 				<Svg {...{ width, height: svgHeight }}>
// 					<Axes height={svgHeight} width={width} />
// 					{/* X labels*/}
// 					{xyData
// 						.reduce((acc, dat) => {
// 							if (acc.find((accDate) => isSameDay(endOfMonth(startOfYear(dat.x)), accDate))) {
// 								return acc;
// 							} else {
// 								return [ ...acc, endOfMonth(startOfYear(dat.x)) ];
// 							}
// 						}, [])
// 						.map((date) => {
// 							const yCoord = scaleY(netWorthOverTimeToFuture[formatDate(date)]);
// 							const xCoord = scaleX(date);

// 							return xCoord < 10 ? null : (
// 								<G key={date.toString()}>
// 									{/* dates on the top */}
// 									<Text x={xCoord} fontSize="8" y={yAxis.outerMargin}>
// 										{`${getYear(date)}`}
// 									</Text>
// 									{/* years of age on bottom */}
// 									{birthDay && (
// 										<Text x={xCoord} fontSize="8" y={svgHeight}>
// 											{`${getYear(date) - getYear(birthDay)}`}
// 										</Text>
// 									)}
// 									{/* vertical lines */}
// 									<Line
// 										x1={xCoord}
// 										y1={svgHeight}
// 										x2={xCoord}
// 										y2={yCoord}
// 										stroke={backgroundLineColor}
// 										strokeWidth={1}
// 									/>
// 									{/* horizontal line labels */}
// 									<Text x={yAxis.innerMargin + 1} fontSize="8" y={yCoord - 1}>
// 										{`${Math.floor(netWorthOverTimeToFuture[formatDate(date)] / 1000)} k`}
// 									</Text>
// 									{/* horizontal lines */}
// 									<Line
// 										x1={0}
// 										y1={yCoord}
// 										x2={xCoord}
// 										y2={yCoord}
// 										stroke={backgroundLineColor}
// 										strokeWidth={1}
// 									/>
// 								</G>
// 							);
// 						})}

// 					{/* the graph */}
// 					<Path d={line} fill="transparent" stroke={lineColor} strokeWidth={2} />
// 				</Svg>