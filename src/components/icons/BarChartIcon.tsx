import React from "react";
import { IconProps } from "./types";

export const BarChartIcon: React.FC<IconProps> = ({
  className = "",
  size = 18,
  color = "#059669",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect x="3" y="12" width="4" height="9" rx="1.5" fill={color} fillOpacity="0.5" />
    <rect x="10" y="4" width="4" height="17" rx="1.5" fill={color} />
    <rect x="17" y="8" width="4" height="13" rx="1.5" fill={color} fillOpacity="0.75" />
  </svg>
);
