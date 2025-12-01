// utils/auth.ts
export const hasValidToken = (): boolean => {
  const token = localStorage.getItem("sessionId");
  const refreshToken = localStorage.getItem("refreshToken");

  return !!(token || refreshToken);
};
