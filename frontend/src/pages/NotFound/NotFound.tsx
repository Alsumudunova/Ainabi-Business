import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Compass } from "lucide-react";

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 16, textAlign: "center", padding: 24 }}>
      <div className="empty-state-icon confirm-icon-neutral" style={{ marginBottom: 0 }}>
        <Compass size={26} />
      </div>
      <h1 style={{ fontSize: "var(--font-size-2xl)", fontWeight: 800 }}>{t("notFound.title")}</h1>
      <p className="text-muted">{t("notFound.subtitle")}</p>
      <Link to="/" className="btn btn-primary">
        {t("notFound.backHome")}
      </Link>
    </div>
  );
}
