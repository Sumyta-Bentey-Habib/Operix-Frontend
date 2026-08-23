import React from "react";
import { IconProps } from "./types";

export const CreditCardIcon: React.FC<IconProps> = ({
  className = "",
  size = 20,
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
    <rect x="2" y="5" width="20" height="14" rx="3" stroke={color} strokeWidth="1.75" />
    <path d="M2 10H22" stroke={color} strokeWidth="1.75" />
    <rect x="6" y="14" width="4" height="2" rx="0.5" fill={color} />
  </svg>
);
