import React from "react";
import { IconProps } from "./types";

export const SparklesIcon: React.FC<IconProps> = ({
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
      d="M12 3L14.39 8.26L20 9.27L15.82 13.14L16.94 18.73L12 15.9L7.06 18.73L8.18 13.14L4 9.27L9.61 8.26L12 3Z"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
