import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import i18n, { LANGUAGE_HEADER, LANGUAGE_STORAGE_KEY } from "../i18n";
import { emitAuthLogout, tokenStore } from "./tokenStore";
import type { AuthResponse } from "../types";

// In local dev this stays "/api" and Vite's dev-server proxy forwards it to
// the backend (see vite.config.ts). In production, set VITE_API_URL to the
// deployed backend's origin (e.g. https://ainabi-api.up.railway.app) when
// the frontend and backend live on different domains (Vercel + Railway).
const API_BASE_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : "/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  // The refresh token travels only as an httpOnly cookie — this makes the
  // browser send/accept it across origins (Vercel frontend, Railway backend).
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = tokenStore.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Read straight from localStorage (not the i18next instance) to avoid a
  // circular import between api.ts and i18n/index.ts — this key is the
  // same one i18next-browser-languagedetector reads/writes.
  const lang = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (lang) {
    config.headers[LANGUAGE_HEADER] = lang;
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  try {
    const { data } = await axios.post<AuthResponse>(`${API_BASE_URL}/auth/refresh`, null, { withCredentials: true });
    tokenStore.setAccessToken(data.accessToken);
    return data.accessToken;
  } catch {
    return null;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const isAuthRoute = original?.url?.includes("/auth/login") || original?.url?.includes("/auth/register") || original?.url?.includes("/auth/google");

    if (error.response?.status === 401 && original && !original._retry && !isAuthRoute) {
      original._retry = true;

      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }

      const newToken = await refreshPromise;
      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      }

      tokenStore.clear();
      emitAuthLogout();
    }

    return Promise.reject(error);
  },
);

export function extractErrorMessage(error: unknown, fallback?: string): string {
  const resolvedFallback = fallback ?? i18n.t("common.errorGeneric");
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    if (data?.message) return data.message;
  }
  return resolvedFallback;
}

export { refreshAccessToken };
