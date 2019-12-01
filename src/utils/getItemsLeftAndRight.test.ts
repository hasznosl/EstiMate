import getItemsLeftAndRight from "./getItemsLeftAndRight";

describe('getItemsLeftAndRight', () => {
  it('should return correct values', () => {
    expect(getItemsLeftAndRight({
      items: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      scale: 3
    })).toBe(3)
    expect(getItemsLeftAndRight({
      items: [1],
      scale: 1
    })).toBe(1)
    expect(getItemsLeftAndRight({
      items: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      scale: 2
    })).toBe(4)
  })
})