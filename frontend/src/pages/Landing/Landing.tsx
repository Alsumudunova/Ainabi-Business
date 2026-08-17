import { Navigate, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Instagram,
  MessageCircle,
  Package,
  ShoppingCart,
  UserPlus,
  Users,
  Wallet,
  Warehouse,
  Zap,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import "./Landing.css";

const FEATURES = [
  {
    icon: Package,
    title: "Товарлар",
    text: "Товар, категория, штрих-код, сатып алуу жана сатуу баасын бир жерден башкарыңыз. Пайда автоматтык эсептелет.",
  },
  {
    icon: ShoppingCart,
    title: "Тез сатуу (POS)",
    text: "Кассада бир нече кликте сатуу — штрих-код менен издөө, накталай/карта/QR/карыз төлөм ыкмалары.",
  },
  {
    icon: Warehouse,
    title: "Склад көзөмөлү",
    text: "Ар бир сатуудан кийин склад автоматтык азаят. Аз калган товар боюнча эскертүү аласыз.",
  },
  {
    icon: Users,
    title: "Кардарлар",
    text: "Ар бир кардардын сатып алуу тарыхын, байланышын бир жерден көрүп, башкарыңыз.",
  },
  {
    icon: Wallet,
    title: "Карыз дептери",
    text: "Ким канча карыз экенин, качан төлөгөнүн так эсепте кармаңыз — блокнотко муктаж болбойсуз.",
  },
  {
    icon: BarChart3,
    title: "Отчеттор",
    text: "Күндөлүк, жумалык, айлык отчеттор — сатуу, пайда, чыгым бир караганда көрүнөт.",
  },
];

const STEPS = [
  {
    title: "Катталыңыз",
    text: "Аты жана бизнесиңиздин атын киргизиңиз, же Google аккаунтуңуз менен бир кликте кириңиз.",
  },
  {
    title: "Товарларыңызды кошуңуз",
    text: "Товардын атын, баасын, санын киргизиңиз — биринчи товарды 1 мүнөттө кошосуз.",
  },
  {
    title: "Сатууну баштаңыз",
    text: "Тез сатуу (POS) экраны аркылуу кассада сатып, калганын система өзү эсептейт.",
  },
];

export default function Landing() {
  const { session, isLoading } = useAuth();
  const navigate = useNavigate();

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
          <button className="btn btn-ghost" onClick={() => navigate("/login")}>
            Кирүү
          </button>
          <button className="btn btn-primary" onClick={() => navigate("/register")}>
            Катталуу
          </button>
        </div>
      </nav>

      <section className="landing-hero">
        <div>
          <span className="landing-eyebrow">
            <Zap size={13} /> Кыргызстандагы бизнес үчүн жасалган
          </span>
          <h1>Дүкөнүңүздү бир жерден толук башкарыңыз</h1>
          <p className="landing-hero-subtitle">
            Товар, сатуу, склад, кардар жана карыз эсебин заманбап, жөнөкөй системада алып барыңыз. Компьютерди
            жакшы билбесеңиз да, 1-2 мүнөттө негизги функцияларды үйрөнөсүз.
          </p>
          <div className="landing-hero-actions">
            <button className="btn btn-primary btn-lg" onClick={() => navigate("/register")}>
              Акысыз баштоо <ArrowRight size={18} />
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => navigate("/login")}>
              Аккаунтум бар, кирем
            </button>
          </div>
          <div className="landing-hero-points">
            <span className="landing-hero-point">
              <CheckCircle2 size={16} /> Карта талап кылынбайт
            </span>
            <span className="landing-hero-point">
              <CheckCircle2 size={16} /> 2 мүнөттө баштайсыз
            </span>
            <span className="landing-hero-point">
              <CheckCircle2 size={16} /> Кыргызча интерфейс
            </span>
          </div>
        </div>
        <div className="landing-hero-image">
          <img src="/og-banner.png" alt="Ainabi Business" />
        </div>
      </section>

      <section className="landing-section">
        <div className="landing-section-header">
          <h2 className="landing-section-title">Эмне үчүн Ainabi Business?</h2>
          <p className="landing-section-subtitle">Бизнесиңизди жүргүзүү үчүн керектүүнүн баары — бир жерде.</p>
        </div>
        <div className="landing-features">
          {FEATURES.map((f) => (
            <div className="landing-feature-card" key={f.title}>
              <div className="landing-feature-icon">
                <f.icon size={22} />
              </div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-section">
        <div className="landing-section-header">
          <h2 className="landing-section-title">Кантип башталат?</h2>
          <p className="landing-section-subtitle">Үч жөнөкөй кадам — техникалык билим талап кылынбайт.</p>
        </div>
        <div className="landing-steps">
          {STEPS.map((s, i) => (
            <div className="landing-step" key={s.title}>
              <div className="landing-step-number">{i + 1}</div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="landing-cta">
        <h2>Дүкөнүңүздү бүгүн эле санарипке өткөрүңүз</h2>
        <p>Катталуу акысыз — карта талап кылынбайт.</p>
        <div className="landing-cta-actions">
          <button className="btn btn-secondary btn-lg" onClick={() => navigate("/register")}>
            <UserPlus size={18} /> Азыр катталуу
          </button>
        </div>
      </div>

      <footer className="landing-footer">
        <span>© {new Date().getFullYear()} Ainabi Business</span>
        <div className="landing-footer-contacts">
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
