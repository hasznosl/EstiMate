import { differenceInDays, endOfMonth, subMonths } from 'date-fns';
import financialGoalFixture from '../testUtils/financialGoalFixture';
import importantDatesFixture from '../testUtils/importantDatesFixture';
import netWorthOverTimeFixture from '../testUtils/netWorthOverTimeFixture';
import calculateTargetSaving from './calculateTargetSaving';
import formatDate from './formatDate';

it('should caclculate how much money to save this month to reach target', () => {
	const toSave = calculateTargetSaving(importantDatesFixture, financialGoalFixture, netWorthOverTimeFixture);

	expect(toSave).toBe(50);
});
