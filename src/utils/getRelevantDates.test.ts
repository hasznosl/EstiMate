import getRelevantDates from "./getRelevantDates";
import netWorthOverTimeToFutureFixture from "../testUtils/netWorthOverTimeToFutureFixture";

describe('getRelevantDates', () => {

  it('should return zoomedDates, if hasZoomed=true', () => {
    const zoomedDates = 'expected'
    expect(getRelevantDates({
      netWorthData: 'whatever this is',
      hasZoomed: true,
      zoomedDates
    })).toBe(zoomedDates)
  })

  it('should return all possible dates, if hasZoomed=false', () => {
    const relevantDates = getRelevantDates({
      netWorthData: netWorthOverTimeToFutureFixture,
      hasZoomed: false,
      zoomedDates: 'whatever this is'
    })
    relevantDates.forEach(
      (relevantDate, index) =>
        expect(relevantDates[index]).toBe(Object.keys(netWorthOverTimeToFutureFixture)[index])
    )
  })
})