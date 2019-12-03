import { yAxis, xAxis } from "../styles";
import * as d3 from "d3";
import { min, max } from "lodash";

const getScales = ({ startDate, endDate, width, data, height }) => ({
  scaleX: d3
    .scaleTime()
    .domain([new Date(startDate), new Date(endDate)])
    .range([yAxis.outerMargin, width - (yAxis.innerMargin + yAxis.outerMargin)]),
  scaleY: d3
    .scaleLinear()
    .domain([min(data.map(dat => dat.y)), max(data.map(dat => dat.y))])
    .range([height - xAxis.outerMargin, 0])
})

export default getScales