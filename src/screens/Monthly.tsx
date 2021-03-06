import React, { useContext } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { GlobalContext } from '../Contexts';
import { startOfMonth, isAfter, addMonths, subMonths, endOfMonth, isBefore, getDate, getDay } from 'date-fns';
import {
	appBackground,
	lineColor,
	chartContainer,
	yAxis,
	backgroundLineColor,
	generalStyles,
	averageLineColor
} from '../styles';
import formatDate from '../utils/formatDate';
import getRelevantDates from '../utils/getRelevantDates';
import useZooming from '../../hooks/useZooming';
import { State, PinchGestureHandler } from 'react-native-gesture-handler';
import Svg, { Path, G, Text, Line } from 'react-native-svg';
import Axes from '../components/Axes';
import getScales from '../utils/getScales';
import getGraphLine from '../utils/getGraphLine';
import { IContextType } from '../utils/types';

const Monthly = () => {
	const { netWorthOverTimeToFuture, monthlyAverageSpending, targetSaving }: IContextType = useContext(GlobalContext);
	const { width, height } = Dimensions.get('window');
	const svgHeight = height - 150;
	const dateValueMap = Object.keys(netWorthOverTimeToFuture)
		.filter(
			(key) =>
				isBefore(key, startOfMonth(addMonths(new Date(), 1))) &&
				isAfter(key, endOfMonth(subMonths(new Date(), 1)))
		)
		.reduce(
			(acc, key) => ({
				...acc,
				[formatDate(key)]:
					netWorthOverTimeToFuture[formatDate(key)] -
					netWorthOverTimeToFuture[formatDate(endOfMonth(subMonths(key, 1)))]
			}),
			{}
		);
	const { hasZoomed, zoomedDates, onPinchHandlerStateChange, onPinchGestureEvent } = useZooming({
		dateValueMap,
		State,
		width
	});

	const renderChart = ({ netWorthOverTimeToFuture }) => {
		const relevantDates = getRelevantDates({
			dateValueMap,
			hasZoomed,
			zoomedDates
		});
		const xyDataThisMonth = relevantDates.map((date: string) => ({
			x: new Date(date),
			y:
				netWorthOverTimeToFuture[formatDate(new Date(date))] -
				netWorthOverTimeToFuture[formatDate(endOfMonth(subMonths(new Date(date), 1)))]
		}));
		const xyDataLastMonth = relevantDates.map((date: string) => ({
			x: new Date(date),
			y:
				netWorthOverTimeToFuture[formatDate(subMonths(new Date(date), 1))] -
				netWorthOverTimeToFuture[formatDate(endOfMonth(subMonths(new Date(date), 2)))]
		}));
		const xyDataAverage = relevantDates.map((date: string, index: number) => ({
			x: new Date(date),
			y: monthlyAverageSpending[index + 1]
		}));
		const { scaleX, scaleY } = getScales({
			width,
			height: svgHeight,
			xyData: [ ...xyDataThisMonth, ...xyDataLastMonth, ...xyDataAverage ]
		});
		const lineForThisMonth = getGraphLine({
			scaleX,
			scaleY,
			xyData: xyDataThisMonth
		});
		const lineForLastMonth = getGraphLine({
			scaleX,
			scaleY,
			xyData: xyDataLastMonth
		});
		const lineForAverage = getGraphLine({
			scaleX,
			scaleY,
			xyData: xyDataAverage
		});

		const averageEndValue = xyDataAverage[xyDataAverage.length - 1].y;
		const averageStartValue = xyDataAverage[0].y;

		return (
			<Animated.View style={generalStyles.container}>
				<View style={chartContainer}>
					<Svg {...{ width, height: svgHeight }}>
						<Axes height={svgHeight} width={width} />
						{/* horizontal line for target */}
						<Line
							x1={0}
							y1={scaleY(targetSaving)}
							x2={scaleX(xyDataThisMonth[xyDataThisMonth.length - 1].x)}
							y2={scaleY(targetSaving)}
							stroke={backgroundLineColor}
							strokeWidth={1}
						/>
						{/* label for target horizontal line */}
						<Text x={yAxis.innerMargin + 1} fontSize="8" y={scaleY(averageEndValue)}>
							{averageEndValue}
						</Text>
						{/* horizontal line for average end result */}
						<Line
							x1={0}
							y1={scaleY(averageEndValue)}
							x2={scaleX(xyDataThisMonth[xyDataThisMonth.length - 1].x)}
							y2={scaleY(averageEndValue)}
							stroke={backgroundLineColor}
							strokeWidth={1}
						/>
						{/* label for  average end result */}
						<Text x={yAxis.innerMargin + 1} fontSize="8" y={scaleY(targetSaving)}>
							{`target: ${targetSaving}`}
						</Text>
						{/* horizontal line for average start */}
						<Line
							x1={0}
							y1={scaleY(averageStartValue)}
							x2={scaleX(xyDataThisMonth[xyDataThisMonth.length - 1].x)}
							y2={scaleY(averageStartValue)}
							stroke={backgroundLineColor}
							strokeWidth={1}
						/>
						{/* label for average start */}
						<Text x={yAxis.innerMargin + 1} fontSize="8" y={scaleY(averageStartValue)}>
							{averageStartValue}
						</Text>
						{/* X labels*/}
						{xyDataThisMonth.filter((dat) => getDay(dat.x) === 0).map((dat) => {
							const yCoord = scaleY(dat.y);
							const xCoord = scaleX(dat.x);

							return xCoord < 10 ? null : (
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
										{`${Math.floor(dat.y)}`}
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
						{/* the graph for this month*/}
						<Path d={lineForThisMonth} fill="transparent" stroke={lineColor} strokeWidth={2} />
						{/* the graph for last month*/}
						<Path d={lineForLastMonth} fill="transparent" stroke={lineColor} strokeWidth={1} />
						{/* graph for average */}
						<Path d={lineForAverage} fill="transparent" stroke={averageLineColor} strokeWidth={2} />
					</Svg>
				</View>
			</Animated.View>
		);
	};

	return (
		<PinchGestureHandler onGestureEvent={onPinchGestureEvent} onHandlerStateChange={onPinchHandlerStateChange}>
			{renderChart({
				netWorthOverTimeToFuture
			})}
		</PinchGestureHandler>
	);
};

export default Monthly;

Monthly.navigationOptions = {
	title: 'Monthly'
};

const styles = StyleSheet.create({
	coverPanel: (({ isLeft }) => ({
		position: 'absolute',
		...!isLeft ? { right: 0 } : {},
		width: '3.125%',
		height: '100%',
		zIndex: 999,
		backgroundColor: appBackground
	})) as any
});
