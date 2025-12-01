import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  color?: string;
  size?: number | string;
}

const ArrowsIcon: React.FC<IconProps> = ({
  color = "currentColor",
  size = "1em",
  ...props
}) => {
  return (
    <svg
      stroke={color}
      fill={color}
      strokeWidth="0"
      viewBox="0 0 512 512"
      height={size}
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="32"
        d="m304 48 112 112-112 112m94.87-112H96m112 304L96 352l112-112m-94 112h302"
      />
    </svg>
  );
};

export default ArrowsIcon;
