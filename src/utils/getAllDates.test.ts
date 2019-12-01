import getAllDates from "./getAllDates";
import netWorthOverTimeToFutureFixture from "../testUtils/netWorthOverTimeToFutureFixture";

describe('getAllDates', () => {
  it('should return all dates inside NetWorthOverTimeToFuture', () => {
    const allDatesResult = getAllDates({
      netWorthOverTimeToFuture: netWorthOverTimeToFutureFixture
    })

    const allDatesExpected = Object.keys(netWorthOverTimeToFutureFixture)

    allDatesResult.forEach((date, index) => {
      expect(
        date
      ).toBe(
        allDatesExpected[index]
      )
    })
  })
})