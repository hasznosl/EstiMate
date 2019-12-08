import { isSameDay, endOfMonth } from "date-fns";



const isLastDayOfMonth = (date: string) =>
  isSameDay(
    new Date(date),
    endOfMonth(new Date(date)))

export default isLastDayOfMonth