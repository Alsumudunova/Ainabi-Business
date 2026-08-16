import { useEffect, useRef, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { extractErrorMessage } from "../services/api";

// .trim() guards against a stray trailing newline/space from copy-pasting
// the value into a dashboard env var field — Google rejects a client_id
// that doesn't match byte-for-byte, so whitespace silently breaks sign-in.
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();

interface GoogleSignInButtonProps {
  onSuccess?: () => void;
}

/**
 * Renders Google's own "Sign in with Google" button via Google Identity
 * Services. The button hands us a signed idToken which the backend verifies
 * against GOOGLE_CLIENT_ID before creating/matching the account — this
 * component never sees or trusts anything beyond that token.
 */
export function GoogleSignInButton({ onSuccess }: GoogleSignInButtonProps) {
  const { loginWithGoogle } = useAuth();
  const { showToast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!CLIENT_ID || !containerRef.current) return;

    let cancelled = false;

    async function handleCredential(response: { credential: string }) {
      try {
        await loginWithGoogle(response.credential);
        if (!cancelled) onSuccess?.();
      } catch (error) {
        showToast({ variant: "error", title: "Google менен кирүү мүмкүн болбоду", message: extractErrorMessage(error) });
      }
    }

    function tryInit() {
      if (!window.google || !containerRef.current) {
        window.setTimeout(tryInit, 150);
        return;
      }
      window.google.accounts.id.initialize({ client_id: CLIENT_ID!, callback: handleCredential });
      window.google.accounts.id.renderButton(containerRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        width: 360,
        text: "continue_with",
        shape: "rectangular",
        logo_alignment: "center",
      });
      setReady(true);
    }
    tryInit();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!CLIENT_ID) return null;

  return (
    <div className="stack gap-2" style={{ alignItems: "center" }}>
      <div ref={containerRef} style={{ minHeight: ready ? undefined : 44, width: "100%", display: "flex", justifyContent: "center" }} />
    </div>
  );
}
