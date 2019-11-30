import { subMinutes } from "date-fns";

const fixTimezone = (date: Date) => {
  let returnDate = date;
  if (date.getTimezoneOffset) {
    const timezoneOffset = date.getTimezoneOffset();
    returnDate = subMinutes(date, timezoneOffset);
  }

  return new Date(returnDate);
};

export default fixTimezone;
