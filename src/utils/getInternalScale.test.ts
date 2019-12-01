import getInternalScale from "./getInternalScale";

describe('getInternalScale', () => {
  it('should return 1 if we try to zoom out', () => {
    expect(getInternalScale({ scale: 0.999 })).toBe(1)
  })

  it('should return 1 if scale is 1', () => {
    expect(getInternalScale({ scale: 1 })).toBe(1)
  })

  it('should return 2 * scale if we are zooming in', () => {
    expect(getInternalScale({ scale: 1.0001 })).toBe(2.0002)
  })
})