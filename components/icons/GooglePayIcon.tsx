import React from "react";
import { IconProps } from "./types";

export const GooglePayIcon: React.FC<IconProps> = ({
  className = "",
  size = 32,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <circle cx="16" cy="16" r="16" fill="#F3F4F6" />
    <path
      d="M23.6 16.2C23.6 15.6 23.5 15.1 23.4 14.6H16V17.7H20.3C20.1 18.7 19.5 19.6 18.6 20.2V22.2H21.3C22.9 20.7 23.6 18.6 23.6 16.2Z"
      fill="#4285F4"
    />
    <path
      d="M16 24C18.2 24 20 23.3 21.3 22.2L18.6 20.2C17.9 20.7 17 21 16 21C13.9 21 12.1 19.6 11.5 17.6H8.7V19.7C10.1 22.4 12.8 24 16 24Z"
      fill="#34A853"
    />
    <path
      d="M11.5 17.6C11.3 17.1 11.2 16.6 11.2 16C11.2 15.4 11.3 14.9 11.5 14.4V12.3H8.7C8.1 13.4 7.8 14.7 7.8 16C7.8 17.3 8.1 18.6 8.7 19.7L11.5 17.6Z"
      fill="#FBBC05"
    />
    <path
      d="M16 11C17.2 11 18.3 11.4 19.1 12.2L21.4 9.9C19.9 8.6 18.1 7.8 16 7.8C12.8 7.8 10.1 9.4 8.7 12.1L11.5 14.2C12.1 12.3 13.9 11 16 11Z"
      fill="#EA4335"
    />
  </svg>
);
