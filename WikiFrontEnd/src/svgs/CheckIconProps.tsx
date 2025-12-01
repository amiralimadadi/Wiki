import React from "react";

interface CheckIconProps {
  size?: string | number;
  color?: string;
  className?: string;
}

const CheckIcon: React.FC<CheckIconProps> = ({
  size = "1em",
  color = "currentColor",
  className,
}) => {
  return (
    <svg
      stroke={color}
      fill={color}
      strokeWidth="0"
      viewBox="0 0 448 512"
      height={size}
      width={size}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      style={{ position: "relative", top: "1px" }}
    >
      <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"></path>
    </svg>
  );
};

export default CheckIcon;
