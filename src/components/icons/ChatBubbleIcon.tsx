import React from "react";
import { IconProps } from "./types";

export const ChatBubbleIcon: React.FC<IconProps> = ({
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
    <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" />
  </svg>
);
