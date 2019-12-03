import { Line, G } from "react-native-svg";
import { xAxis, lineColor, yAxis } from "../styles";
import React from 'react'

const Axes = ({ height, width }) => <G>
  {/* X axis */}
  <Line
    x1={0}
    y1={height - xAxis.outerMargin}
    x2={width}
    y2={height - xAxis.outerMargin}
    stroke={lineColor}
    strokeWidth={1}
  />
  {/* Y Axis */}
  <Line
    x1={yAxis.outerMargin}
    y1={height}
    x2={yAxis.outerMargin}
    y2={0}
    stroke={lineColor}
    strokeWidth={1}
  />
</G>

export default Axes