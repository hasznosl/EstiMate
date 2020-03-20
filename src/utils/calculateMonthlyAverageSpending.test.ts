import calculateMonthlyAverageSpending from './calculateMonthlyAverageSpending';
import netWorthOverTimeFixture from '../testUtils/netWorthOverTimeFixture';
import importantDatesFixture from '../testUtils/importantDatesFixture';

describe('calculateMonthlyAverageSpending', () => {
	it('should give back correct values for each day of the month from 1 to 31', () => {
		const result = calculateMonthlyAverageSpending({
			importantDates: importantDatesFixture,
			netWorthOverTime: netWorthOverTimeFixture,
			rightNow: new Date('Oct 05 1988')
		});

		expect(JSON.stringify(result)).toBe(
			JSON.stringify({
				'1': 0,
				'2': 0,
				'3': 0,
				'4': 0,
				'5': 1,
				'6': -18,
				'7': -3,
				'8': 1,
				'9': 1,
				'10': 1,
				'11': 1,
				'12': 1,
				'13': 1,
				'14': 1,
				'15': 1,
				'16': 1,
				'17': 1,
				'18': 1,
				'19': 1,
				'20': 1,
				'21': 1,
				'22': 1,
				'23': 1,
				'24': 1,
				'25': 1,
				'26': 1,
				'27': 1,
				'28': 1,
				'29': 1,
				'30': 1,
				'31': 1
			})
		);
	});
});
