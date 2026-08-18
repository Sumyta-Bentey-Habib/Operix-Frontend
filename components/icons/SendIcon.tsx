import React from "react";
import { IconProps } from "./types";

export const SendIcon: React.FC<IconProps> = ({
  className = "",
  size = 16,
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
    <path
      d="M7 17L17 7M17 7H7M17 7V17"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
