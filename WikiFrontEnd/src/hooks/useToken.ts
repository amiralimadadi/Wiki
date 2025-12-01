import { useMemo } from "react";

const useAuthHeader = () => {
  return useMemo(() => {
    const token = localStorage.getItem("sessionId");
    if (!token) return {};

    const authHeader = token.startsWith("Bearer ") ? token : `Bearer ${token}`;

    return {
      Authorization: authHeader,
    };
  }, []);
};

export default useAuthHeader;
