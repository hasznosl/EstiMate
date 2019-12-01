import { INetWorthOverTimeType, IFinancialGoalType } from "./types";
import formatDate from "./formatDate";
import { differenceInDays } from "date-fns";

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
  const increment =
    netWorthOverTime[formatDate(lastDate)] -
    netWorthOverTime[formatDate(firstDate)];
  const diffDays = differenceInDays(lastDate, firstDate);
  const dailyIncrement = diffDays !== 0 ? increment / diffDays : 0;
  const diffToGoalDays = differenceInDays(financialGoal.date, lastDate);
  const totalIncrement = diffToGoalDays * dailyIncrement;

  return netWorthOverTime[formatDate(lastDate)] + totalIncrement;
};

export default getExpectedOutcomeForTwoDates;
