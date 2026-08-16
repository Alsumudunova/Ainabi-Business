/**
 * The access token lives in memory only — never in localStorage — so an XSS
 * payload can't read it out of storage. It's short-lived (15 min) and gets
 * silently re-issued from the httpOnly refresh cookie on page load / expiry.
 */
let accessToken: string | null = null;

export const tokenStore = {
  getAccessToken(): string | null {
    return accessToken;
  },
  setAccessToken(token: string) {
    accessToken = token;
  },
  clear() {
    accessToken = null;
  },
};

/** Dispatched when the session can no longer be refreshed — AuthContext listens and redirects to /login. */
export const AUTH_LOGOUT_EVENT = "ainabi:auth-logout";

export function emitAuthLogout() {
  window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT));
}
