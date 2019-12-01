import zoomingOut from "./zoomingOut";

const getInternalScale = ({ scale }) => zoomingOut({ scale }) ?
  1 :
  scale * 2 // make the scale more sensitive

export default getInternalScale