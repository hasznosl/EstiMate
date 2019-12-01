import zoomingOut from "./zoomingOut";

const getCentralItem = ({ focalX, width, items }) => items[
  Math.ceil(focalX / width * items.length)
]

export default getCentralItem