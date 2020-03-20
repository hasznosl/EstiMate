const netWorthOverTimeFixture = {
	'Jun 30 1988': 0,
	'Jul 01 1988': 15,
	'Jul 02 1988': 100,
	'Jul 03 1988': 3, // <--- important date
	'Jul 04 1988': -5,
	'Jul 05 1988': 15,

	//                           15
	//  ---------------------------
	'Aug 05 1988': 16,

	//                           16
	//  ---------------------------
	'Sep 05 1988': 17,
	'Sep 06 1988': -20,
	'Sep 07 1988': 10,
	'Sep 08 1988': 17,
	'Sep 30 1988': 18,

	//                           18
	//  ---------------------------
	'Oct 05 1988': 19 // <---- rightNow
};

export default netWorthOverTimeFixture;
