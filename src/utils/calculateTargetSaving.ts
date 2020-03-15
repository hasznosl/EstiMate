import { ImportantDateType, IFinancialGoalType, IDateValueMapType } from './types';
import { differenceInDays, endOfMonth, subMonths } from 'date-fns';
import formatDate from './formatDate';

const calculateTargetSaving = (
	importantDates: ReadonlyArray<ImportantDateType>,
	financialGoal: IFinancialGoalType,
	netWorthOverTime: IDateValueMapType
) => {
	const lastRegisteredDate = Object.keys(netWorthOverTime).pop();
	const endOfLastMonthForLastRegisteredDate = formatDate(endOfMonth(subMonths(lastRegisteredDate, 1)));

	return Math.ceil(
		(parseInt(financialGoal.netWorthValue) - netWorthOverTime[endOfLastMonthForLastRegisteredDate]) /
			differenceInDays(financialGoal.date, endOfLastMonthForLastRegisteredDate) *
			31
	);
};
export default calculateTargetSaving;
