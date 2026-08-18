import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Mail, MoveLeft } from "lucide-react";
import { BrandPanel } from "./BrandPanel";
import "./Auth.css";

export default function ForgotPassword() {
  const { t } = useTranslation();
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");

  return (
    <div className="auth-shell">
      <BrandPanel />
      <div className="auth-form-panel">
        <div className="auth-card">
          {!sent ? (
            <>
              <div className="auth-card-header">
                <h1 className="auth-title">{t("auth.forgotPassword.title")}</h1>
                <p className="auth-subtitle">{t("auth.forgotPassword.subtitle")}</p>
              </div>
              <form
                className="stack gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  setSent(true);
                }}
              >
                <div className="field">
                  <label className="field-label" htmlFor="email">{t("auth.login.email")}</label>
                  <div className="input-with-icon">
                    <Mail size={16} />
                    <input id="email" type="email" className="input" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary btn-lg btn-block">
                  {t("auth.forgotPassword.submit")}
                </button>
              </form>
            </>
          ) : (
            <div className="stack gap-4">
              <div className="empty-state-icon confirm-icon-neutral" style={{ marginBottom: 0 }}>
                <Mail size={24} />
              </div>
              <h1 className="auth-title">{t("auth.forgotPassword.sentTitle")}</h1>
              <p className="auth-subtitle">{t("auth.forgotPassword.sentMessage", { email })}</p>
            </div>
          )}

          <Link to="/login" className="auth-footer-note" style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
            <MoveLeft size={14} /> {t("auth.forgotPassword.backToLogin")}
          </Link>
        </div>
      </div>
    </div>
  );
}
