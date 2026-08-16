import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Award, Download, Percent, Receipt, ShoppingBag, TrendingUp, Trophy, Wallet } from "lucide-react";
import { KpiCard } from "../../components/ui/KpiCard";
import { Skeleton, SkeletonRows } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { useToast } from "../../hooks/useToast";
import * as reportService from "../../services/report.service";
import type { ReportData, ReportPreset } from "../../services/report.service";
import { extractErrorMessage } from "../../services/api";
import { formatDate, formatMoney, formatNumber } from "../../utils/format";

const PRESETS: { value: ReportPreset; label: string }[] = [
  { value: "today", label: "Бүгүн" },
  { value: "yesterday", label: "Кечээ" },
  { value: "7d", label: "7 күн" },
  { value: "30d", label: "30 күн" },
  { value: "month", label: "Бул ай" },
  { value: "prevMonth", label: "Өткөн ай" },
  { value: "custom", label: "Тандалма" },
];

export default function Reports() {
  const { showToast } = useToast();
  const [preset, setPreset] = useState<ReportPreset>("7d");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [report, setReport] = useState<ReportData | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (preset === "custom" && (!from || !to)) return;
    setReport(null);
    reportService
      .getReport(preset, preset === "custom" ? from : undefined, preset === "custom" ? to : undefined)
      .then(setReport)
      .catch((error) => showToast({ variant: "error", title: "Отчет жүктөлгөн жок", message: extractErrorMessage(error) }));
  }, [preset, from, to, showToast]);

  async function handleExport() {
    setExporting(true);
    try {
      await reportService.downloadReportCsv(preset, preset === "custom" ? from : undefined, preset === "custom" ? to : undefined);
    } catch (error) {
      showToast({ variant: "error", title: "Экспорт болгон жок", message: extractErrorMessage(error) });
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="stack gap-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Отчеттор</h1>
          <p className="page-subtitle">Бизнесиңиздин жыйынтыктарын терең талдаңыз</p>
        </div>
        <button className="btn btn-secondary" onClick={handleExport} disabled={exporting || !report}>
          <Download size={16} />
          {exporting ? "Экспортталууда..." : "CSV экспорт"}
        </button>
      </div>

      <div className="card card-pad">
        <div className="row gap-3" style={{ flexWrap: "wrap" }}>
          <div className="tabs">
            {PRESETS.map((p) => (
              <button key={p.value} className={`tab ${preset === p.value ? "active" : ""}`} onClick={() => setPreset(p.value)}>
                {p.label}
              </button>
            ))}
          </div>
          {preset === "custom" && (
            <div className="row gap-2">
              <input type="date" className="input" style={{ width: 160 }} value={from} onChange={(e) => setFrom(e.target.value)} />
              <span className="text-muted">—</span>
              <input type="date" className="input" style={{ width: 160 }} value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
          )}
        </div>
      </div>

      {preset === "custom" && (!from || !to) ? (
        <div className="card card-pad">
          <EmptyState title="Дата аралыгын тандаңыз" subtitle="Отчетту көрүү үчүн башталыш жана аяктоо дата белгилеңиз." />
        </div>
      ) : !report ? (
        <div className="kpi-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} height={132} radius="16px" />
          ))}
        </div>
      ) : (
        <>
          <div className="kpi-grid">
            <KpiCard index={0} label="Жалпы сатуу" value={formatMoney(report.summary.totalSales)} icon={TrendingUp} accent="primary" />
            <KpiCard index={1} label="Таза пайда" value={formatMoney(report.summary.netProfit)} icon={Wallet} accent="success" />
            <KpiCard index={2} label="Чыгымдар" value={formatMoney(report.summary.totalExpenses)} icon={Receipt} accent="danger" />
            <KpiCard index={3} label="Товарлардын өздүк наркы" value={formatMoney(report.summary.totalCogs)} icon={ShoppingBag} accent="warning" />
            <KpiCard index={4} label="Орточо чек" value={formatMoney(report.summary.avgCheck)} icon={Percent} accent="primary" />
            <KpiCard index={5} label="Сатуу саны" value={formatNumber(report.summary.salesCount)} icon={Award} accent="primary" />
          </div>

          <div className="dashboard-bottom-grid">
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Сатуу vs Чыгым динамикасы</h2>
              </div>
              <div className="card-pad">
                {report.series.length === 0 ? (
                  <EmptyState title="Маалымат жок" subtitle="Тандалган мезгилде маалымат табылган жок." />
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={report.series} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                      <defs>
                        <linearGradient id="salesFill2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--color-primary-500)" stopOpacity={0.28} />
                          <stop offset="100%" stopColor="var(--color-primary-500)" stopOpacity={0.02} />
                        </linearGradient>
                        <linearGradient id="expenseFill2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--color-danger-text)" stopOpacity={0.22} />
                          <stop offset="100%" stopColor="var(--color-danger-text)" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                      <XAxis dataKey="date" tickFormatter={(v) => formatDate(v)} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--color-text-muted)" }} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "var(--color-text-muted)" }} width={64} tickFormatter={(v) => formatNumber(v)} />
                      <Tooltip labelFormatter={(v) => formatDate(v as string)} formatter={(value: number) => formatMoney(value)} contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)" }} />
                      <Area type="monotone" dataKey="sales" name="Сатуу" stroke="var(--color-primary-600)" strokeWidth={2.5} fill="url(#salesFill2)" />
                      <Area type="monotone" dataKey="expenses" name="Чыгым" stroke="var(--color-danger-text)" strokeWidth={2} fill="url(#expenseFill2)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="stack gap-5">
              <div className="card card-pad stack gap-2">
                <div className="row gap-2">
                  <Trophy size={18} color="var(--color-warning-text)" />
                  <span className="card-title" style={{ fontSize: "var(--font-size-md)" }}>Эң көп сатылган товар</span>
                </div>
                {report.bestSelling ? (
                  <>
                    <span style={{ fontSize: "var(--font-size-lg)", fontWeight: 700 }}>{report.bestSelling.name}</span>
                    <span className="text-muted">{formatNumber(report.bestSelling.quantitySold)} даана сатылды — {formatMoney(report.bestSelling.revenue)}</span>
                  </>
                ) : (
                  <span className="text-muted">Маалымат жок</span>
                )}
              </div>
              <div className="card card-pad stack gap-2">
                <div className="row gap-2">
                  <Award size={18} color="var(--color-success-text)" />
                  <span className="card-title" style={{ fontSize: "var(--font-size-md)" }}>Эң пайдалуу товар</span>
                </div>
                {report.mostProfitable ? (
                  <>
                    <span style={{ fontSize: "var(--font-size-lg)", fontWeight: 700 }}>{report.mostProfitable.name}</span>
                    <span className="text-muted">Пайда: {formatMoney(report.mostProfitable.profit)}</span>
                  </>
                ) : (
                  <span className="text-muted">Маалымат жок</span>
                )}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Товарлар боюнча жыйынтык</h2>
            </div>
            {report.productPerformance.length === 0 ? (
              <div className="card-pad">
                <EmptyState title="Сатуу жок" subtitle="Тандалган мезгилде сатуу болгон эмес." />
              </div>
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Товар</th>
                      <th className="table-cell-num">Сатылды</th>
                      <th className="table-cell-num">Киреше</th>
                      <th className="table-cell-num">Пайда</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.productPerformance.map((p) => (
                      <tr key={p.productId}>
                        <td style={{ fontWeight: 600 }}>{p.name}</td>
                        <td className="table-cell-num">{formatNumber(p.quantitySold)}</td>
                        <td className="table-cell-num">{formatMoney(p.revenue)}</td>
                        <td className="table-cell-num">{formatMoney(p.profit)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
