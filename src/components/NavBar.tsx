import { navbarStyles, lineColor } from "../styles";
import { View, TouchableOpacity } from "react-native";
import { Destinations } from "../utils/types";
import { Icon } from "react-native-elements";
import { get, isEmpty } from "lodash";
import React, { useEffect } from 'react'

const NavBar = ({
    accounts,
    navigate,
    importantDates,
    netWorthOverTimeToFuture,
    monthlyAverageSpending,
    showNetWorthOverTimeChart
}) => {

    // remove this, only debugging
    useEffect(() =>
        navigate(Destinations.PeriodsAveragePerDay), [])

    return <View style={navbarStyles.container}>
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
}

export default NavBar