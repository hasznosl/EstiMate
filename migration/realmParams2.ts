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
    transactions: "transaction[]"
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
