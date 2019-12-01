import calculatePossibilitiesData from "./calculatePossibilitiesData";
import netWorthOverTimeFixture from "../testUtils/netWorthOverTimeFixture";

describe("calculatePossibilitiesData", () => {
  it("should give proper result for meaningful params", () => {
    // -21 x 1, 35 x 1, 21 x 2
    const firstStepLevel = -20;
    const bucketWidth = 10;
    const bucketsNumber = 7;
    const financialGoal = {
      date: new Date("Jul 06 1988"),
      netWorthValue: "9999" // this doesnt matter
    };
    const importantDates = ["Jul 02 1988"];
    const received = calculatePossibilitiesData({
      netWorthOverTime: netWorthOverTimeFixture,
      firstStepLevel,
      bucketWidth,
      bucketsNumber,
      financialGoal,
      importantDates
    });

    expect(received.buckets["-20"]).toBe(1);
    expect(received.buckets["-10"]).toBe(0);
    expect(received.buckets["0"]).toBe(0);
    expect(received.buckets["10"]).toBe(0);
    expect(received.buckets["20"]).toBe(0);
    expect(received.buckets["30"]).toBe(2);
    expect(received.buckets["40"]).toBe(1);

    expect(received.ranges[0]).toBe(-20);
    expect(received.ranges[1]).toBe(-10);
    expect(received.ranges[2]).toBe(0);
    expect(received.ranges[3]).toBe(10);
    expect(received.ranges[4]).toBe(20);
    expect(received.ranges[5]).toBe(30);
    expect(received.ranges[6]).toBe(40);
    expect(received.ranges[7]).toBe(undefined);
  });
});
