import { INetWorthOverTimeType, IFinancialGoalType } from "./types";
import formatDate from "./formatDate";
import { differenceInDays } from "date-fns";
import fixTimezone from "./fixTimezone";

interface IGetExpectedOutcomeForTwoDatesParamType {
  readonly netWorthOverTime: INetWorthOverTimeType;
  readonly firstDate: Date;
  readonly lastDate: Date;
  readonly financialGoal: IFinancialGoalType;
}

const getExpectedOutcomeForTwoDates = ({
  netWorthOverTime,
  firstDate,
  lastDate,
  financialGoal
}: IGetExpectedOutcomeForTwoDatesParamType) => {
  const fixedLastDay = fixTimezone(lastDate);
  const fixedFirstDay = fixTimezone(firstDate);
  const fixedTargetDate = fixTimezone(financialGoal.date);
  const increment =
    netWorthOverTime[formatDate(fixedLastDay)] -
    netWorthOverTime[formatDate(fixedFirstDay)];
  const diffDays = differenceInDays(fixedLastDay, fixedFirstDay);
  const dailyIncrement = diffDays !== 0 ? increment / diffDays : 0;
  const diffToGoalDays = differenceInDays(fixedTargetDate, fixedLastDay);
  const totalIncrement = diffToGoalDays * dailyIncrement;

  return netWorthOverTime[formatDate(fixedLastDay)] + totalIncrement;
};

export default getExpectedOutcomeForTwoDates;
