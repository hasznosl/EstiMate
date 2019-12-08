import { IDateValueMapType, IFinancialGoalType } from "./types";
import formatDate from "./formatDate";
import { differenceInDays } from "date-fns";

interface IGetExpectedOutcomeForTwoDatesParamType {
  readonly netWorthOverTime: IDateValueMapType;
  readonly firstDate: Date;
  readonly lastDate: Date;
  readonly targetDate: Date;
}

const getExpectedOutcomeForTwoDates = ({
  netWorthOverTime,
  firstDate,
  lastDate,
  targetDate
}: IGetExpectedOutcomeForTwoDatesParamType) => {
  const increment =
    netWorthOverTime[formatDate(lastDate)] -
    netWorthOverTime[formatDate(firstDate)];
  const diffDays = differenceInDays(lastDate, firstDate);
  const dailyIncrement = diffDays !== 0 ? increment / diffDays : 0;
  const diffToGoalDays = differenceInDays(targetDate, lastDate);
  const totalIncrement = diffToGoalDays * dailyIncrement;

  return netWorthOverTime[formatDate(lastDate)] + totalIncrement;
};

export default getExpectedOutcomeForTwoDates;
