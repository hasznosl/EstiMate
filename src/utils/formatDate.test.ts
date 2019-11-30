import formatDate from "./formatDate";

describe("formatDate", () => {
  it("should handle different inputs", () => {
    expect(formatDate(new Date("Sep 12 2018"))).toBe("Sep 12 2018");
    expect(formatDate("12345678901")).toBe(null);
    expect(formatDate("123456789012")).toBe(null);
    expect(formatDate("Sep 12 2018")).toBe("Sep 12 2018");
    expect(formatDate("Sep 12 2018x")).toBe(null);
    expect(formatDate("Sep 12 2018 foobar")).toBe(null);
    expect(formatDate(new Date("Sep 12 2018 foobar"))).toBe(null);
    expect(formatDate(new Date("Sep 12 2018").toString())).toBe("Sep 12 2018");
  });
});
