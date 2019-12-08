import { subDays, addDays } from "date-fns";
import getRelevantDates from "./getRelevantDates";
import getInternalScale from './getInternalScale'
import getCentralItem from "./getCentralItem";
import getItemsNrLeftAndRight from "./getItemsNrLeftAndRight";
import formatDate from "./formatDate";


const getStartAndEndDates = ({
  scale,
  focalX,
  width,
  dateValueMap,
  hasZoomed,
  zoomedDates
}) => {
  const relevantDates = getRelevantDates({ dateValueMap, hasZoomed, zoomedDates })
  const internalScale = getInternalScale({ scale })
  const centralDate = getCentralItem({ items: relevantDates, focalX, width })
  const daysLeftAndRight = getItemsNrLeftAndRight({ items: relevantDates, scale: internalScale })

  return {
    startDate: formatDate(subDays(centralDate, daysLeftAndRight)),
    endDate: formatDate(addDays(centralDate, daysLeftAndRight))
  }
}

export default getStartAndEndDates