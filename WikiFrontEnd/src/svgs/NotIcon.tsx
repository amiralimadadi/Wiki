import React from "react";

interface CustomIconProps {
  width?: string;
  height?: string;
  fill?: string;
  className?: string;
}

const NotFoundIcon: React.FC<CustomIconProps> = ({
  width = "100",
  height = "100",
  fill = "#DCE0E6",
  className = "",
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 130 130"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M42.678 9.953h50.237a2 2 0 0 1 2 2V36.91a2 2 0 0 1-2 2H42.678a2 2 0 0 1-2-2V11.953a2 2 0 0 1 2-2zM42.94 49.767h49.713a2.262 2.262 0 1 1 0 4.524H42.94a2.262 2.262 0 0 1 0-4.524zM42.94 61.53h49.713a2.262 2.262 0 1 1 0 4.525H42.94a2.262 2.262 0 0 1 0-4.525zM121.813 105.032c-.775 3.071-3.497 5.36-6.735 5.36H20.515c-3.238 0-5.96-2.29-6.734-5.36a7.309 7.309 0 0 1-.222-1.79V69.675h26.318c2.907 0 5.25 2.448 5.25 5.42v.04c0 2.971 2.37 5.37 5.277 5.37h34.785c2.907 0 5.277-2.421 5.277-5.393V75.1c0-2.972 2.343-5.426 5.25-5.426h26.318v33.569c0 .617-.077 1.216-.221 1.789z"
        fill={fill}
      />
    </svg>
  );
};

export default NotFoundIcon;
