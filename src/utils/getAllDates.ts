import { NetWorthOverTimeType } from './types';

const getAllDates = ({ dateValueMap }: { dateValueMap: NetWorthOverTimeType }): ReadonlyArray<string> =>
	Object.keys(dateValueMap);

export default getAllDates;
