import { IRealmTransactionType } from "./types";

const CORRECT_ROUNDING_ERROR = 100000;

const getConvertedAmount = ({
  transaction
}: {
  transaction: IRealmTransactionType;
}) => {
  const exchangeToDefault = transaction && transaction.currency && transaction.currency.exchangeToDefault
  const amount =
    ((transaction.amount && parseFloat(transaction.amount)
      ? parseFloat(transaction.amount)
      : 0) *
      CORRECT_ROUNDING_ERROR) /
    ((exchangeToDefault &&
      parseFloat(exchangeToDefault)
      ? parseFloat(exchangeToDefault)
      : 1) *
      CORRECT_ROUNDING_ERROR);
  if (!isNaN(amount)) {
    return amount;
  } else {
    return 0;
  }
};

export default getConvertedAmount;
