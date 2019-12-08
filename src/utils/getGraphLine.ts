import * as d3 from "d3";
import { IXYDataType } from "./types";

const getGraphLine = ({ scaleX, scaleY, xyData }:
  {
    scaleX: (x: Date) => number
    scaleY: (y: number) => number
    xyData: ReadonlyArray<IXYDataType>
  }) => d3
    .line()
    .x(d => scaleX(new Date(d.x)))
    .y(d => scaleY(d.y))
    .curve(d3.curveBasis)(xyData);

export default getGraphLine