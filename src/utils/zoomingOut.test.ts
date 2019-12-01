import zoomingOut from "./zoomingOut";

describe('zoomingOut', () => {
  it(`should return true, when scale < 1`, () => {
    expect(zoomingOut({ scale: 0.5 })).toBe(true)
  })
  it(`should return false, when scale = 1`, () => {
    expect(zoomingOut({ scale: 1 })).toBe(false)
  })
  it(`should return false, when scale > 1`, () => {
    expect(zoomingOut({ scale: 1.5 })).toBe(false)
  })
})