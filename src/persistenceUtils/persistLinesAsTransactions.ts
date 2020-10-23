import { IRealmDocumentNameType } from "../utils/types";
import persistency from "./persistency";
import formatDate from "../utils/formatDate";

const persistLinesAsTransactions = async ({
  lines,
  currency
}: {
  lines: ReadonlyArray<string>;
  currency: string;
}) => {
  await persistency.getDatabase().write(() => {
    let date = "";
    let amount = null;
    let account = null;
    lines.forEach(line => {
      const supposedAmount = parseInt(line.substr(1, line.length - 2));
      if (line[0] === "T" && !isNaN(supposedAmount)) {
        // amount
        amount = supposedAmount;
      } else if (line[0] === "D") {
        // date
        date = formatDate(new Date(line.substr(1, line.length - 1)));
      } else if (line[0] === "N") {
        const name = line.split("_")[1];
        account = persistency
          .getDatabase()
          .create(IRealmDocumentNameType.account, {
            name,
            currency
          });
      }
      if (!!date && !isNaN(parseInt(amount)) && parseInt(amount)) {
        const transaction = persistency
          .getDatabase()
          .create(IRealmDocumentNameType.transaction, {
            date,
            amount: `${amount}`,
            currency: account.currency
          });
        account.transactions.push(transaction);
        date = "";
        amount = null;
      }
    });
  });
};

export const persistJsonAsTransactions = async ({
  rows,
  currency
}: {
  rows: ReadonlyArray<any>;
  currency: any;
}) => {

  await persistency.getDatabase().write(() => {

    let account = persistency
    .getDatabase()
    .create(IRealmDocumentNameType.account, {
      name: "EUR_bank",
      currency
    });


    rows.forEach(row => {
      const transaction = persistency
      .getDatabase()
      .create(IRealmDocumentNameType.transaction, {
        date: row.Date, 
        amount: `${row.Amount}`,
        currency: account.currency,
        category: row.Category
      });
      const n26transaction = persistency
      .getDatabase()
      .create(IRealmDocumentNameType.n26Transaction, {
        date: row.Date, 
        payee: row.Payee,
        accountNumber: row['Account number'],
        transactionType: row['Transaction type'],
        paymentReference: row['Payment reference'],
        category: row.Category,
        amount: `${row.Amount}`,
      });

      account.transactions.push(transaction);
      account.n26Transactions.push(n26transaction);

    });
  });

};

export default persistLinesAsTransactions;
