import { DocumentPicker, DocumentPickerUtil } from 'react-native-document-picker';
import NetInfo from '@react-native-community/netinfo';
import RNFetchBlob from 'rn-fetch-blob';
import { orderBy, isEmpty } from 'lodash';
import {
	isSameDay,
	isBefore,
	addDays,
	subDays,
	differenceInDays,
	isAfter,
	endOfMonth,
	subMonths,
	addMonths,
	startOfMonth,
	getDate,
	getDaysInMonth
} from 'date-fns';
import axios from 'axios';
import { FIXER_API_KEY } from './secrets';
import { IRealmDocumentNameType, IDateValueMapType, ImportantDateType } from './types';
import persistLinesAsTransactions from '../persistenceUtils/persistLinesAsTransactions';
import setCurrenciesExchangeRates from '../persistenceUtils/setCurrenciesExchangeRates';
import persistency from '../persistenceUtils/persistency';
import formatDate from './formatDate';
import getConvertedAmount from './getConvertedAmount';

export const getMostAccurateExchangeRate = async ({ currencyName }) => {
	const connectionInfo = await NetInfo.fetch();

	if (connectionInfo.type !== 'none') {
		const response = await axios.get(
			`http://data.fixer.io/api/latest?access_key=${FIXER_API_KEY}&base=EUR&symbols=${currencyName}`
		);
		if (response.status === 200 && response.data.success === true) {
			return `${response.data.rates[currencyName]}`;
		} else {
			return getHardcodedExchangeRate({ currencyName });
		}
	} else {
		return getHardcodedExchangeRate({ currencyName });
	}
};

const getHardcodedExchangeRate = ({ currencyName }) =>
	// more hardcoded currencies will come on request
	currencyName === 'EUR' ? '1' : currencyName === 'HUF' ? '320' : '1';

export const populateFromFile = ({ callback }) => {
	DocumentPicker.show(
		{
			filetype: [ DocumentPickerUtil.allFiles() ]
		},
		(error, res) => {
			if (!error) {
				RNFetchBlob.fs.readFile(res.uri, 'utf8').then(async (data) => {
					const currencyName = res.fileName.substring(0, 3);
					const currencies = await persistency.getDocuments({
						documentName: IRealmDocumentNameType.currency
					});
					let currency = currencies.filtered(`name = "${currencyName}"`)[0];
					if (!(currency && currency.name)) {
						const exchangeToDefault = await getMostAccurateExchangeRate({
							currencyName
						});
						await persistency.create({
							document: IRealmDocumentNameType.currency,
							instance: {
								name: currencyName,
								exchangeToDefault
							}
						});
					}
					const lines = data.split('\n');
					await persistLinesAsTransactions({ lines, currency });
					callback();
				});
			} else {
			}
		}
	);
};

export const calculateCurrentWorthOfDeterioratingItem = (account) => {
	const transactions = orderBy(account.transactions, (transaction) => new Date(transaction.date).getTime());
	const firstDate = transactions[0] ? transactions[0].date : null;
	const daysSince = firstDate ? differenceInDays(new Date(), firstDate) : 0;

	return Math.floor(getInitialValueOfItem(account) / (account.deteriorationConstant * daysSince + 1));
};

export const adjustAllAccountsToDeterioration = async ({ accounts }) => {
	accounts.forEach(async (account) => {
		if (account.deteriorationConstant !== 0) {
			const currentWorth = calculateCurrentWorthOfDeterioratingItem(account);
			const currentBalance = calculateSumOfTransactions(account);
			if (currentWorth !== currentBalance) {
				await persistency.createDocumentAndPushToParentDocument({
					documentInstance: {
						amount: `${currentWorth - currentBalance}`,
						date: formatDate(new Date()),
						currency: account.currency
					},
					parentDocument: account,
					documentName: IRealmDocumentNameType.transaction,
					documentNamePlural: 'transactions'
				});
			}
		}
	});
};

export const calculateSumOfTransactions = (account) =>
	account.transactions.reduce(
		(sum, transaction) =>
			sum + (transaction.amount && parseInt(transaction.amount) ? parseInt(transaction.amount) : 0),
		0
	);

export const getInitialValueOfItem = (account) => {
	const transactions = orderBy(account.transactions, (transaction) => new Date(transaction.date).getTime());

	return transactions[0] ? parseInt(transactions[0].amount) : 0;
};

export const createNetWorthOverTimeDataFromTransactions = async () => {
	let transactions = [];

	const accounts = await persistency.getDocuments({
		documentName: IRealmDocumentNameType.account
	});
	accounts.forEach((account) => {
		account.transactions.forEach((transaction) => transactions.push(transaction));
	});

	transactions = orderBy(transactions, (transaction) => new Date(transaction.date).getTime());

	if (!transactions[0]) {
		return [];
	}
	const firstDate = new Date(transactions[0].date);
	const lastDate = new Date(transactions[transactions.length - 1].date);
	let currentDate = firstDate;
	let netWorthOverTime = {};
	let lastNetWorth = {
		date: formatDate(firstDate),
		worth: 0
	};
	while (!isAfter(currentDate, lastDate)) {
		const currentKey = formatDate(currentDate);
		netWorthOverTime[currentKey] = 0;
		currentDate = addDays(currentDate, 1);
	}
	transactions.forEach((transaction) => {
		if (isSameDay(lastNetWorth.date, transaction.date)) {
			lastNetWorth = {
				worth: lastNetWorth.worth + getConvertedAmount({ transaction }),
				date: transaction.date
			};
			netWorthOverTime[transaction.date] = lastNetWorth.worth;
		} else {
			let currentDate = formatDate(addDays(lastNetWorth.date, 1));
			while (!isAfter(currentDate, transaction.date)) {
				netWorthOverTime[currentDate] = lastNetWorth.worth;
				if (isSameDay(currentDate, transaction.date)) {
					lastNetWorth = {
						worth: lastNetWorth.worth + getConvertedAmount({ transaction }),
						date: currentDate
					};
					netWorthOverTime[transaction.date] = lastNetWorth.worth;
				}
				currentDate = formatDate(addDays(currentDate, 1));
			}
		}
	});

	return netWorthOverTime;
};

export const calculateProjectedNetWorthOverTime = ({
	netWorthOverTime,
	importantDates,
	virtualSpending,
	artificialShortTermGrowthRate,
	financialGoal,
	projectedSavingForThisMonth
}) => {
	const dates = Object.keys(netWorthOverTime);
	const lastDate = netWorthOverTime[formatDate(new Date())] ? formatDate(new Date()) : dates[dates.length - 1];
	const lastValue = netWorthOverTime[lastDate];
	const endOfPrevMonth = formatDate(endOfMonth(subMonths(lastDate, 1)));
	const virtual = virtualSpending && !isNaN(parseInt(virtualSpending.value)) ? parseInt(virtualSpending.value) : 0;

	let numOfDays = differenceInDays(endOfMonth(lastDate), importantDates[importantDates.length - 1] || dates[0]);
	const xDaysBefore = formatDate(subDays(endOfMonth(lastDate), numOfDays));
	const levelAtEndOfThisMonth = netWorthOverTime[endOfPrevMonth] + projectedSavingForThisMonth;
	const increment = levelAtEndOfThisMonth - netWorthOverTime[xDaysBefore] || levelAtEndOfThisMonth;

	const longTermGrowthRate = (increment - virtual) / (numOfDays || 1);
	const projectedNetWorthOverTime = {};
	if (financialGoal && financialGoal.date) {
		let i = 1;
		let currentDate = formatDate(addDays(lastDate, i));
		while (isBefore(currentDate, addDays(financialGoal.date, 1))) {
			if (!netWorthOverTime[currentDate] && isBefore(currentDate, new Date())) {
				projectedNetWorthOverTime[currentDate] = lastValue;
			} else if (isBefore(currentDate, endOfMonth(addDays(lastDate, 1)))) {
				projectedNetWorthOverTime[currentDate] = netWorthOverTime[lastDate] + i * artificialShortTermGrowthRate;
			} else {
				const endOfThisMonth = formatDate(endOfMonth(new Date()));

				projectedNetWorthOverTime[currentDate] =
					(projectedNetWorthOverTime[endOfThisMonth] || netWorthOverTime[endOfThisMonth] || lastValue) +
					(i - differenceInDays(addDays(endOfMonth(lastDate), 1), new Date())) * longTermGrowthRate;
			}

			i = i + 1;
			currentDate = formatDate(addDays(lastDate, i));
		}
	}
	return {
		projectedNetWorthOverTime,
		longTermGrowthRate
	};
};

const getStartDateOfPeriod = ({ currentDate, importantDates, dates }) => {
	let baseDate = dates[0];
	importantDates.forEach((importantDate) => {
		if (isBefore(importantDate, currentDate)) {
			baseDate = importantDate;
		}
	});

	return baseDate;
};

export const calculatePeriodsAveragePerDayOverTimeData = ({
	netWorthOverTimeToFuture,
	importantDates
}: {
	netWorthOverTimeToFuture: IDateValueMapType;
	importantDates: ReadonlyArray<ImportantDateType>;
}) => {
	const dates = Object.keys(netWorthOverTimeToFuture);
	const firstDate = dates[0];
	const lastDate = dates[dates.length - 1];
	if (!isBefore(dates[0], dates[dates.length - 1])) {
		return [];
	}
	let currentDate = firstDate;
	let i = 0;
	const periodsAveragePerDayOverTime = {};
	while (!isAfter(currentDate, lastDate)) {
		i = i + 1;
		currentDate = formatDate(addDays(currentDate, 1));
		const firstDateOfPeriod = getStartDateOfPeriod({
			currentDate,
			importantDates,
			dates
		});
		const increment = netWorthOverTimeToFuture[currentDate] - netWorthOverTimeToFuture[firstDateOfPeriod];

		if (isSameDay(addDays(firstDateOfPeriod, 1), currentDate)) {
			i = 1;
		}
		if (!isNaN(increment)) {
			periodsAveragePerDayOverTime[currentDate] = increment / i;
		}
	}
	return periodsAveragePerDayOverTime;
};

const myMoneyInTheFuture = ({ date, netWorthOverTimeToFuture }) => netWorthOverTimeToFuture[formatDate(new Date(date))];

export const differenceInFuture = ({ netWorthOverTimeToFuture = {}, financialGoal }) =>
	myMoneyInTheFuture({
		netWorthOverTimeToFuture,
		date: financialGoal && financialGoal.date
	}) - parseInt(financialGoal && financialGoal.netWorthValue);

export const calculateTotalAveragePerDayOverTimeData = ({ netWorthOverTimeToFuture }) => {
	const dates = Object.keys(netWorthOverTimeToFuture);
	const firstDate = dates[0];
	const lastDate = dates[dates.length - 1];
	if (!isBefore(dates[0], dates[dates.length - 1])) {
		return [];
	}
	let currentDate = firstDate;
	let i = 0;
	const dateValueMap = {};
	while (!isAfter(currentDate, lastDate)) {
		i = i + 1;
		currentDate = formatDate(addDays(currentDate, 1));

		const increment = netWorthOverTimeToFuture[currentDate] - netWorthOverTimeToFuture[firstDate];
		if (!isNaN(increment)) {
			dateValueMap[currentDate] = increment / i;
		}
	}
	return dateValueMap;
};

export const getMonthString = (num) => {
	switch (num) {
		case 0:
			return 'January';
		case 1:
			return 'February';
		case 2:
			return 'March';
		case 3:
			return 'April';
		case 4:
			return 'May';
		case 5:
			return 'June';
		case 6:
			return 'July';
		case 7:
			return 'August';
		case 8:
			return 'September';
		case 9:
			return 'October';
		case 10:
			return 'November';
		case 11:
			return 'December';
	}
};

export const getCanSpendAmount = ({ netWorthOverTimeToFuture, netWorthOverTime, financialGoal, importantDates }) =>
	Math.floor(
		differenceInFuture({
			netWorthOverTimeToFuture,
			financialGoal
		}) *
			differenceInDays(
				Object.keys(netWorthOverTime).pop(),
				importantDates[importantDates.length - 1] || Object.keys(netWorthOverTime)[0]
			) /
			differenceInDays(Object.keys(netWorthOverTimeToFuture).pop(), Object.keys(netWorthOverTime).pop())
	);

export const calculateMonthlyAverageSpending = ({ importantDates, netWorthOverTime }) => {
	const firstDateToCount =
		importantDates[importantDates.length - 1] || Object.keys(netWorthOverTime)[0] || new Date();
	const dayOne = formatDate(startOfMonth(addMonths(firstDateToCount, 1)));
	const lastDay = formatDate(endOfMonth(subMonths(new Date(), 1)));
	if (isBefore(lastDay, dayOne) || isAfter(dayOne, new Date())) {
		return {};
	}
	let currentDay = dayOne;
	let worthChangeForEveryMonths = {};
	let latestNumericValue = netWorthOverTime[dayOne] || 0;
	while (!isAfter(currentDay, lastDay)) {
		const firstDayOfMonth = formatDate(startOfMonth(currentDay));
		const worthEndOfLastMonth = netWorthOverTime[formatDate(subDays(firstDayOfMonth, 1))] || latestNumericValue;
		while (!isAfter(currentDay, formatDate(endOfMonth(firstDayOfMonth)))) {
			const worthCurrentDay = netWorthOverTime[formatDate(currentDay)] || latestNumericValue;
			const spendingUntil = worthCurrentDay - worthEndOfLastMonth;
			latestNumericValue = netWorthOverTime[formatDate(currentDay)] || latestNumericValue;
			worthChangeForEveryMonths[currentDay] = spendingUntil;
			currentDay = formatDate(addDays(currentDay, 1));
		}
	}
	let averageWorthChangeForEachDay = {};
	for (let i = 1; i < 32; i++) {
		const dates = Object.keys(worthChangeForEveryMonths).filter((date) => getDate(date) === i);
		const avg = dates.reduce((total, date, index, array) => {
			total += parseInt(worthChangeForEveryMonths[date]);
			if (index === array.length - 1) {
				return Math.floor(total / array.length);
			} else {
				return total;
			}
		}, 0);
		averageWorthChangeForEachDay[i] = avg;
	}
	return averageWorthChangeForEachDay;
};

export const formatImportantDatesFromPersistency = async () =>
	orderBy(
		[
			...(await persistency.getDocuments({
				documentName: IRealmDocumentNameType.importantDate
			})).map((importantDate) => importantDate.date)
		],
		(importantDate) => new Date(importantDate).getTime()
	).map((importantDate) => formatDate(new Date(importantDate)));

export const getProjectedSavingForThisMonth = ({ netWorthOverTime }) => {
	const lastDate = netWorthOverTime[formatDate(new Date())]
		? formatDate(new Date())
		: Object.keys(netWorthOverTime).pop();
	const oneMonthAgo = formatDate(subMonths(lastDate, 1));
	const endValue = netWorthOverTime[lastDate];
	const diff = endValue - netWorthOverTime[oneMonthAgo];
	if (isNaN(diff)) {
		return {
			lastOneMonthGrowthRate: 0,
			artificialShortTermGrowthRate: 0,
			projectedSavingForThisMonth: 0
		};
	}
	const lastOneMonthGrowthRate = diff / differenceInDays(lastDate, oneMonthAgo);
	const projectedSavingForThisMonth = Math.floor(getDaysInMonth(lastDate) * lastOneMonthGrowthRate);

	const daysLeft = differenceInDays(endOfMonth(lastDate), lastDate);
	const currentLevel = netWorthOverTime[formatDate(lastDate)] - netWorthOverTime[formatDate(endOfMonth(oneMonthAgo))];
	const artificialShortTermGrowthRate = daysLeft ? (projectedSavingForThisMonth - currentLevel) / daysLeft : 0;
	return {
		lastOneMonthGrowthRate,
		artificialShortTermGrowthRate,
		projectedSavingForThisMonth
	};
};

const getSalaryCandidateForMonth = ({ month, netWorthOverTime }) => {
	let monthCurrentDay = startOfMonth(month);
	let currentIncomeCandidate = 0;
	const nextMonthFirstDay = formatDate(startOfMonth(addMonths(month, 1)));
	while (isBefore(monthCurrentDay, nextMonthFirstDay)) {
		const diff =
			(netWorthOverTime[formatDate(monthCurrentDay)] || 0) -
			(netWorthOverTime[formatDate(subDays(monthCurrentDay, 1))] || 0);
		if (diff > currentIncomeCandidate) {
			currentIncomeCandidate = diff;
		}
		monthCurrentDay = addDays(monthCurrentDay, 1);
	}
	return currentIncomeCandidate;
};

export const determineStableIncome = ({ netWorthOverTime }) => {
	// salary candidates for last three months
	const salaryCandidates = [
		getSalaryCandidateForMonth({
			month: subMonths(new Date(), 1),
			netWorthOverTime
		}),
		getSalaryCandidateForMonth({
			month: subMonths(new Date(), 2),
			netWorthOverTime
		}),
		getSalaryCandidateForMonth({
			month: subMonths(new Date(), 3),
			netWorthOverTime
		})
	];
	if (
		salaryCandidates[0] !== salaryCandidates[1] &&
		salaryCandidates[1] !== salaryCandidates[2] &&
		salaryCandidates[0] !== salaryCandidates[2]
	) {
		// best we can do is make an average
		return (salaryCandidates[0] + salaryCandidates[1] + salaryCandidates[2]) / 3;
	} else {
		if (salaryCandidates[0] === salaryCandidates[1] || salaryCandidates[0] === salaryCandidates[2]) {
			return salaryCandidates[0];
		} else if (salaryCandidates[1] === salaryCandidates[2]) {
			return salaryCandidates[1];
		} else {
			return salaryCandidates[2];
		}
	}
};

export const updateCurrencies = async ({ currencyNames, realmCurrencies }) => {
	if (isEmpty(realmCurrencies)) {
		return;
	}
	const connectionInfo = await NetInfo.getConnectionInfo();
	if (connectionInfo.type !== 'none') {
		const response = await axios.get(
			`http://data.fixer.io/api/latest?access_key=${FIXER_API_KEY}&base=EUR&symbols=${currencyNames.join(',')}`
		);
		if (response.status === 200 && response.data.success === true) {
			await setCurrenciesExchangeRates({
				currencies: response.data.rates,
				realmCurrencies
			});
		} else {
			// nothing to do
		}
	} else {
		// nothing to do
	}
};

export const shouldPushTransactionsToLambda = async () => {
	const connectionInfo = await NetInfo.getConnectionInfo();
	if (connectionInfo.type !== 'none') {
		// for now this url is ok
		const response = await axios.get(
			'https://ucfcbyvt3h.execute-api.us-east-2.amazonaws.com/beta/transactions/check-sync-status'
		);
		return response.status === 200 ? response.data.body.syncStatus !== 'ok' : false;
	} else {
		return false;
	}
};

export const pushTransactionsToLambda = async ({ accounts }) => {
	const response = await axios.post('https://ucfcbyvt3h.execute-api.us-east-2.amazonaws.com/beta/transactions', {
		accounts
	});
	return response.data;
};
