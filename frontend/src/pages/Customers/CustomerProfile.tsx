import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Phone, Receipt, Wallet } from "lucide-react";
import { SkeletonRows } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { Badge } from "../../components/ui/Badge";
import { useToast } from "../../hooks/useToast";
import * as customerService from "../../services/customer.service";
import { extractErrorMessage } from "../../services/api";
import { formatDateTime, formatMoney } from "../../utils/format";
import { debtStatusLabels, paymentMethodLabels } from "../../utils/labels";
import type { CustomerDetail } from "../../types";

export default function CustomerProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);

  useEffect(() => {
    if (!id) return;
    customerService
      .getCustomer(id)
      .then(setCustomer)
      .catch((error) => showToast({ variant: "error", title: "Кардар табылган жок", message: extractErrorMessage(error) }));
  }, [id, showToast]);

  if (!customer) {
    return (
      <div className="stack gap-6">
        <SkeletonRows rows={6} height={48} />
      </div>
    );
  }

  const totalDebt = customer.debts.filter((d) => d.status !== "PAID").reduce((sum, d) => sum + d.remainingAmount, 0);
  const totalSpent = customer.sales.reduce((sum, s) => sum + s.total, 0);

  return (
    <div className="stack gap-6">
      <div className="page-header">
        <div className="row gap-3">
          <button className="btn btn-secondary btn-icon" onClick={() => navigate("/customers")}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="page-title">{customer.name}</h1>
            <p className="page-subtitle">
              {customer.phone ? (
                <span className="row gap-1">
                  <Phone size={13} /> {customer.phone}
                </span>
              ) : (
                "Телефон көрсөтүлгөн эмес"
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="card card-pad stack gap-2">
          <span className="text-muted" style={{ fontSize: "var(--font-size-sm)", fontWeight: 600 }}>Жалпы сатып алуу</span>
          <span className="mono-num" style={{ fontSize: "var(--font-size-2xl)", fontWeight: 700 }}>{formatMoney(totalSpent)}</span>
        </div>
        <div className="card card-pad stack gap-2">
          <span className="text-muted" style={{ fontSize: "var(--font-size-sm)", fontWeight: 600 }}>Сатып алуулар саны</span>
          <span className="mono-num" style={{ fontSize: "var(--font-size-2xl)", fontWeight: 700 }}>{customer.sales.length}</span>
        </div>
        <div className="card card-pad stack gap-2">
          <span className="text-muted" style={{ fontSize: "var(--font-size-sm)", fontWeight: 600 }}>Учурдагы карыз</span>
          <span className="mono-num" style={{ fontSize: "var(--font-size-2xl)", fontWeight: 700, color: totalDebt > 0 ? "var(--color-danger-text)" : undefined }}>
            {formatMoney(totalDebt)}
          </span>
        </div>
      </div>

      {customer.notes && (
        <div className="card card-pad">
          <span className="field-label">Комментарий</span>
          <p style={{ marginTop: 6 }}>{customer.notes}</p>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <Receipt size={16} style={{ marginRight: 6, verticalAlign: -2 }} />
            Сатып алуу тарыхы
          </h2>
        </div>
        {customer.sales.length === 0 ? (
          <div className="card-pad">
            <EmptyState title="Сатып алуу жок" subtitle="Бул кардар азырынча эч нерсе сатып алган эмес." />
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Товарлар</th>
                  <th>Төлөм</th>
                  <th className="table-cell-num">Сумма</th>
                </tr>
              </thead>
              <tbody>
                {customer.sales.map((s) => (
                  <tr key={s.id}>
                    <td className="text-muted">{formatDateTime(s.createdAt)}</td>
                    <td>{s.items.map((i) => `${i.productName} ×${i.quantity}`).join(", ")}</td>
                    <td>
                      <Badge variant="neutral">{paymentMethodLabels[s.paymentMethod]}</Badge>
                    </td>
                    <td className="table-cell-num">{formatMoney(s.total)}</td>
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
        {customer.debts.length === 0 ? (
          <div className="card-pad">
            <EmptyState title="Карыз жок" subtitle="Бул кардардын карызы жок." />
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
                </tr>
              </thead>
              <tbody>
                {customer.debts.map((d) => (
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
