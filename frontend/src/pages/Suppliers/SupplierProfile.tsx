import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Phone, Plus, Truck, Wallet } from "lucide-react";
import { SkeletonRows } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { Badge } from "../../components/ui/Badge";
import { AddSupplierDebtModal } from "./AddSupplierDebtModal";
import { SupplierPaymentModal } from "./SupplierPaymentModal";
import { useToast } from "../../hooks/useToast";
import * as supplierService from "../../services/supplier.service";
import { extractErrorMessage } from "../../services/api";
import { formatDateTime, formatMoney, formatNumber } from "../../utils/format";
import { debtStatusLabels } from "../../utils/labels";
import type { PaymentMethod, SupplierDebt, SupplierDetail } from "../../types";

export default function SupplierProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [supplier, setSupplier] = useState<SupplierDetail | null>(null);
  const [addDebtOpen, setAddDebtOpen] = useState(false);
  const [addDebtSubmitting, setAddDebtSubmitting] = useState(false);
  const [payTarget, setPayTarget] = useState<SupplierDebt | null>(null);
  const [paySubmitting, setPaySubmitting] = useState(false);

  const load = useCallback(() => {
    if (!id) return;
    supplierService
      .getSupplier(id)
      .then(setSupplier)
      .catch((error) => showToast({ variant: "error", title: "Жеткирүүчү табылган жок", message: extractErrorMessage(error) }));
  }, [id, showToast]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAddDebt(values: { totalAmount: number; comment?: string }) {
    if (!id) return;
    setAddDebtSubmitting(true);
    try {
      await supplierService.createSupplierDebt(id, values);
      showToast({ variant: "success", title: "Карыз кошулду" });
      setAddDebtOpen(false);
      load();
    } catch (error) {
      showToast({ variant: "error", title: "Сакталган жок", message: extractErrorMessage(error) });
    } finally {
      setAddDebtSubmitting(false);
    }
  }

  async function handlePayment(values: { amount: number; method: Exclude<PaymentMethod, "DEBT">; comment?: string }) {
    if (!payTarget) return;
    setPaySubmitting(true);
    try {
      await supplierService.addSupplierPayment(payTarget.id, values);
      showToast({ variant: "success", title: "Төлөм кабыл алынды", message: formatMoney(values.amount) });
      setPayTarget(null);
      load();
    } catch (error) {
      showToast({ variant: "error", title: "Кабыл алынган жок", message: extractErrorMessage(error) });
    } finally {
      setPaySubmitting(false);
    }
  }

  if (!supplier) {
    return (
      <div className="stack gap-6">
        <SkeletonRows rows={6} height={48} />
      </div>
    );
  }

  const totalDebt = supplier.debts.filter((d) => d.status !== "PAID").reduce((sum, d) => sum + d.remainingAmount, 0);
  const totalPurchased = supplier.deliveries.reduce((sum, d) => sum + (d.total ?? 0), 0);

  return (
    <div className="stack gap-6">
      <div className="page-header">
        <div className="row gap-3">
          <button className="btn btn-secondary btn-icon" onClick={() => navigate("/suppliers")}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="page-title">{supplier.name}</h1>
            <p className="page-subtitle">
              {supplier.phone ? (
                <span className="row gap-1">
                  <Phone size={13} /> {supplier.phone}
                </span>
              ) : (
                "Телефон көрсөтүлгөн эмес"
              )}
            </p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setAddDebtOpen(true)}>
          <Plus size={18} />
          Карыз кошуу
        </button>
      </div>

      <div className="kpi-grid">
        <div className="card card-pad stack gap-2">
          <span className="text-muted" style={{ fontSize: "var(--font-size-sm)", fontWeight: 600 }}>Жалпы алынган товар</span>
          <span className="mono-num" style={{ fontSize: "var(--font-size-2xl)", fontWeight: 700 }}>{formatMoney(totalPurchased)}</span>
        </div>
        <div className="card card-pad stack gap-2">
          <span className="text-muted" style={{ fontSize: "var(--font-size-sm)", fontWeight: 600 }}>Жеткирүүлөр саны</span>
          <span className="mono-num" style={{ fontSize: "var(--font-size-2xl)", fontWeight: 700 }}>{supplier.deliveries.length}</span>
        </div>
        <div className="card card-pad stack gap-2">
          <span className="text-muted" style={{ fontSize: "var(--font-size-sm)", fontWeight: 600 }}>Учурдагы карыз</span>
          <span className="mono-num" style={{ fontSize: "var(--font-size-2xl)", fontWeight: 700, color: totalDebt > 0 ? "var(--color-danger-text)" : undefined }}>
            {formatMoney(totalDebt)}
          </span>
        </div>
      </div>

      {supplier.address && (
        <div className="card card-pad">
          <span className="field-label">Дарек</span>
          <p style={{ marginTop: 6 }}>{supplier.address}</p>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <Truck size={16} style={{ marginRight: 6, verticalAlign: -2 }} />
            Жеткирүү тарыхы
          </h2>
        </div>
        {supplier.deliveries.length === 0 ? (
          <div className="card-pad">
            <EmptyState title="Жеткирүү жок" subtitle="Бул жеткирүүчүдөн азырынча товар келген эмес." />
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Товар</th>
                  <th className="table-cell-num">Саны</th>
                  <th className="table-cell-num">Баасы</th>
                  <th className="table-cell-num">Суммасы</th>
                </tr>
              </thead>
              <tbody>
                {supplier.deliveries.map((d) => (
                  <tr key={d.id}>
                    <td className="text-muted">{formatDateTime(d.createdAt)}</td>
                    <td style={{ fontWeight: 600 }}>{d.productName}</td>
                    <td className="table-cell-num">{formatNumber(d.quantity)}</td>
                    <td className="table-cell-num">{d.purchasePrice ? formatMoney(d.purchasePrice) : "—"}</td>
                    <td className="table-cell-num">{d.total ? formatMoney(d.total) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <Wallet size={16} style={{ marginRight: 6, verticalAlign: -2 }} />
            Карыз тарыхы
          </h2>
        </div>
        {supplier.debts.length === 0 ? (
          <div className="card-pad">
            <EmptyState title="Карыз жок" subtitle="Бул жеткирүүчүгө карыз жок." />
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Дата</th>
                  <th className="table-cell-num">Жалпы</th>
                  <th className="table-cell-num">Төлөнгөн</th>
                  <th className="table-cell-num">Калган</th>
                  <th>Статус</th>
                  <th>Комментарий</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {supplier.debts.map((d) => (
                  <tr key={d.id}>
                    <td className="text-muted">{formatDateTime(d.createdAt)}</td>
                    <td className="table-cell-num">{formatMoney(d.totalAmount)}</td>
                    <td className="table-cell-num">{formatMoney(d.paidAmount)}</td>
                    <td className="table-cell-num">{formatMoney(d.remainingAmount)}</td>
                    <td>
                      <Badge variant={d.status === "PAID" ? "success" : d.status === "PARTIAL" ? "warning" : "danger"}>
                        {debtStatusLabels[d.status]}
                      </Badge>
                    </td>
                    <td className="text-muted">{d.comment ?? "—"}</td>
                    <td>
                      {d.status !== "PAID" && (
                        <button className="btn btn-secondary btn-sm" onClick={() => setPayTarget(d)}>
                          Төлөм жасоо
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

      <AddSupplierDebtModal
        open={addDebtOpen}
        onClose={() => setAddDebtOpen(false)}
        supplierName={supplier.name}
        submitting={addDebtSubmitting}
        onSubmit={handleAddDebt}
      />
      <SupplierPaymentModal
        open={!!payTarget}
        onClose={() => setPayTarget(null)}
        debt={payTarget}
        supplierName={supplier.name}
        submitting={paySubmitting}
        onSubmit={handlePayment}
      />
    </div>
  );
}
