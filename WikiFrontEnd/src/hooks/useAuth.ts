import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
// @ts-expect-error لازم به دلیل ناسازگاری تایپ‌ها
import { checkTokenValidity } from "../utils/checkTokenValidity";

const useAuth = (): void => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const isAuthenticated = await checkTokenValidity();
      if (!isAuthenticated) {
        navigate("/login");
      }
    };

    checkAuth();

    const interval = setInterval(checkAuth, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [navigate]);
};

export default useAuth;
