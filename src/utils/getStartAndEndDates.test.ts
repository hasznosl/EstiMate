import getStartAndEndDates from "./getStartAndEndDates";
import netWorthOverTimeToFutureFixture from "../testUtils/netWorthOverTimeToFutureFixture";



describe('getStartAndEndDates', () => {
  it('should return correct results when hasZoomed: false', () => {
    const { startDate, endDate } = getStartAndEndDates({
      scale: 1,
      focalX: 15,
      width: 30,
      netWorthOverTimeToFuture: netWorthOverTimeToFutureFixture,
      hasZoomed: false,
      zoomedDates: 'whatever this is'
    })

    expect(startDate.toString()).toBe('Sat Jul 02 1988 00:00:00 GMT+0200 (CEST)')
    expect(endDate.toString()).toBe('Wed Jul 06 1988 00:00:00 GMT+0200 (CEST)')
  })

  it('should return correct results when hasZoomed: true', () => {
    const { startDate, endDate } = getStartAndEndDates({
      scale: 1,
      focalX: 15,
      width: 30,
      netWorthOverTimeToFuture: netWorthOverTimeToFutureFixture,
      hasZoomed: true,
      zoomedDates: ['jan 03 2016 ', 'jan 04 2016 ', 'jan 05 2016 ']
    })

    expect(startDate.toString()).toBe('Sun Jan 03 2016 00:00:00 GMT+0100 (CET)')
    expect(endDate.toString()).toBe('Thu Jan 07 2016 00:00:00 GMT+0100 (CET)')
  })
})