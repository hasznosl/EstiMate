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

  //let account = null;



  await persistency.getDatabase().write(() => {

    let account = persistency
    .getDatabase()
    .create(IRealmDocumentNameType.account, {
      name: "EUR_bank",
      currency
    });
    /*let date = "";
    let amount = null;
    let account = null;*/
    rows.forEach(row => {
     // const date = new Date(row.Date)



      const transaction = persistency
      .getDatabase()
      .create(IRealmDocumentNameType.transaction, {
        date: row.date, 
        amount: `${row.Amount}`,
        currency: account.currency
      });

      account.transactions.push(transaction);

    });
  });
};

export default persistLinesAsTransactions;
