import getAllDates from "./getAllDates";
import { IDateValueMapType } from "./types";

const getRelevantDates = ({
  dateValueMap,
  hasZoomed,
  zoomedDates
}:
  {
    dateValueMap: IDateValueMapType,
    hasZoomed: boolean
    zoomedDates: ReadonlyArray<string>
  }):
  ReadonlyArray<string> => hasZoomed ?
    zoomedDates :
    getAllDates({ dateValueMap })

export default getRelevantDates