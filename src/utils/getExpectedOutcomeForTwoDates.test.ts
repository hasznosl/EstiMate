import getExpectedOutcomeForTwoDates from "./getExpectedOutcomeForTwoDates";

describe("getExpectedOutcomeForTwoDates", () => {
  it("should give proper result for meaningful params", () => {
    const firstDateString = "Jul 03 1988";
    const lastDateString = "Jul 04 1988";
    const netWorthOverTime = {
      [`${firstDateString}`]: 3,
      [`${lastDateString}`]: 5
    };
    const financialGoal = {
      date: new Date("Jul 06 1988"),
      netWorthValue: "9999" // this doesnt matter
    };
    const received = getExpectedOutcomeForTwoDates({
      netWorthOverTime,
      firstDate: new Date(firstDateString),
      lastDate: new Date(lastDateString),
      financialGoal
    });
    const expected = 9;
    expect(received).toBe(expected);
  });
  it("should give proper result for bad params (netWorthOverTime is bad)", () => {
    const firstDateString = "Jul 03 1988";
    const lastDateString = "Jul 03 1988";
    const netWorthOverTime = {
      [`${firstDateString}`]: 3,
      [`${lastDateString}`]: 5
    };
    const financialGoal = {
      date: new Date("Jul 06 1988"),
      netWorthValue: "9999" // this doesnt matter
    };
    const received = getExpectedOutcomeForTwoDates({
      netWorthOverTime,
      firstDate: new Date(firstDateString),
      lastDate: new Date(lastDateString),
      financialGoal
    });
    const expected = 5;
    expect(received).toBe(expected);
  });
  it("should give proper result for bad params (financialGoal bad)", () => {
    const firstDateString = "Jul 03 1988";
    const lastDateString = "Jul 04 1988";
    const netWorthOverTime = {
      [`${firstDateString}`]: 3,
      [`${lastDateString}`]: 5
    };
    const financialGoal = {
      date: new Date("Jul 02 1988"),
      netWorthValue: "9999" // this doesnt matter
    };
    const received = getExpectedOutcomeForTwoDates({
      netWorthOverTime,
      firstDate: new Date(firstDateString),
      lastDate: new Date(lastDateString),
      financialGoal
    });
    const expected = 1;
    expect(received).toBe(expected);
  });
});
