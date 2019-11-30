import { subDays } from "date-fns";
import formatDate from "./formatDate";

export const seed = realm => {
  realm.create("transaction", {
    amount: 0,
    date: formatDate(subDays(new Date().toString(), 7))
  });
  realm.create("transaction", {
    amount: 2,
    date: formatDate(subDays(new Date().toString(), 6))
  });
  realm.create("transaction", {
    amount: 3,
    date: formatDate(subDays(new Date().toString(), 5))
  });
  realm.create("transaction", {
    amount: 1,
    date: formatDate(subDays(new Date().toString(), 4))
  });
  realm.create("transaction", {
    amount: 2,
    date: formatDate(subDays(new Date().toString(), 3))
  });
  realm.create("transaction", {
    amount: 1,
    date: formatDate(subDays(new Date().toString(), 2))
  });
  realm.create("transaction", {
    amount: 3,
    date: formatDate(subDays(new Date().toString(), 1))
  });
};
