import React from "react";
import { IconProps } from "./types";

export const DashboardIcon: React.FC<IconProps> = ({
  className = "",
  size = 20,
  color = "currentColor",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect x="3" y="3" width="8" height="8" rx="2" fill={color} />
    <rect x="13" y="3" width="8" height="8" rx="2" fill={color} fillOpacity="0.4" />
    <rect x="3" y="13" width="8" height="8" rx="2" fill={color} fillOpacity="0.4" />
    <rect x="13" y="13" width="8" height="8" rx="2" fill={color} fillOpacity="0.4" />
  </svg>
);
