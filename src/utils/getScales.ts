import { yAxis, xAxis } from "../styles";
import * as d3 from "d3";
import { min, max } from "lodash";
import { IXYDataType } from "./types";

const getScales = (
  {
    width,
    xyData,
    height
  }: {
    width: number,
    xyData: ReadonlyArray<IXYDataType>,
    height: number
  }) => {

  return ({
    scaleX: d3
      .scaleTime()
      .domain([new Date(xyData[0].x), new Date(xyData[xyData.length - 1].x)])
      .range([yAxis.outerMargin, width - (yAxis.innerMargin + yAxis.outerMargin)]),
    scaleY: d3
      .scaleLinear()
      .domain([min(xyData.map(dat => dat.y)), max(xyData.map(dat => dat.y))])
      .range([height - xAxis.outerMargin, 0])
  })
}

export default getScales