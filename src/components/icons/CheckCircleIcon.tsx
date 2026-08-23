import React from "react";
import { IconProps } from "./types";

export const CheckCircleIcon: React.FC<IconProps> = ({
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
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.75" />
    <path
      d="M8.5 12.5L10.5 14.5L15.5 9.5"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
