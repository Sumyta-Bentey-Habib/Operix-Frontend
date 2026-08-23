import React from "react";
import { IconProps } from "./types";

export const HeartIcon: React.FC<IconProps> = ({
  className = "",
  size = 22,
  color = "currentColor",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color === "currentColor" ? "currentColor" : color}
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" />
  </svg>
);
