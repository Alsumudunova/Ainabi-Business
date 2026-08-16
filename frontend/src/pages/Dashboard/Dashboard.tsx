import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertTriangle, Banknote, PackageSearch, Receipt, ShoppingBag, TrendingUp, Wallet } from "lucide-react";
import { KpiCard } from "../../components/ui/KpiCard";
import { Skeleton, SkeletonRows } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { useAuth } from "../../hooks/useAuth";
import { getGreeting } from "../../utils/greeting";
import { formatMoney, formatNumber } from "../../utils/format";
import { unitLabel } from "../../utils/format";
import * as dashboardService from "../../services/dashboard.service";
import type { DashboardRange, DashboardSummary, LowStockProduct, SalesDynamicsPoint, TopProduct } from "../../types";
import "../../layouts/layout.css";

const RANGE_OPTIONS: { value: DashboardRange; label: string }[] = [
  { value: "today", label: "Бүгүн" },
  { value: "7d", label: "7 күн" },
  { value: "30d", label: "30 күн" },
  { value: "month", label: "Бул ай" },
];

export default function Dashboard() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [range, setRange] = useState<DashboardRange>("today");
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [dynamics, setDynamics] = useState<SalesDynamicsPoint[] | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[] | null>(null);
  const [lowStock, setLowStock] = useState<LowStockProduct[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      dashboardService.getDashboardSummary(range),
      dashboardService.getSalesDynamics(7),
      dashboardService.getTopProducts(range),
      dashboardService.getLowStock(),
    ])
      .then(([summaryRes, dynamicsRes, topRes, lowStockRes]) => {
        if (cancelled) return;
        setSummary(summaryRes);
        setDynamics(dynamicsRes);
        setTopProducts(topRes);
        setLowStock(lowStockRes);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [range]);

  return (
    <div className="stack gap-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {getGreeting()}, {session?.user.name.split(" ")[0]} 👋
          </h1>
          <p className="page-subtitle">Бизнесиңиздин {range === "today" ? "бүгүнкү" : "тандалган мезгилдин"} көрсөткүчтөрү</p>
        </div>
        <div className="tabs">
          {RANGE_OPTIONS.map((opt) => (
            <button key={opt.value} className={`tab ${range === opt.value ? "active" : ""}`} onClick={() => setRange(opt.value)}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="kpi-grid">
        {loading || !summary ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} height={132} radius="16px" />)
        ) : (
          <>
            <KpiCard index={0} label="Сатуу" value={formatMoney(summary.kpi.revenue.value)} changePercent={summary.kpi.revenue.changePercent} icon={Banknote} accent="primary" />
            <KpiCard index={1} label="Таза пайда" value={formatMoney(summary.kpi.netProfit.value)} changePercent={summary.kpi.netProfit.changePercent} icon={TrendingUp} accent="success" />
            <KpiCard index={2} label="Сатуулар" value={formatNumber(summary.kpi.salesCount.value)} changePercent={summary.kpi.salesCount.changePercent} icon={ShoppingBag} accent="primary" />
            <KpiCard index={3} label="Орточо чек" value={formatMoney(summary.kpi.avgCheck.value)} changePercent={summary.kpi.avgCheck.changePercent} icon={Receipt} accent="primary" />
            <KpiCard index={4} label="Складдагы товар" value={`${formatNumber(summary.kpi.stockQuantity.value)} даана`} icon={PackageSearch} accent="warning" />
            <KpiCard index={5} label="Карыздар" value={formatMoney(summary.kpi.totalDebt.value)} icon={Wallet} accent="danger" />
          </>
        )}
      </div>

      <div className="dashboard-charts-grid">
        <div className="card animate-in" style={{ animationDelay: "0ms" }}>
          <div className="card-header">
            <div>
              <h2 className="card-title">Сатуу динамикасы</h2>
              <p className="card-subtitle">Акыркы 7 күн ичиндеги сатуулар</p>
            </div>
          </div>
          <div className="card-pad" style={{ paddingTop: "var(--space-4)" }}>
            {loading || !dynamics ? (
              <Skeleton height={280} radius="12px" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={dynamics} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                  <defs>
                    <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-primary-500)" stopOpacity={0.28} />
                      <stop offset="100%" stopColor="var(--color-primary-500)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "var(--color-text-muted)" }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "var(--color-text-muted)" }} width={64} tickFormatter={(v) => formatNumber(v)} />
                  <Tooltip
                    formatter={(value: number) => formatMoney(value)}
                    contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", boxShadow: "var(--shadow-md)" }}
                  />
                  <Area type="monotone" dataKey="sales" name="Сатуу" stroke="var(--color-primary-600)" strokeWidth={2.5} fill="url(#salesFill)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="card animate-in" style={{ animationDelay: "60ms" }}>
          <div className="card-header">
            <div>
              <h2 className="card-title">Аз калган товарлар</h2>
              <p className="card-subtitle">Складды толуктоо убактысы</p>
            </div>
          </div>
          {loading || !lowStock ? (
            <div className="card-pad">
              <SkeletonRows rows={4} height={48} />
            </div>
          ) : lowStock.length === 0 ? (
            <div className="card-pad">
              <EmptyState icon={<PackageSearch size={26} />} title="Бардык товар жетиштүү" subtitle="Азырынча аз калган товар жок." />
            </div>
          ) : (
            <>
              <div>
                {lowStock.map((p) => (
                  <div className="low-stock-item" key={p.id}>
                    <div className="stack gap-1">
                      <span style={{ fontWeight: 600 }}>{p.name}</span>
                      <span className="text-muted" style={{ fontSize: "var(--font-size-xs)" }}>
                        {formatNumber(p.quantity)} {unitLabel(p.unit)} калды
                      </span>
                    </div>
                    <span className={`badge ${p.status === "OUT" ? "badge-danger pulse-danger" : "badge-warning"}`}>
                      <AlertTriangle size={12} />
                      {p.status === "OUT" ? "Бүттү" : "Аз калды"}
                    </span>
                  </div>
                ))}
              </div>
              <div className="card-pad" style={{ paddingTop: "var(--space-4)" }}>
                <button className="btn btn-secondary btn-block" onClick={() => navigate("/stock")}>
                  Складды толуктоо
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="dashboard-bottom-grid">
        <div className="card animate-in" style={{ animationDelay: "120ms" }}>
          <div className="card-header">
            <div>
              <h2 className="card-title">Эң көп сатылган товарлар</h2>
              <p className="card-subtitle">Тандалган мезгил ичинде</p>
            </div>
          </div>
          {loading || !topProducts ? (
            <div className="card-pad">
              <SkeletonRows rows={4} height={40} />
            </div>
          ) : topProducts.length === 0 ? (
            <div className="card-pad">
              <EmptyState icon={<ShoppingBag size={26} />} title="Сатуулар табылган жок" subtitle="Тандалган мезгилде сатуу болгон эмес." />
            </div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Товар</th>
                    <th className="table-cell-num">Сатылды</th>
                    <th className="table-cell-num">Киреше</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((p) => (
                    <tr key={p.productId}>
                      <td style={{ fontWeight: 600 }}>{p.name}</td>
                      <td className="table-cell-num">{formatNumber(p.soldQuantity)}</td>
                      <td className="table-cell-num">{formatMoney(p.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card animate-in" style={{ animationDelay: "180ms" }}>
          <div className="card-header">
            <div>
              <h2 className="card-title">Киреше vs Чыгым</h2>
              <p className="card-subtitle">Акыркы 7 күн</p>
            </div>
          </div>
          <div className="card-pad" style={{ paddingTop: "var(--space-4)" }}>
            {loading || !dynamics ? (
              <Skeleton height={240} radius="12px" />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={dynamics} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "var(--color-text-muted)" }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "var(--color-text-muted)" }} width={56} tickFormatter={(v) => formatNumber(v)} />
                  <Tooltip formatter={(value: number) => formatMoney(value)} contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)" }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="sales" name="Киреше" fill="var(--color-primary-500)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="expenses" name="Чыгым" fill="var(--color-danger-text)" radius={[6, 6, 0, 0]} opacity={0.75} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
