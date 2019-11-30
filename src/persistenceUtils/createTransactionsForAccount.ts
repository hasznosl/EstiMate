import { isBefore, addDays } from "date-fns";
import {
  IRealmCurrencyType,
  IRealmAccountType,
  IRealmDocumentNameType
} from "../utils/types";
import persistency from "./persistency";
import formatDate from "../utils/formatDate";

const createTransactionsForAccount = async ({
  beginningDate,
  endDate,
  amount,
  currency,
  account
}: {
  beginningDate: Date;
  endDate: Date;
  amount: number;
  currency: IRealmCurrencyType;
  account: IRealmAccountType;
}) => {
  let currentDate = beginningDate;
  let i = 0;
  while (isBefore(currentDate, endDate)) {
    await persistency.createDocumentAndPushToParentDocument({
      documentInstance: {
        amount: amount.toString(),
        currency,
        date: formatDate(new Date(currentDate.toString()))
      },
      parentDocument: account,
      documentName: IRealmDocumentNameType.transaction,
      documentNamePlural: "transactions"
    });
    i = i + 1;
    currentDate = addDays(beginningDate, i);
  }
};

export default createTransactionsForAccount;
