import { Instagram, LifeBuoy, MessageCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { GuideAccordion } from "../../components/GuideAccordion";
import { useGuideSections } from "../../data/guideSections";
import "./Support.css";

export default function Support() {
  const { t } = useTranslation();
  const guideSections = useGuideSections();

  return (
    <div className="stack gap-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t("support.title")}</h1>
          <p className="page-subtitle">{t("support.subtitle")}</p>
        </div>
      </div>

      <div className="support-contacts">
        <a
          href="https://wa.me/996702952200"
          target="_blank"
          rel="noopener noreferrer"
          className="card card-hoverable support-contact-card"
        >
          <span className="support-contact-icon whatsapp">
            <MessageCircle size={24} />
          </span>
          <span className="support-contact-body">
            <span className="support-contact-label">WhatsApp</span>
            <span className="support-contact-value">+996 702 952 200</span>
          </span>
        </a>

        <a
          href="https://instagram.com/aibek__dev"
          target="_blank"
          rel="noopener noreferrer"
          className="card card-hoverable support-contact-card"
        >
          <span className="support-contact-icon instagram">
            <Instagram size={24} />
          </span>
          <span className="support-contact-body">
            <span className="support-contact-label">Instagram</span>
            <span className="support-contact-value">@aibek__dev</span>
          </span>
        </a>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">
              <LifeBuoy size={16} style={{ marginRight: 6, verticalAlign: -2 }} />
              {t("support.guideTitle")}
            </h2>
            <p className="card-subtitle">{t("support.guideSubtitle")}</p>
          </div>
        </div>
        <div className="card-pad">
          <GuideAccordion sections={guideSections} />
        </div>
      </div>
    </div>
  );
}
