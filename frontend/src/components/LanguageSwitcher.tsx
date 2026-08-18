import { useTranslation } from "react-i18next";
import { Languages } from "lucide-react";
import { SUPPORTED_LANGUAGES } from "../i18n";
import "./LanguageSwitcher.css";

/** Small KY/RU toggle. Changing i18next's language also flips the axios
 * `X-App-Language` header (see services/api.ts) so backend error/validation
 * messages switch languages too. */
export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { i18n } = useTranslation();
  const current = i18n.language?.startsWith("ru") ? "ru" : "ky";

  return (
    <div className={`lang-switcher ${className}`}>
      <Languages size={14} className="lang-switcher-icon" />
      {SUPPORTED_LANGUAGES.map((lng) => (
        <button
          key={lng}
          type="button"
          className={`lang-switcher-btn ${current === lng ? "active" : ""}`}
          onClick={() => i18n.changeLanguage(lng)}
        >
          {lng.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
