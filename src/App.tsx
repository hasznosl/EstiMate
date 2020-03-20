import { createStackNavigator } from 'react-navigation';
import {
	NetWorthOverTime,
	PeriodsAveragePerDay,
	TotalAveragePerDayOverTime,
	Settings,
	Monthly,
	Accounts
} from './screens';
import React from 'react';
import { GlobalProvider } from './Contexts';

const App = createStackNavigator({
	NetWorthOverTime: { screen: NetWorthOverTime },
	PeriodsAveragePerDay: { screen: PeriodsAveragePerDay },
	TotalAveragePerDayOverTime: { screen: TotalAveragePerDayOverTime },
	Settings: { screen: Settings },
	Monthly: { screen: Monthly },
	Accounts: { screen: Accounts }
});

class Root extends React.Component {
	render() {
		return (
			<GlobalProvider>
				<App />
			</GlobalProvider>
		);
	}
}

export default Root;
