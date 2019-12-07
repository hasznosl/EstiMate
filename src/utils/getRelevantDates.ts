import getAllDates from "./getAllDates";

const getRelevantDates = ({
  netWorthData,
  hasZoomed,
  zoomedDates
}) => hasZoomed ?
    zoomedDates :
    getAllDates({ netWorthData })

export default getRelevantDates