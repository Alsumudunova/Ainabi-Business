import { useCallback, useEffect, useState } from "react";
import { CircleDollarSign, Phone, Plus, Wallet } from "lucide-react";
import { EmptyState } from "../../components/ui/EmptyState";
import { SkeletonRows } from "../../components/ui/Skeleton";
import { Badge } from "../../components/ui/Badge";
import { AddDebtModal } from "./AddDebtModal";
import { DebtPaymentModal } from "./DebtPaymentModal";
import { useToast } from "../../hooks/useToast";
import * as debtService from "../../services/debt.service";
import * as customerService from "../../services/customer.service";
import { extractErrorMessage } from "../../services/api";
import { formatDate, formatMoney } from "../../utils/format";
import { debtStatusLabels } from "../../utils/labels";
import type { Customer, Debt, PaymentMethod } from "../../types";
import "./Debts.css";

export default function Debts() {
  const { showToast } = useToast();
  const [debts, setDebts] = useState<Debt[] | null>(null);
  const [summary, setSummary] = useState<debtService.DebtSummary | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showOnlyOpen, setShowOnlyOpen] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [payTarget, setPayTarget] = useState<Debt | null>(null);
  const [paySubmitting, setPaySubmitting] = useState(false);

  const load = useCallback(() => {
    setDebts(null);
    debtService
      .listDebts(showOnlyOpen ? "OPEN" : "ALL")
      .then(setDebts)
      .catch((error) => showToast({ variant: "error", title: "Жүктөлгөн жок", message: extractErrorMessage(error) }));
    debtService.getDebtSummary().then(setSummary).catch(() => undefined);
  }, [showOnlyOpen, showToast]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    customerService.listCustomers().then(setCustomers).catch(() => undefined);
  }, []);

  async function handleAddDebt(values: { customerId: string; totalAmount: number; comment?: string }) {
    setAddSubmitting(true);
    try {
      await debtService.createDebt(values);
      showToast({ variant: "success", title: "Карыз кошулду" });
      setAddOpen(false);
      load();
    } catch (error) {
      showToast({ variant: "error", title: "Сакталган жок", message: extractErrorMessage(error) });
    } finally {
      setAddSubmitting(false);
    }
  }

  async function handlePayment(values: { amount: number; method: Exclude<PaymentMethod, "DEBT">; comment?: string }) {
    if (!payTarget) return;
    setPaySubmitting(true);
    try {
      await debtService.addDebtPayment(payTarget.id, values);
      showToast({ variant: "success", title: "Карыз төлөмү кабыл алынды", message: formatMoney(values.amount) });
      setPayTarget(null);
      load();
    } catch (error) {
      showToast({ variant: "error", title: "Кабыл алынган жок", message: extractErrorMessage(error) });
    } finally {
      setPaySubmitting(false);
    }
  }

  return (
    <div className="stack gap-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Карыз дептери</h1>
          <p className="page-subtitle">Кардарлардын карыздарын так көзөмөлдөңүз</p>
        </div>
        <button className="btn btn-primary" onClick={() => setAddOpen(true)}>
          <Plus size={18} />
          Карыз кошуу
        </button>
      </div>

      <div
        className="card card-pad row gap-4 debts-summary-banner animate-in"
        style={{ background: "linear-gradient(135deg, var(--color-primary-600), var(--color-primary-700))", color: "#fff" }}
      >
        <div style={{ width: 48, height: 48, borderRadius: "var(--radius-md)", background: "rgba(255,255,255,0.16)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Wallet size={24} />
        </div>
        <div className="stack gap-1">
          <span style={{ opacity: 0.85, fontSize: "var(--font-size-sm)", fontWeight: 600 }}>Жалпы карыз</span>
          <span style={{ fontSize: "var(--font-size-3xl)", fontWeight: 800 }} className="mono-num">
            {summary ? formatMoney(summary.totalOutstanding) : "—"}
          </span>
        </div>
        <span className="spacer" />
        {summary && (
          <div className="stack gap-1" style={{ textAlign: "right" }}>
            <span style={{ opacity: 0.85, fontSize: "var(--font-size-sm)" }}>Ачык карыздар</span>
            <span style={{ fontSize: "var(--font-size-xl)", fontWeight: 700 }}>{summary.openDebts}</span>
          </div>
        )}
      </div>

      <div className="card">
        <div className="filter-bar">
          <div className="tabs">
            <button className={`tab ${showOnlyOpen ? "active" : ""}`} onClick={() => setShowOnlyOpen(true)}>
              Төлөнө элек
            </button>
            <button className={`tab ${!showOnlyOpen ? "active" : ""}`} onClick={() => setShowOnlyOpen(false)}>
              Баары
            </button>
          </div>
        </div>

        {debts === null ? (
          <div className="card-pad">
            <SkeletonRows rows={5} height={52} />
          </div>
        ) : debts.length === 0 ? (
          <EmptyState icon={<CircleDollarSign size={26} />} title="Карыз жок" subtitle="Азырынча эч бир кардарда карыз жок." />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Кардар</th>
                  <th>Телефон</th>
                  <th className="table-cell-num">Жалпы</th>
                  <th className="table-cell-num">Төлөгөн</th>
                  <th className="table-cell-num">Калган</th>
                  <th>Статус</th>
                  <th>Дата</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {debts.map((d) => (
                  <tr key={d.id}>
                    <td style={{ fontWeight: 700 }}>{d.customerName}</td>
                    <td className="text-muted">
                      {d.customerPhone ? (
                        <span className="row gap-1">
                          <Phone size={13} /> {d.customerPhone}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="table-cell-num">{formatMoney(d.totalAmount)}</td>
                    <td className="table-cell-num">{formatMoney(d.paidAmount)}</td>
                    <td className="table-cell-num" style={{ fontWeight: 700 }}>{formatMoney(d.remainingAmount)}</td>
                    <td>
                      <Badge variant={d.status === "PAID" ? "success" : d.status === "PARTIAL" ? "warning" : "danger"}>{debtStatusLabels[d.status]}</Badge>
                    </td>
                    <td className="text-muted">{formatDate(d.createdAt)}</td>
                    <td>
                      {d.status !== "PAID" && (
                        <button className="btn btn-secondary btn-sm" onClick={() => setPayTarget(d)}>
                          Төлөм кабыл алуу
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddDebtModal open={addOpen} onClose={() => setAddOpen(false)} customers={customers} submitting={addSubmitting} onSubmit={handleAddDebt} />
      <DebtPaymentModal open={!!payTarget} onClose={() => setPayTarget(null)} debt={payTarget} submitting={paySubmitting} onSubmit={handlePayment} />
    </div>
  );
}
