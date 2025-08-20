// src/lib/api.js
import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // 예: http://localhost:3000
  withCredentials: true,                 // ✅ 쿠키 주고받기
});
