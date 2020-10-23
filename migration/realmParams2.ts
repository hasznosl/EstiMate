export const currency = {
  name: "currency",
  properties: {
    name: { type: "string", default: "EUR" },
    exchangeToDefault: { type: "string", default: "1" }
  }
};

export const account = {
  name: "account",
  properties: {
    name: { type: "string" },
    currency: "currency",
    transactions: "transaction[]",
    n26Transactions: "n26Transaction[]"
  }
};

export const transaction = {
  name: "transaction",
  properties: {
    amount: { type: "string", default: 0 },
    currency: "currency",
    date: { type: "string", default: new Date().toString() }
  }
};

export const n26Transaction = {
  name: "n26Transaction",
  properties: {
    date: { type: "string", default: new Date().toString() },
    payee: { type: "string", default: '' },
    accountNumber: { type: "string", default: '' },
    transactionType: { type: "string", default: '' },
    paymentReference: { type: "string", default: '' },
    category: { type: "string", default: '' },
    amount: { type: "string", default: 0 },
  }
};

export const birthday = {
  name: "birthday",
  properties: {
    date: { type: "string" }
  }
};

export const importantDate = {
  name: "importantDate",
  properties: {
    date: { type: "string" }
  }
};

export const virtualSpending = {
  name: "virtualSpending",
  properties: {
    value: { type: "string" }
  }
};

export const financialGoal = {
  name: "financialGoal",
  properties: {
    netWorthValue: { type: "string" },
    date: { type: "string" }
  }
};

export default {
  schema: [
    currency,
    account,
    transaction,
    birthday,
    importantDate,
    virtualSpending,
    financialGoal
  ],
  schemaVersion: 1
};
