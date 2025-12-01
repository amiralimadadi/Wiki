import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

type ProtectedRouteProps = {
  children: ReactNode;
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const token = localStorage.getItem("sessionId");
  const refreshToken = localStorage.getItem("refreshToken");

  if (!token || !refreshToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
