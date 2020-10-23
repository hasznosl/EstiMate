import { navbarStyles, lineColor } from '../styles';
import { View, TouchableOpacity, Text } from 'react-native';
import { Destinations } from '../utils/types';
import { Icon } from 'react-native-elements';
import { get, isEmpty } from 'lodash';
import React from 'react';

const NavBar = ({
	accounts,
	navigate,
	importantDates,
	netWorthOverTimeToFuture,
	monthlyAverageSpending,
	showNetWorthOverTimeChart
}) => (
	<View style={navbarStyles.container}>
		{showNetWorthOverTimeChart && (
			<TouchableOpacity
				style={navbarStyles.button}
				onPress={() => navigate(Destinations.TotalAveragePerDayOverTime)}
			>
				<Text>avg</Text>
				{/* <Icon
                    name="trending-up"
                    type="feather"
                    color={lineColor}
                    size={18}
                /> */}
			</TouchableOpacity>
		)}
		{get(importantDates, 'length') > 0 &&
		!isEmpty(netWorthOverTimeToFuture) && (
			<TouchableOpacity style={navbarStyles.button} onPress={() => navigate(Destinations.PeriodsAveragePerDay)}>
				<Text>avg per</Text>
				{/* <Icon
                        name="activity"
                        type="feather"
                        color={lineColor}
                        size={18}
                    /> */}
			</TouchableOpacity>
		)}
		{!isEmpty(monthlyAverageSpending) &&
		!isEmpty(netWorthOverTimeToFuture) && (
			<TouchableOpacity style={navbarStyles.button} onPress={() => navigate(Destinations.Monthly)}>
				<Text>mon</Text>
				{/* <Icon
                        name="calendar"
                        type="feather"
                        color={lineColor}
                        size={18}
                    /> */}
			</TouchableOpacity>
		)}
		{accounts.length > 0 && (
			<TouchableOpacity style={navbarStyles.button} onPress={() => navigate(Destinations.Accounts)}>
				<Text>acc</Text>
				{/* <Icon
                    name="database"
                    type="feather"
                    color={lineColor}
                    size={18}
                /> */}
			</TouchableOpacity>
		)}
		<TouchableOpacity style={navbarStyles.button} onPress={() => navigate(Destinations.Settings)}>
			<Text>set</Text>
			{/* <Icon
                name="sliders"
                type="feather"
                color={lineColor}
                size={18}
            /> */}
		</TouchableOpacity>
		<TouchableOpacity style={navbarStyles.button} onPress={() => navigate(Destinations.Nick)}>
			<Text>nick</Text>
			{/* <Icon
                name="sliders"
                type="feather"
                color={lineColor}
                size={18}
            /> */}
		</TouchableOpacity>
	</View>
);

export default NavBar;
