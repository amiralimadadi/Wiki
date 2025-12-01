import React from "react";
import { Typography } from "antd";

const { Text } = Typography;

interface SafeTextProps {
  value?: string;
  fallback?: string;
  strong?: boolean;
}

const SafeText: React.FC<SafeTextProps> = ({
  value,
  fallback = "نامشخص",
  strong,
}) => {
  return strong ? (
    <Text strong>{value || fallback}</Text>
  ) : (
    <Text>{value || fallback}</Text>
  );
};

export default SafeText;
