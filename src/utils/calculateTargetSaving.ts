import { ImportantDateType, IFinancialGoalType, NetWorthOverTimeType } from './types';
import { differenceInDays, endOfMonth, subMonths, isAfter } from 'date-fns';
import formatDate from './formatDate';

const calculateTargetSaving = (
	importantDates: ReadonlyArray<ImportantDateType>,
	financialGoal: IFinancialGoalType,
	netWorthOverTime: NetWorthOverTimeType
) => {
	const lastRegisteredDate =
		importantDates.length > 0
			? Object.keys(netWorthOverTime)
					.filter((registeredDate) => isAfter(registeredDate, importantDates[importantDates.length - 1]))
					.pop()
			: Object.keys(netWorthOverTime).pop();
	const endOfLastMonthForLastRegisteredDate = formatDate(endOfMonth(subMonths(lastRegisteredDate, 1)));

	return Math.ceil(
		(parseInt(financialGoal.netWorthValue) - netWorthOverTime[endOfLastMonthForLastRegisteredDate]) /
			differenceInDays(financialGoal.date, endOfLastMonthForLastRegisteredDate) *
			31
	);
};

export default calculateTargetSaving;
