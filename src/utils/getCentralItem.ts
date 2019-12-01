const getCentralItem = ({ focalX, width, items }) => items[
  Math.ceil(focalX / width * items.length) - 1
]

export default getCentralItem