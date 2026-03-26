import { apiClient } from './client';

// 🔐 LOGIN
export const login = async (data: any) => {
  // If admin mode is requested, use strict fixed admin endpoint.
  if (data?.mode === 'admin') {
    const { email, password } = data;
    const res = await apiClient.post("/api/auth/admin/login", { email, password });
    return res.data;
  }

  const res = await apiClient.post("/api/auth/login", data);
  return res.data;
};

// 📝 REGISTER
export const register = async (data: any) => {
  const res = await apiClient.post("/api/auth/register", data);
  return res.data;
};

// 🔢 VERIFY OTP
export const verifyOTP = async (data: any) => {
  const res = await apiClient.post("/api/auth/verify-otp", data);
  return res.data;
};

// 🔑 FORGOT PASSWORD
export const forgotPassword = async (email: string) => {
  const res = await apiClient.post("/api/auth/forgot-password", { email });
  return res.data;
};

// 👤 GET USER
export const getMe = async (token: string) => {
  const res = await apiClient.get("/api/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return res.data;
};