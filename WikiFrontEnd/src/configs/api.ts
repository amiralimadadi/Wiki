import axios from "axios";
// 📁 src/config/api.ts

export const baseUrlForDownload = "http://192.168.168.13:6066";
//export const baseUrlForDownload = "http://172.30.1.48:6066";

const api = axios.create({
baseURL: "http://192.168.168.13:6066/api/",
//baseURL: "http://172.30.1.48:6066/api/",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  (req) => {
    const accessToken = localStorage.getItem("sessionId");

    if (accessToken) {
      req.headers["Authorization"] = accessToken.startsWith("Bearer ")
        ? accessToken
        : `Bearer ${accessToken}`;
    }

    return req;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
