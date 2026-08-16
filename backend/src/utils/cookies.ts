import { Response } from "express";
import { env, isProduction } from "../config/env";

const REFRESH_COOKIE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function cookieOptions() {
  return {
    httpOnly: true,
    // SameSite=None requires Secure — only safe to force on once we know
    // we're actually serving HTTPS (isProduction), so cross-site cookies
    // never silently fail (or worse, get sent) over plain HTTP.
    secure: isProduction,
    sameSite: (env.cookieCrossSite && isProduction ? "none" : "lax") as "none" | "lax",
    path: "/api/auth",
  };
}

/**
 * The refresh token never touches the JSON body or localStorage — it lives
 * only in an httpOnly cookie, scoped to /api/auth, so an XSS payload cannot
 * read it out of the page's JS context.
 */
export function setRefreshCookie(res: Response, token: string) {
  res.cookie(env.refreshCookieName, token, { ...cookieOptions(), maxAge: REFRESH_COOKIE_MAX_AGE_MS });
}

export function clearRefreshCookie(res: Response) {
  res.clearCookie(env.refreshCookieName, cookieOptions());
}
