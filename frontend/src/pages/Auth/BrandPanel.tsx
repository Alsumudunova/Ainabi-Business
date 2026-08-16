import { BarChart3, PackageCheck, Wallet, Zap } from "lucide-react";

export function BrandPanel() {
  return (
    <div className="auth-brand-panel">
      <div className="auth-brand-mark">
        <span className="auth-brand-logo">AB</span>
        <span>Ainabi Business</span>
      </div>

      <div>
        <h1 className="auth-brand-headline">Дүкөнүңүздү бир жерден толук башкарыңыз</h1>
        <p className="auth-brand-sub">Товар, склад, сатуу, кардар жана карыздарды бир заманбап системада көзөмөлдөңүз.</p>
      </div>

      <div className="auth-brand-points">
        <div className="auth-brand-point">
          <Zap size={18} /> Кассада тез сатуу — секунданын ичинде
        </div>
        <div className="auth-brand-point">
          <PackageCheck size={18} /> Складды автоматтык көзөмөлдөө
        </div>
        <div className="auth-brand-point">
          <Wallet size={18} /> Карыз дептери — так жана ишенимдүү
        </div>
        <div className="auth-brand-point">
          <BarChart3 size={18} /> Так отчеттор, ар дайым колуңузда
        </div>
      </div>
    </div>
  );
}
