import financialGoalFixture from '../testUtils/financialGoalFixture';
import importantDatesFixture from '../testUtils/importantDatesFixture';
import netWorthOverTimeFixture from '../testUtils/netWorthOverTimeFixture';
import calculateTargetSaving from './calculateTargetSaving';

it('should caclculate how much money to save on the last registered month', () => {
	const toSave = calculateTargetSaving(importantDatesFixture, financialGoalFixture, netWorthOverTimeFixture);

	expect(toSave).toBe(41);
});
