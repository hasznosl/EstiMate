import getAllDates from './getAllDates';
import { NetWorthOverTimeType } from './types';

const getRelevantDates = ({
	dateValueMap,
	hasZoomed,
	zoomedDates
}: {
	dateValueMap: NetWorthOverTimeType;
	hasZoomed: boolean;
	zoomedDates: ReadonlyArray<string>;
}): ReadonlyArray<string> => (hasZoomed ? zoomedDates : getAllDates({ dateValueMap }));



export const getCategoryDates = ({
	dateValueMap,
}: {
	dateValueMap: NetWorthOverTimeType;
}): ReadonlyArray<string> => {
	return []
};

export default getRelevantDates;
