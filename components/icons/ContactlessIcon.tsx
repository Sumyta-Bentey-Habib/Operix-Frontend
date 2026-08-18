import React from "react";
import { IconProps } from "./types";

export const ContactlessIcon: React.FC<IconProps> = ({
  className = "",
  size = 20,
  color = "white",
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
      d="M8.5 16.5C10.5 14.5 10.5 10.5 8.5 8.5"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M12 19C15.5 15.5 15.5 8.5 12 5"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M15.5 21.5C20.5 16.5 20.5 6.5 15.5 1.5"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);
