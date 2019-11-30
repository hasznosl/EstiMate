import getConvertedAmount from "./getConvertedAmount";

describe("getConvertedAmount", () => {
  it("should convert the amount of the transaction passed in", () => {
    const currency = { name: "EUR", exchangeToDefault: "1" };
    const transaction = { amount: "12.001", date: "2012 02 23", currency };

    expect(getConvertedAmount({ transaction })).toBe(12.001);
  });
});
