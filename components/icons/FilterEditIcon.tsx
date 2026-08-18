import React from "react";
import { IconProps } from "./types";

export const FilterEditIcon: React.FC<IconProps> = ({
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
      d="M4 21V14"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4 10V3"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 21V12"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 8V3"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M20 21V16"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M20 12V3"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle
      cx="4"
      cy="12"
      r="2"
      stroke={color}
      strokeWidth="1.75"
    />
    <circle
      cx="12"
      cy="10"
      r="2"
      stroke={color}
      strokeWidth="1.75"
    />
    <circle
      cx="20"
      cy="14"
      r="2"
      stroke={color}
      strokeWidth="1.75"
    />
  </svg>
);
