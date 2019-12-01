import getCentralItem from "./getCentralItem";

describe('getCentralItem', () => {
  it('should return the central item for the related focalX / width ratio if the number of items is odd', () => {
    expect(getCentralItem({
      focalX: 100,
      width: 200,
      items: [0, 1, 2, 3, 4, 5, 6, 7, 8]
    })).toBe(4)
  })

  it('should return the central-left item for the related focalX / width ratio if the number of items is even', () => {
    expect(getCentralItem({
      focalX: 100,
      width: 200,
      items: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    })).toBe(4)
  })

  it('should return the central-left item for a different focalX / width ratio if the number of items is even', () => {
    expect(getCentralItem({
      focalX: 100,
      width: 400,
      items: [0, 1, 2, 3]
    })).toBe(0)
  })

  it('should return the central-left item for a different focalX / width ratio if the number of items is odd', () => {
    expect(getCentralItem({
      focalX: 300,
      width: 400,
      items: [0, 1, 2]
    })).toBe(2)
  })

  it('other tests', () => {
    expect(getCentralItem({
      focalX: 100,
      width: 200,
      items: [0, 1]
    })).toBe(0)

    expect(getCentralItem({
      focalX: 100,
      width: 200,
      items: [0, 1, 2]
    })).toBe(1)

  })
})