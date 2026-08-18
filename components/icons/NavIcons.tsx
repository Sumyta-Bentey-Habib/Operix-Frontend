import React from "react";
import { IconProps } from "./LogoIcon";

export const DashboardIcon: React.FC<IconProps> = ({
  className = "",
  size = 20,
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
    <rect x="3" y="3" width="8" height="8" rx="2" fill={color} />
    <rect x="13" y="3" width="8" height="8" rx="2" fill={color} fillOpacity="0.4" />
    <rect x="3" y="13" width="8" height="8" rx="2" fill={color} fillOpacity="0.4" />
    <rect x="13" y="13" width="8" height="8" rx="2" fill={color} fillOpacity="0.4" />
  </svg>
);

export const DocumentsIcon: React.FC<IconProps> = ({
  className = "",
  size = 20,
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
      d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14 2V8H20"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 13H8"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 17H8"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10 9H8"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const ReportsIcon: React.FC<IconProps> = ({
  className = "",
  size = 20,
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
      d="M18 20V10"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 20V4"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6 20V14"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const WorkspaceIcon: React.FC<IconProps> = ({
  className = "",
  size = 20,
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
    <rect
      x="3"
      y="4"
      width="18"
      height="16"
      rx="2"
      stroke={color}
      strokeWidth="1.75"
    />
    <path d="M3 10H21" stroke={color} strokeWidth="1.75" />
    <path d="M10 10V20" stroke={color} strokeWidth="1.75" />
  </svg>
);

export const HistoryIcon: React.FC<IconProps> = ({
  className = "",
  size = 20,
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
    <circle
      cx="12"
      cy="12"
      r="9"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 7V12L15 15"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const ContactsIcon: React.FC<IconProps> = ({
  className = "",
  size = 20,
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
      d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle
      cx="9"
      cy="7"
      r="4"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const SettingsIcon: React.FC<IconProps> = ({
  className = "",
  size = 20,
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
    <circle
      cx="12"
      cy="12"
      r="3"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M19.4 15A1.65 1.65 0 0 0 19.73 16.82L19.8 16.91C20.08 17.38 19.88 17.98 19.38 18.27L17.65 19.27C17.15 19.56 16.51 19.39 16.2 18.89L16.14 18.8A1.65 1.65 0 0 0 14.32 18.47A1.65 1.65 0 0 0 13.5 19.89V20C13.5 20.55 13.05 21 12.5 21H10.5C9.95 21 9.5 20.55 9.5 20V19.89A1.65 1.65 0 0 0 8.68 18.47A1.65 1.65 0 0 0 6.86 18.8L6.8 18.89C6.49 19.39 5.85 19.56 5.35 19.27L3.62 18.27C3.12 17.98 2.92 17.38 3.2 16.91L3.27 16.82A1.65 1.65 0 0 0 3.6 15A1.65 1.65 0 0 0 2.18 14.18H2.07C1.52 14.18 1.07 13.73 1.07 13.18V11.18C1.07 10.63 1.52 10.18 2.07 10.18H2.18A1.65 1.65 0 0 0 3.6 9.36A1.65 1.65 0 0 0 3.27 7.54L3.2 7.45C2.92 6.98 3.12 6.38 3.62 6.09L5.35 5.09C5.85 4.8 6.49 4.97 6.8 5.47L6.86 5.56A1.65 1.65 0 0 0 8.68 5.89A1.65 1.65 0 0 0 9.5 4.47V4.36C9.5 3.81 9.95 3.36 10.5 3.36H12.5C13.05 3.36 13.5 3.81 13.5 4.36V4.47A1.65 1.65 0 0 0 14.32 5.89A1.65 1.65 0 0 0 16.14 5.56L16.2 5.47C16.51 4.97 17.15 4.8 17.65 5.09L19.38 6.09C19.88 6.38 20.08 6.98 19.8 7.45L19.73 7.54A1.65 1.65 0 0 0 19.4 9.36A1.65 1.65 0 0 0 20.82 10.18H20.93C21.48 10.18 21.93 10.63 21.93 11.18V13.18C21.93 13.73 21.48 14.18 20.93 14.18H20.82A1.65 1.65 0 0 0 19.4 15Z"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const LogoutIcon: React.FC<IconProps> = ({
  className = "",
  size = 20,
  color = "#EF4444",
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
      d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 17L21 12L16 7"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M21 12H9"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
