import { subDays, addDays } from "date-fns";
import getRelevantDates from "./getRelevantDates";
import getInternalScale from './getInternalScale'
import getCentralItem from "./getCentralItem";
import getItemsLeftAndRight from "./getItemsLeftAndRight";


const getStartAndEndDates = ({
  scale,
  focalX,
  width,
  netWorthOverTimeToFuture,
  hasZoomed,
  zoomedDates
}) => {
  const relevantDates = getRelevantDates({ netWorthOverTimeToFuture, hasZoomed, zoomedDates })
  const internalScale = getInternalScale({ scale })
  const centralDate = getCentralItem({ items: relevantDates, focalX, width })
  const daysLeftAndRight = getItemsLeftAndRight({ items: relevantDates, scale: internalScale })

  return {
    startDate: subDays(centralDate, daysLeftAndRight),
    endDate: addDays(centralDate, daysLeftAndRight)
  }
}

export default getStartAndEndDates