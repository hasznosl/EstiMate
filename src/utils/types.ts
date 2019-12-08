export enum Orientation {
  LANDSCAPE = "LANDSCAPE",
  PORTRAIT = "PORTRAIT"
}

export interface IDateValueMapType {
  [key: string]: number;
}

export interface INumberValueMapType {
  [key: number]: number;
}

export interface IXYDataType {
  x: Date;
  y: number
}

export interface IFinancialGoalType {
  date: Date;
  netWorthValue: string;
}

interface ISaveFinancialGoalParam {
  readonly financialGoal: IFinancialGoalType;
}

interface IDeleteAccountGoalParam {
  readonly account: IRealmAccountType;
}

export interface IAppContext {
  readonly birthDay: Date;
  readonly realm: any;
  readonly importantDates: ReadonlyArray<string>;
  readonly virtualSpending: string;
  readonly financialGoal: IFinancialGoalType;
  readonly accounts: ReadonlyArray<any>;
  readonly orientation: Orientation;
  readonly netWorthOverTime: IDateValueMapType;
  readonly monthlyAverageSpending: object;
  readonly netWorthOverTimeToFuture: IDateValueMapType;
  readonly stableIncome: number;
  readonly projectedSavingForThisMonth: number;
  readonly artificialShortTermGrowthRate: number;
  readonly longTermGrowthRate: number;
  readonly lastOneMonthGrowthRate: number;
  readonly setBirthDay: () => void;
  readonly addImportantDate: () => void;
  readonly deleteImportantDate: (importantDate: string) => () => void;
  readonly changeVirtualSpending: () => void;
  readonly saveFinancialGoal: (ISaveFinancialGoalParam) => void;
  readonly deleteData: () => void;
  readonly importFile: () => void;
  readonly onClickSaveManuallyImportedData: () => void;
  readonly saveTransaction: () => void;
  readonly deleteAccount: (IDeleteAccountGoalParam) => void;
}

export enum Destinations {
  TotalAveragePerDayOverTime = "TotalAveragePerDayOverTime",
  PeriodsAveragePerDay = "PeriodsAveragePerDay",
  Monthly = "Monthly",
  Accounts = "Accounts",
  Settings = "Settings",
  Possibilities = "Possibilities"
}

export enum IRealmDocumentNameType {
  importantDate = "importantDate",
  account = "account",
  currency = "currency",
  financialGoal = "financialGoal",
  virtualSpending = "virtualSpending",
  birthday = "birthday",
  transaction = "transaction"
}

export interface IRealmCurrencyType {
  name: string;
  exchangeToDefault: string;
}

export interface IRealmTransactionType {
  date: string;
  currency: IRealmCurrencyType;
  amount: string;
}

export interface IRealmAccountType {
  name: string;
  currency: IRealmCurrencyType;
  transactions: Array<IRealmTransactionType>;
  deteriorationConstant: number;
}

export interface IRealmFinancialGoalType {
  date: string;
  netWorthValue: string;
}

export interface IRealmObjects extends ReadonlyArray<any> {
  filtered: (query: string, param?: string) => ReadonlyArray<any>;
}

export interface IRealmType {
  create: (document: IRealmDocumentNameType, instance: any) => any;
  write: (fn: () => void) => void;
  deleteAll: () => void;
  objects: (document: IRealmDocumentNameType) => IRealmObjects;
  delete: (instance: any) => void;
}
