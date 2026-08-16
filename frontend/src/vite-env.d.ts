/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID?: string;
  /** Deployed backend origin, no trailing slash (e.g. https://ainabi-api.up.railway.app). Omit for local dev. */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/** Minimal typing for the Google Identity Services script (loaded via <script> in index.html). */
interface GoogleIdCredentialResponse {
  credential: string;
}

interface Window {
  google?: {
    accounts: {
      id: {
        initialize: (config: { client_id: string; callback: (response: GoogleIdCredentialResponse) => void }) => void;
        renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
        prompt: () => void;
      };
    };
  };
}
