import React from "react";

export interface SparklineSvgProps {
  className?: string;
  width?: number;
  height?: number;
}

export const SparklineSvg: React.FC<SparklineSvgProps> = ({
  className = "",
  width = 140,
  height = 36,
}) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 140 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M3 26C15 26 24 30 36 28C48 26 56 16 68 18C80 20 90 12 102 14C114 16 122 8 137 6"
      stroke="#05A86B"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
