import { IDateValueMapType } from "./types";

const getAllDates = (
  { dateValueMap }:
    { dateValueMap: IDateValueMapType }
): ReadonlyArray<string> => Object.keys(dateValueMap)

export default getAllDates