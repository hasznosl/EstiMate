import React from 'react';
import {
	createNetWorthOverTimeDataFromTransactions,
	calculateProjectedNetWorthOverTime,
	formatImportantDatesFromPersistency,
	populateFromFile,
	determineStableIncome,
	updateCurrencies,
	getProjectedSavingForThisMonth,
	getMostAccurateExchangeRate,
	adjustAllAccountsToDeterioration
} from './utils';
import calculateMonthlyAverageSpending from './utils/calculateMonthlyAverageSpending';
import { Dimensions, ActivityIndicator } from 'react-native';
import { format, differenceInDays } from 'date-fns';
import { getInitialOrientation } from 'react-native-orientation';
import { Orientation, IRealmDocumentNameType } from './utils/types';
import persistency from './persistenceUtils/persistency';
import createTransactionsForAccount from './persistenceUtils/createTransactionsForAccount';
import { lineColor } from './styles';
import calculateTargetSaving from './utils/calculateTargetSaving';
import { IContextType } from './utils/types';

export const GlobalContext = React.createContext({});

export class GlobalProvider extends React.Component<{}, IContextType> {
	constructor(props) {
		super(props);
		this.state = {
			monthlyAverageSpending: {},
			birthDay: null,
			importantDates: [],
			virtualSpending: '',
			financialGoal: { date: new Date(), netWorthValue: '0' },
			accounts: [],
			orientation: getInitialOrientation(),
			netWorthOverTime: {},
			netWorthOverTimeToFuture: {},
			stableIncome: 0,
			projectedSavingForThisMonth: 0,
			artificialShortTermGrowthRate: 0,
			longTermGrowthRate: 0,
			lastOneMonthGrowthRate: 0,
			targetSaving: 0
		};
	}

	async componentDidMount() {
		await persistency.initializePersistency();
		Dimensions.addEventListener('change', ({ window: { width, height } }) => {
			const orientation = width > height ? Orientation.LANDSCAPE : Orientation.PORTRAIT;
			this.setState({ orientation });
		});

		this.resetDataState();
	}

	deleteData = async () => {
		await persistency.purge();

		this.resetDataState();
	};

	importFile = () => {
		populateFromFile({
			callback: () => this.resetDataState()
		});
	};

	resetDataState = async () => {
		const [ accounts, financialGoals, virtualSpendings, birthDays, realmCurrencies ] = await Promise.all([
			persistency.getDocuments({
				documentName: IRealmDocumentNameType.account
			}),
			persistency.getDocuments({
				documentName: IRealmDocumentNameType.financialGoal
			}),
			persistency.getDocuments({
				documentName: IRealmDocumentNameType.virtualSpending
			}),
			persistency.getDocuments({
				documentName: IRealmDocumentNameType.birthday
			}),
			persistency.getDocuments({
				documentName: IRealmDocumentNameType.currency
			})
		]);
		const birthDay = birthDays[Object.keys(birthDays).length - 1];
		const virtualSpending = virtualSpendings[Object.keys(virtualSpendings).length - 1];
		const financialGoal = financialGoals[Object.keys(financialGoals).length - 1];
		const currencyNames = Object.keys(realmCurrencies).map((key) => realmCurrencies[key].name);

		await adjustAllAccountsToDeterioration({ accounts });

		const netWorthOverTime = await createNetWorthOverTimeDataFromTransactions();
		const importantDates = await formatImportantDatesFromPersistency();
		const monthlyAverageSpending = calculateMonthlyAverageSpending({
			netWorthOverTime,
			importantDates,
			rightNow: new Date()
		});
		const targetSaving = calculateTargetSaving(importantDates, financialGoal, netWorthOverTime);
		const {
			projectedSavingForThisMonth,
			artificialShortTermGrowthRate,
			lastOneMonthGrowthRate
		} = getProjectedSavingForThisMonth({
			netWorthOverTime
		});
		const { projectedNetWorthOverTime, longTermGrowthRate } = calculateProjectedNetWorthOverTime({
			netWorthOverTime,
			importantDates,
			virtualSpending,
			artificialShortTermGrowthRate,
			financialGoal,
			projectedSavingForThisMonth
		});
		const netWorthOverTimeToFuture = {
			...netWorthOverTime,
			...projectedNetWorthOverTime
		};
		this.setState({
			birthDay: birthDay && birthDay.date,
			importantDates,
			virtualSpending: virtualSpending && virtualSpending.value,
			financialGoal,
			accounts: Object.keys(accounts).map((key) => accounts[key]),
			netWorthOverTime,
			monthlyAverageSpending,
			netWorthOverTimeToFuture,
			stableIncome: determineStableIncome({ netWorthOverTime }),
			projectedSavingForThisMonth,
			artificialShortTermGrowthRate,
			longTermGrowthRate,
			lastOneMonthGrowthRate,
			targetSaving
		});

		updateCurrencies({ currencyNames, realmCurrencies });
	};

	setBirthDay = async (birthDay) => {
		this.setState({ birthDay });
		await persistency.create({
			document: IRealmDocumentNameType.birthday,
			instance: { date: birthDay }
		});
		this.resetDataState();
	};

	saveFinancialGoal = async ({ financialGoal }) => {
		this.setState({ financialGoal });
		await persistency.create({
			document: IRealmDocumentNameType.financialGoal,
			instance: financialGoal
		});
		this.resetDataState();
	};

	changeVirtualSpending = async (virtualSpending) => {
		this.setState({ virtualSpending });
		await persistency.create({
			document: IRealmDocumentNameType.virtualSpending,
			instance: { value: virtualSpending }
		});
		this.resetDataState();
	};

	saveTransaction = async ({ amount, date, account }) => {
		await persistency.createDocumentAndPushToParentDocument({
			documentInstance: {
				amount,
				date,
				currency: account.currency
			},
			parentDocument: account,
			documentName: IRealmDocumentNameType.transaction,
			documentNamePlural: 'transactions'
		});
		this.resetDataState();
	};

	addImportantDate = async (importantDate) => {
		await persistency.create({
			document: IRealmDocumentNameType.importantDate,
			instance: { date: importantDate }
		});
		this.setState({
			importantDates: await formatImportantDatesFromPersistency()
		});
		this.resetDataState();
	};

	deleteImportantDate = (importantDate: string) => async () => {
		const importantDateRealm = (await persistency.getDocuments({
			documentName: IRealmDocumentNameType.importantDate
		})).filtered('date = $0', format(importantDate, 'YYYY-MM-DD'))[0];
		await persistency.remove({ instance: importantDateRealm });
		this.setState({
			importantDates: await formatImportantDatesFromPersistency()
		});
		this.resetDataState();
	};

	onClickSaveManuallyImportedData = async ({ beginningDate, account, endDate, amount, deteriorationConstant }) => {
		const increment = Math.floor(parseInt(amount) / differenceInDays(endDate, beginningDate));
		const dbAccounts = await persistency.getDocuments({
			documentName: IRealmDocumentNameType.account
		});
		const accountName = account.split('_')[1];
		const currencyName = account.split('_')[0];

		let dbAccount = dbAccounts.find((dbAcc) => dbAcc.name === accountName && dbAcc.currency === currency);
		const realmCurrencies = await persistency.getDocuments({
			documentName: IRealmDocumentNameType.currency
		});

		let currency = realmCurrencies.filtered(`name = "${currencyName}"`)[0];

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
		if (dbAccount) {
			await createTransactionsForAccount({
				beginningDate,
				endDate,
				amount: increment,
				currency,
				account: dbAccount
			});
		} else {
			const account = await persistency.create({
				document: IRealmDocumentNameType.account,
				instance: {
					name: accountName,
					currency,
					deteriorationConstant
				}
			});
			await createTransactionsForAccount({
				beginningDate,
				endDate,
				amount: increment,
				currency,
				account
			});
		}
		this.resetDataState();
	};

	deleteAccount = async ({ account }) => {
		await persistency.removeDocumentAndSubdocuments({
			documentInstance: account,
			subdocumentNamePlural: 'transactions'
		});
		this.resetDataState();
	};

	render() {
		const {
			importantDates,
			birthDay,
			virtualSpending,
			financialGoal,
			accounts,
			netWorthOverTime,
			monthlyAverageSpending,
			netWorthOverTimeToFuture,
			stableIncome,
			projectedSavingForThisMonth,
			artificialShortTermGrowthRate,
			longTermGrowthRate,
			lastOneMonthGrowthRate,
			orientation,
			targetSaving
		} = this.state;

		// TODO: this could be something like: isReady or something
		if (persistency.getDatabase()) {
			const {
				setBirthDay,
				addImportantDate,
				deleteImportantDate,
				changeVirtualSpending,
				saveFinancialGoal,
				saveTransaction,
				deleteData,
				importFile,
				onClickSaveManuallyImportedData,
				deleteAccount
			} = this;
			return (
				<GlobalContext.Provider
					value={{
						netWorthOverTime,
						netWorthOverTimeToFuture,
						importantDates,
						birthDay,
						virtualSpending,
						setBirthDay,
						addImportantDate,
						deleteImportantDate,
						changeVirtualSpending,
						saveFinancialGoal,
						financialGoal,
						monthlyAverageSpending,
						accounts,
						saveTransaction,
						deleteData,
						importFile,
						stableIncome,
						projectedSavingForThisMonth,
						artificialShortTermGrowthRate,
						longTermGrowthRate,
						lastOneMonthGrowthRate,
						orientation,
						onClickSaveManuallyImportedData,
						deleteAccount,
						targetSaving
					}}
				>
					{this.props.children}
				</GlobalContext.Provider>
			);
		} else {
			return <ActivityIndicator size="large" color={lineColor} />;
		}
	}
}
