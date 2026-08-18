import React from "react";
import { IconProps } from "./types";

export const WorkspaceIcon: React.FC<IconProps> = ({
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
    <rect
      x="3"
      y="4"
      width="18"
      height="16"
      rx="2"
      stroke={color}
      strokeWidth="1.75"
    />
    <path d="M3 10H21" stroke={color} strokeWidth="1.75" />
    <path d="M10 10V20" stroke={color} strokeWidth="1.75" />
  </svg>
);
