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
            name: 'bank',
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
  currency: string;
}) => {
  await persistency.getDatabase().write(() => {
    /*let date = "";
    let amount = null;
    let account = null;*/
    rows.forEach(row => {
      const date = new Date(row.Date)

      const account = persistency
          .getDatabase()
          .create(IRealmDocumentNameType.account, {
            name: 'bank',
            currency: "EUR"
          });

      const transaction = persistency
      .getDatabase()
      .create(IRealmDocumentNameType.transaction, {
        date,
        amount: `${row.Amount}`,
        currency: account.currency
      });


    });
  });
};

export default persistLinesAsTransactions;
