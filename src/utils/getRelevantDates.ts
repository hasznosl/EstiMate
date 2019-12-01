import getAllDates from "./getAllDates";

const getRelevantDates = ({
  netWorthOverTimeToFuture,
  hasZoomed,
  zoomedDates
}) => hasZoomed ?
    zoomedDates :
    getAllDates({ netWorthOverTimeToFuture })

export default getRelevantDates