import formatDate from './formatDate';
import { startOfMonth, addMonths, subMonths, endOfMonth, isAfter, isBefore, subDays, addDays, getDate } from 'date-fns';
import { ImportantDateType, NetWorthOverTimeType } from './types';

export const calculateMonthlyAverageSpending = ({
	importantDates,
	netWorthOverTime,
	rightNow
}: {
	importantDates: ImportantDateType[];
	netWorthOverTime: NetWorthOverTimeType;
	rightNow: Date;
}) => {
	const firstDateToCount = importantDates[importantDates.length - 1] || Object.keys(netWorthOverTime)[0] || rightNow;
	const dayOne = formatDate(startOfMonth(addMonths(firstDateToCount, 1)));
	const lastDay = formatDate(endOfMonth(subMonths(rightNow, 1)));
	if (isBefore(lastDay, dayOne) || isAfter(dayOne, rightNow)) {
		return {};
	}
	let currentDay = dayOne;
	let worthChangeForEveryMonths = {};
	let latestNumericValue: number =
		netWorthOverTime[dayOne] ||
		netWorthOverTime[Object.keys(netWorthOverTime).filter((date) => isBefore(date, dayOne)).pop()] ||
		0;
	while (!isAfter(currentDay, lastDay)) {
		const firstDayOfMonth = formatDate(startOfMonth(currentDay));
		const worthEndOfLastMonth = netWorthOverTime[formatDate(subDays(firstDayOfMonth, 1))] || latestNumericValue;
		while (!isAfter(currentDay, formatDate(endOfMonth(firstDayOfMonth)))) {
			const worthCurrentDay = netWorthOverTime[formatDate(currentDay)] || latestNumericValue;
			const spendingUntil = worthCurrentDay - worthEndOfLastMonth;
			latestNumericValue = netWorthOverTime[formatDate(currentDay)] || latestNumericValue;
			worthChangeForEveryMonths[currentDay] = spendingUntil;
			currentDay = formatDate(addDays(currentDay, 1));
		}
	}

	let averageWorthChangeForEachDay = {};
	for (let i = 1; i < 32; i++) {
		const dates = Object.keys(worthChangeForEveryMonths).filter((date) => getDate(date) === i);
		const avg = dates.reduce((total, date, index, array) => {
			total += parseInt(worthChangeForEveryMonths[date]);
			if (index === array.length - 1) {
				return Math.floor(total / array.length);
			} else {
				return total;
			}
		}, 0);
		averageWorthChangeForEachDay[i] = avg;
	}
	return averageWorthChangeForEachDay;
};

export default calculateMonthlyAverageSpending;
