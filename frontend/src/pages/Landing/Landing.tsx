import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  Instagram,
  LayoutDashboard,
  MessageCircle,
  Package,
  Receipt,
  ShoppingCart,
  Truck,
  UserCog,
  UserPlus,
  Users,
  Wallet,
  Warehouse,
  X,
  Zap,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import "./Landing.css";

const PROBLEMS = [
  {
    before: "Тетрадка жазган карызды кимдир бирөө төлөдүбү, унутуп каласызбы?",
    after: "Ар бир кардардын карызы автоматтык эсепте — качан, канча төлөгөнү дайыма так көрүнөт.",
  },
  {
    before: "Складда кайсы товар канча калганын так билбейсизби?",
    after: "Ар бир сатуудан кийин склад өзү азаят, аз калган товарды дароо көрөсүз.",
  },
  {
    before: "Айдын аягында чыныгы пайда канча болгонун эсептеп чыга албай жатасызбы?",
    after: "Дашборд ар дайым так сатуу, чыгым, пайда көрсөтөт — кол менен эсептөөнүн кереги жок.",
  },
  {
    before: "Кызматкериңиз канча сатты, эмне кылганын билбейсизби?",
    after: "Ар бир кызматкердин сатуусу өзүнчө эсепте — ким эмне кылганы дайыма көрүнөт.",
  },
  {
    before: "Жеткирүүчүгө канча карыз экениңизди унутуп каласызбы?",
    after: "Жеткирүүчүлөр бөлүмү канча алганыңызды, канча төлөгөнүңүздү так эсепте кармайт.",
  },
  {
    before: "Дүкөндүн абалын билүү үчүн ар дайым жерге барышыңыз керекпи?",
    after: "Телефон же компьютерден, кайдан болсо да — бизнесиңизди толук көрөсүз.",
  },
];

const DAILY_USE = [
  {
    icon: LayoutDashboard,
    title: "Күндү Дашборддон баштаңыз",
    text: "Бүгүнкү сатуу, пайда жана аз калган товарды бир караганда көрөсүз.",
  },
  {
    icon: ShoppingCart,
    title: "Сатуу учурунда — Тез сатуу (POS)",
    text: "Товарды тандап, төлөм ыкмасын басып, бир нече секундда сатууну аяктайсыз.",
  },
  {
    icon: Warehouse,
    title: "Товар келгенде — Склад",
    text: "Жаңы келген товарды «Киреше» катары катташыз — баа жана калдык өзү жаңырат.",
  },
  {
    icon: BarChart3,
    title: "Күн аягында — Отчеттор",
    text: "Канча сатылганын, кандай пайда тапканыңызды бир көз чаптырып текшересиз.",
  },
];

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

const GUIDE = [
  {
    icon: LayoutDashboard,
    title: "Башкы бет (Дашборд)",
    steps: [
      "Системага киргенде биринчи ушул бет ачылат.",
      "Жогорку жагында бүгүнкү сатуу, таза пайда, сатуулар саны жана орточо чек көрсөтүлөт.",
      "«Бүгүн / 7 күн / 30 күн / Бул ай» баскычтары менен мезгилди алмаштырып, ошол мезгилдин көрсөткүчтөрүн көрө аласыз.",
      "Ылдыйда «Аз калган товарлар» карточкасы жана эң көп сатылган товарлардын тизмеси турат — булар дайыма көз алдыңызда болуш үчүн.",
    ],
  },
  {
    icon: Package,
    title: "Товарлар",
    steps: [
      "Сол менюдан «Товарлар» басыңыз.",
      "Жаңы товар кошуу үчүн жогорку оң жактагы «+ Товар кошуу» баскычын басыңыз.",
      "Товардын атын, категориясын, сатып алуу баасын, сатуу баасын жана санын жазыңыз — пайда автоматтык эсептелет.",
      "«Сактоо» басыңыз — товар даяр, эми сата аласыз.",
      "Товарды өзгөртүү үчүн тизмедеги калем (✏️) иконкасын, өчүрүү үчүн чөп жыйноочу (🗑️) иконкасын басыңыз.",
    ],
  },
  {
    icon: ShoppingCart,
    title: "Сатуу (кассада тез сатуу)",
    steps: [
      "Сол менюдан «Сатуу» басыңыз — бул кассир үчүн эң тез экран.",
      "Сол жактан керектүү товарды таптап тандаңыз (же штрих-код сканерин колдонуңуз).",
      "Оң жакта себет пайда болот — ар бир товардын санын «−» жана «+» баскычтары менен өзгөртө аласыз.",
      "Төлөм ыкмасын тандаңыз: Накталай, Карта, QR же Карыз (карыз тандасаңыз, кардарды көрсөтүшүңүз керек).",
      "Чоң «Сатууну аяктоо» баскычын басыңыз — сатуу катталат, склад автоматтык азаят.",
    ],
  },
  {
    icon: Warehouse,
    title: "Склад",
    steps: [
      "Сол менюдан «Склад» басыңыз.",
      "«Калдык» табында бардык товардын учурдагы санын көрөсүз.",
      "Жаңы товар келгенде: жогорку «Товар киргизүү» баскычын басып, «Киреше» түрүн тандап, товарды, санын жана баасын жазыңыз.",
      "Бузулган же жоголгон товарды «Списание» аркылуу эсептен алып салыңыз.",
      "«Кыймыл тарыхы» табынан ким, качан, эмне кылганын толук көрөсүз.",
    ],
  },
  {
    icon: Users,
    title: "Кардарлар",
    steps: [
      "Сол менюдан «Кардарлар» басыңыз.",
      "«+ Кардар кошуу» менен жаңы кардардын атын, телефонун жазыңыз.",
      "Кардардын атын баскандан, анын толук профили ачылат — канча сатып алганы, азыркы карызы, толук тарыхы.",
    ],
  },
  {
    icon: Wallet,
    title: "Карыз дептери",
    steps: [
      "Сол менюдан «Карыздар» басыңыз.",
      "«+ Карыз кошуу» менен кардарды тандап, суммасын жазыңыз.",
      "Кардар төлөгөндө, ошол карыздын тушундагы «Төлөм кабыл алуу» баскычын басып, төлөгөн суммасын жазыңыз.",
      "Толук эмес төлөсө да мейли — калган сумма автоматтык эсептелип, кийинки жолу дагы төлөй алат.",
    ],
  },
  {
    icon: Truck,
    title: "Жеткирүүчүлөр",
    steps: [
      "Сол менюдан «Жеткирүүчүлөр» басыңыз.",
      "«+ Жеткирүүчү кошуу» менен ким сизге товар берерин катталыз.",
      "Ошол жеткирүүчүгө карызыңыз болсо, «Карыз кошуу» менен жазып, төлөгөн сайын белгилеп туруңуз — эч нерсе унутулбайт.",
    ],
  },
  {
    icon: Receipt,
    title: "Чыгымдар",
    steps: [
      "Сол менюдан «Чыгымдар» басыңыз.",
      "«+ Чыгым кошуу» менен категорияны (ижара, айлык, транспорт ж.б.) тандап, суммасын жазыңыз.",
      "Бул чыгымдар Дашборддогу «таза пайда» эсебине автоматтык кирет.",
    ],
  },
  {
    icon: BarChart3,
    title: "Отчеттор",
    steps: [
      "Сол менюдан «Отчеттор» басыңыз.",
      "Каалаган мезгилди (бүгүн, 7 күн, 30 күн, же өзүңүз тандаган дата) тандаңыз.",
      "Жалпы сатуу, таза пайда, чыгым, эң көп сатылган жана эң пайдалуу товар бир жерде көрүнөт.",
      "«CSV экспорт» баскычы менен отчетту Excel'ге сактап, каалаган жерде колдоно аласыз.",
    ],
  },
  {
    icon: UserCog,
    title: "Кызматкерлер",
    steps: [
      "Сол менюдан «Кызматкерлер» басыңыз (бул бөлүм ээси жана админ үчүн гана көрүнөт).",
      "«+ Кызматкер кошуу» менен атын, email'ин жана убактылуу паролун жазыңыз, ролун тандаңыз (Админ же Кассир).",
      "Кызматкер ошол email жана пароль менен өз алдынча кире алат — сиздин уруксатыңыз чегинде гана иштейт.",
    ],
  },
];

export default function Landing() {
  const [openGuide, setOpenGuide] = useState<string | null>(null);

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
          <h2 className="landing-section-title">Кандай маселелерди чечет?</h2>
          <p className="landing-section-subtitle">Кыргызстандагы дүкөн ээлеринин күнүмдүк баш оорусун тааныйсызбы?</p>
        </div>
        <div className="landing-problems">
          {PROBLEMS.map((p) => (
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

      <section className="landing-section">
        <div className="landing-section-header">
          <h2 className="landing-section-title">Күн сайын кантип колдоносуз?</h2>
          <p className="landing-section-subtitle">Катталгандан кийин, дүкөнүңүздүн күнү мына ушундай өтөт.</p>
        </div>
        <div className="landing-daily">
          {DAILY_USE.map((d, i) => (
            <div className="landing-daily-item" key={d.title}>
              <div className="landing-daily-icon">
                <d.icon size={20} />
              </div>
              <div className="landing-daily-body">
                <span className="landing-daily-step">Кадам {i + 1}</span>
                <h3>{d.title}</h3>
                <p>{d.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-section">
        <div className="landing-section-header">
          <h2 className="landing-section-title">Толук колдонуу гиди</h2>
          <p className="landing-section-subtitle">
            Компьютерди жакшы билбесеңиз да, тынчсызданбаңыз — ар бир бөлүктү кантип колдонсоңуз болорун
            бул жерден кадам-кадам окуп чыгыңыз. Бөлүмдүн атын басып ачыңыз.
          </p>
        </div>
        <div className="landing-guide">
          {GUIDE.map((g) => {
            const isOpen = openGuide === g.title;
            return (
              <div className={`landing-guide-item ${isOpen ? "open" : ""}`} key={g.title}>
                <button className="landing-guide-header" onClick={() => setOpenGuide(isOpen ? null : g.title)}>
                  <span className="landing-guide-icon">
                    <g.icon size={18} />
                  </span>
                  <span className="landing-guide-title">{g.title}</span>
                  <ChevronDown size={18} className="landing-guide-chevron" />
                </button>
                {isOpen && (
                  <ol className="landing-guide-steps">
                    {g.steps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                )}
              </div>
            );
          })}
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
          <Link to="/privacy" className="landing-footer-link">Купуялык саясаты</Link>
          <Link to="/terms" className="landing-footer-link">Колдонуу шарттары</Link>
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
