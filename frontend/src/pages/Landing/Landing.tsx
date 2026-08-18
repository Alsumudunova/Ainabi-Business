import { Link, Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Instagram,
  LayoutDashboard,
  MessageCircle,
  Package,
  ShoppingCart,
  UserPlus,
  Users,
  Wallet,
  Warehouse,
  X,
  Zap,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { GuideAccordion } from "../../components/GuideAccordion";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";
import { useGuideSections } from "../../data/guideSections";
import "./Landing.css";

interface Problem { before: string; after: string }
interface Feature { title: string; text: string }
interface Step { title: string; text: string }
interface DailyItem { title: string; text: string }

const FEATURE_ICONS = [Package, ShoppingCart, Warehouse, Users, Wallet, BarChart3];
const DAILY_ICONS = [LayoutDashboard, ShoppingCart, Warehouse, BarChart3];

export default function Landing() {
  const { t } = useTranslation();
  const { session, isLoading } = useAuth();
  const navigate = useNavigate();
  const guideSections = useGuideSections();

  const problems = t("landing.problems.items", { returnObjects: true }) as Problem[];
  const features = t("landing.features.items", { returnObjects: true }) as Feature[];
  const steps = t("landing.steps.items", { returnObjects: true }) as Step[];
  const dailyUse = t("landing.daily.items", { returnObjects: true }) as DailyItem[];

  // Already signed in — no reason to see the marketing page every visit.
  if (!isLoading && session) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="landing-brand">
          <span className="landing-brand-mark">AB</span>
          <span>Ainabi Business</span>
        </div>
        <div className="landing-nav-actions">
          <LanguageSwitcher />
          <button className="btn btn-ghost" onClick={() => navigate("/login")}>
            {t("landing.nav.login")}
          </button>
          <button className="btn btn-primary" onClick={() => navigate("/register")}>
            {t("landing.nav.register")}
          </button>
        </div>
      </nav>

      <section className="landing-hero">
        <div>
          <span className="landing-eyebrow">
            <Zap size={13} /> {t("landing.hero.eyebrow")}
          </span>
          <h1>{t("landing.hero.title")}</h1>
          <p className="landing-hero-subtitle">{t("landing.hero.subtitle")}</p>
          <div className="landing-hero-actions">
            <button className="btn btn-primary btn-lg" onClick={() => navigate("/register")}>
              {t("landing.hero.ctaPrimary")} <ArrowRight size={18} />
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => navigate("/login")}>
              {t("landing.hero.ctaSecondary")}
            </button>
          </div>
          <div className="landing-hero-points">
            <span className="landing-hero-point">
              <CheckCircle2 size={16} /> {t("landing.hero.point1")}
            </span>
            <span className="landing-hero-point">
              <CheckCircle2 size={16} /> {t("landing.hero.point2")}
            </span>
            <span className="landing-hero-point">
              <CheckCircle2 size={16} /> {t("landing.hero.point3")}
            </span>
          </div>
        </div>
        <div className="landing-hero-image">
          <img src="/og-banner.png" alt="Ainabi Business" />
        </div>
      </section>

      <section className="landing-section">
        <div className="landing-section-header">
          <h2 className="landing-section-title">{t("landing.problems.title")}</h2>
          <p className="landing-section-subtitle">{t("landing.problems.subtitle")}</p>
        </div>
        <div className="landing-problems">
          {problems.map((p) => (
            <div className="landing-problem-row" key={p.before}>
              <div className="landing-problem-before">
                <X size={16} />
                <span>{p.before}</span>
              </div>
              <ArrowRight className="landing-problem-arrow" size={18} />
              <div className="landing-problem-after">
                <CheckCircle2 size={16} />
                <span>{p.after}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-section">
        <div className="landing-section-header">
          <h2 className="landing-section-title">{t("landing.features.title")}</h2>
          <p className="landing-section-subtitle">{t("landing.features.subtitle")}</p>
        </div>
        <div className="landing-features">
          {features.map((f, i) => {
            const Icon = FEATURE_ICONS[i];
            return (
              <div className="landing-feature-card" key={f.title}>
                <div className="landing-feature-icon">
                  <Icon size={22} />
                </div>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="landing-section">
        <div className="landing-section-header">
          <h2 className="landing-section-title">{t("landing.steps.title")}</h2>
          <p className="landing-section-subtitle">{t("landing.steps.subtitle")}</p>
        </div>
        <div className="landing-steps">
          {steps.map((s, i) => (
            <div className="landing-step" key={s.title}>
              <div className="landing-step-number">{i + 1}</div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-section">
        <div className="landing-section-header">
          <h2 className="landing-section-title">{t("landing.daily.title")}</h2>
          <p className="landing-section-subtitle">{t("landing.daily.subtitle")}</p>
        </div>
        <div className="landing-daily">
          {dailyUse.map((d, i) => {
            const Icon = DAILY_ICONS[i];
            return (
              <div className="landing-daily-item" key={d.title}>
                <div className="landing-daily-icon">
                  <Icon size={20} />
                </div>
                <div className="landing-daily-body">
                  <span className="landing-daily-step">{t("landing.daily.step", { n: i + 1 })}</span>
                  <h3>{d.title}</h3>
                  <p>{d.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="landing-section">
        <div className="landing-section-header">
          <h2 className="landing-section-title">{t("landing.guide.title")}</h2>
          <p className="landing-section-subtitle">{t("landing.guide.subtitle")}</p>
        </div>
        <GuideAccordion sections={guideSections} />
      </section>

      <div className="landing-cta">
        <h2>{t("landing.cta.title")}</h2>
        <p>{t("landing.cta.subtitle")}</p>
        <div className="landing-cta-actions">
          <button className="btn btn-secondary btn-lg" onClick={() => navigate("/register")}>
            <UserPlus size={18} /> {t("landing.cta.button")}
          </button>
        </div>
      </div>

      <footer className="landing-footer">
        <span>© {new Date().getFullYear()} Ainabi Business</span>
        <div className="landing-footer-contacts">
          <Link to="/privacy" className="landing-footer-link">{t("landing.footer.privacy")}</Link>
          <Link to="/terms" className="landing-footer-link">{t("landing.footer.terms")}</Link>
          <a href="https://instagram.com/ainabi.studio" target="_blank" rel="noopener noreferrer" className="landing-footer-link">
            <Instagram size={16} /> @ainabi.studio
          </a>
          <a href="https://wa.me/996702952200" target="_blank" rel="noopener noreferrer" className="landing-footer-link">
            <MessageCircle size={16} /> +996 702 952 200
          </a>
        </div>
      </footer>
    </div>
  );
}
