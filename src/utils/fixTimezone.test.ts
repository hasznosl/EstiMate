import fixTimezone from "./fixTimezone";

describe("fixTimezone", () => {
  it("should give proper result", () => {
    const received = fixTimezone(new Date("Jul 03 1988"));
    expect(received.toString()).toBe(
      new Date("1988-07-03T00:00:00.000Z").toString()
    );
  });
});
