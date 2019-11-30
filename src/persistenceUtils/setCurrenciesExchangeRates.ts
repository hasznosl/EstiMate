import { IRealmType, IRealmObjects } from "../utils/types";
import persistency from "./persistency";

const setCurrenciesExchangeRates = async ({
  currencies,
  realmCurrencies
}: {
  currencies: ReadonlyArray<string>;
  realmCurrencies: IRealmObjects;
}) => {
  await persistency.getDatabase().write(() => {
    Object.keys(currencies).forEach(currencyName => {
      const realmCurrency = realmCurrencies.filtered(
        `name = "${currencyName}"`
      )[0];
      realmCurrency.exchangeToDefault = `${currencies[currencyName]}`;
    });
  });
};

export default setCurrenciesExchangeRates;
