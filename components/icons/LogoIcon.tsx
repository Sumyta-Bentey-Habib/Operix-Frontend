import React from "react";
import { IconProps } from "./types";

export * from "./types";

export const LogoIcon: React.FC<IconProps> = ({
  className = "",
  size = 32,
  color,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect width="32" height="32" rx="16" fill={color || "#059669"} />
    <path
      d="M16 8C11.5817 8 8 11.5817 8 16C8 20.4183 11.5817 24 16 24C20.4183 24 24 20.4183 24 16C24 11.5817 20.4183 8 16 8ZM20.2 16.8C18.8 19.2 15.6 20.4 13.2 19C10.8 17.6 10 14.4 11.4 12C12.8 9.6 16 8.8 18.4 10.2C19.8 11 20.6 12.4 20.8 14H16V17.2H20.4C20.4 17.1 20.3 16.9 20.2 16.8Z"
      fill="white"
    />
  </svg>
);
