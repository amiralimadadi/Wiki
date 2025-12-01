import React from "react";

interface IconProps {
  size?: string | number;
  color?: string;
  className?: string;
}

const IconPdf: React.FC<IconProps> = ({
  size = "1em",
  color = "currentColor",
  className = "",
}) => {
  return (
    <svg
      stroke="currentColor"
      fill="none"
      strokeWidth="2"
      viewBox="0 0 24 24"
      aria-hidden="true"
      height={size}
      width={size}
      style={{ color }}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
};

export default IconPdf;
