import * as d3 from "d3";

const getGraphLine = ({ scaleX, scaleY, data }) => d3
  .line()
  .x(d => scaleX(d.x))
  .y(d => scaleY(d.y))
  .curve(d3.curveBasis)(data);

export default getGraphLine