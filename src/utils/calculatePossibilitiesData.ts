import { INetWorthOverTimeType, IFinancialGoalType } from "./types";
import {
  addDays,
  isBefore,
  subDays,
  differenceInDays,
  isAfter
} from "date-fns";
import getExpectedOutcomeForTwoDates from "./getExpectedOutcomeForTwoDates";

interface ICalculatePossibilitiesDataParamType {
  readonly netWorthOverTime: INetWorthOverTimeType;
  readonly firstStepLevel: number;
  readonly bucketWidth: number;
  readonly bucketsNumber: number;
  readonly financialGoal: IFinancialGoalType;
  readonly importantDates: ReadonlyArray<string>;
}

interface ICalculatePossibilitiesDataResponseType {
  readonly ranges: Array<number>;
  readonly buckets: { [key: string]: number };
}

const calculatePossibilitiesData = ({
  netWorthOverTime,
  firstStepLevel,
  financialGoal,
  bucketWidth,
  bucketsNumber,
  importantDates
}: ICalculatePossibilitiesDataParamType): ICalculatePossibilitiesDataResponseType => {
  const response = {
    ranges: [],
    buckets: {}
  };

  response.ranges = [...Array(bucketsNumber)].map(
    (bucket, index) => firstStepLevel + bucketWidth * index
  );

  response.ranges.forEach(range => (response.buckets[range] = 0));

  const allOriginalDates = Object.keys(netWorthOverTime).filter(date =>
    isAfter(date, importantDates[importantDates.length - 1])
  );
  let stepSize = 1;
  let startDate = addDays(allOriginalDates[0], stepSize);
  while (
    stepSize <
    differenceInDays(
      allOriginalDates[allOriginalDates.length - 1],
      allOriginalDates[0]
    ) +
      1
  ) {
    let runningDate = startDate;
    while (
      isBefore(
        runningDate,
        addDays(allOriginalDates[allOriginalDates.length - 1], 1)
      )
    ) {
      const firstDate = subDays(runningDate, stepSize);
      const lastDate = runningDate;
      const result = getExpectedOutcomeForTwoDates({
        firstDate,
        netWorthOverTime,
        lastDate,
        financialGoal
      });
      response.ranges.some((topBorder, index) => {
        if (topBorder >= result && result > topBorder - bucketWidth) {
          response.buckets[topBorder]
            ? (response.buckets[topBorder] =
                response.buckets[topBorder] + stepSize)
            : (response.buckets[topBorder] = stepSize);
          return true;
        }
      });

      runningDate = addDays(runningDate, 1);
    }
    stepSize = stepSize * 2;
  }
  return response;
};

export default calculatePossibilitiesData;
