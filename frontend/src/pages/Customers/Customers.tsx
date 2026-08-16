import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, Plus, Search, SquarePen, Trash2, Users } from "lucide-react";
import { EmptyState } from "../../components/ui/EmptyState";
import { SkeletonRows } from "../../components/ui/Skeleton";
import { Badge } from "../../components/ui/Badge";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { CustomerDrawer } from "./CustomerDrawer";
import { useToast } from "../../hooks/useToast";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import * as customerService from "../../services/customer.service";
import { extractErrorMessage } from "../../services/api";
import { formatDate, formatMoney } from "../../utils/format";
import type { Customer } from "../../types";

export default function Customers() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[] | null>(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    setCustomers(null);
    customerService
      .listCustomers(debouncedSearch || undefined)
      .then(setCustomers)
      .catch((error) => showToast({ variant: "error", title: "Жүктөлгөн жок", message: extractErrorMessage(error) }));
  }, [debouncedSearch, showToast]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(values: { name: string; phone: string; notes: string }) {
    setSubmitting(true);
    try {
      const payload = { name: values.name, phone: values.phone || null, notes: values.notes || null };
      if (editing) {
        await customerService.updateCustomer(editing.id, payload);
        showToast({ variant: "success", title: "Кардар өзгөртүлдү" });
      } else {
        await customerService.createCustomer(payload);
        showToast({ variant: "success", title: "Кардар кошулду" });
      }
      setDrawerOpen(false);
      setEditing(null);
      load();
    } catch (error) {
      showToast({ variant: "error", title: "Сакталган жок", message: extractErrorMessage(error) });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await customerService.deleteCustomer(deleteTarget.id);
      showToast({ variant: "success", title: "Кардар өчүрүлдү" });
      setDeleteTarget(null);
      load();
    } catch (error) {
      showToast({ variant: "error", title: "Өчүрүлгөн жок", message: extractErrorMessage(error) });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="stack gap-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Кардарлар</h1>
          <p className="page-subtitle">Кардарларыңыздын маалыматын жана сатып алуу тарыхын көрүңүз</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditing(null);
            setDrawerOpen(true);
          }}
        >
          <Plus size={18} />
          Кардар кошуу
        </button>
      </div>

      <div className="card">
        <div className="filter-bar">
          <div className="input-with-icon">
            <Search size={16} />
            <input className="input" placeholder="Кардар же телефон боюнча издөө" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {customers === null ? (
          <div className="card-pad">
            <SkeletonRows rows={6} height={52} />
          </div>
        ) : customers.length === 0 ? (
          <EmptyState
            icon={<Users size={26} />}
            title="Азырынча кардар жок"
            subtitle="Биринчи кардарыңызды кошуп баштаңыз."
            action={
              <button className="btn btn-primary" style={{ marginTop: "var(--space-2)" }} onClick={() => setDrawerOpen(true)}>
                <Plus size={16} /> Кардар кошуу
              </button>
            }
          />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Аты</th>
                  <th>Телефон</th>
                  <th className="table-cell-num">Сатып алуулар</th>
                  <th className="table-cell-num">Жалпы сатып алуу</th>
                  <th className="table-cell-num">Карыз</th>
                  <th>Акыркы сатып алуу</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} className="table-row-clickable" onClick={() => navigate(`/customers/${c.id}`)}>
                    <td style={{ fontWeight: 700 }}>{c.name}</td>
                    <td className="text-muted">
                      {c.phone ? (
                        <span className="row gap-1">
                          <Phone size={13} /> {c.phone}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="table-cell-num">{c.purchaseCount}</td>
                    <td className="table-cell-num">{formatMoney(c.totalSpent)}</td>
                    <td className="table-cell-num">{c.debt > 0 ? <Badge variant="danger">{formatMoney(c.debt)}</Badge> : "—"}</td>
                    <td className="text-muted">{c.lastPurchaseAt ? formatDate(c.lastPurchaseAt) : "—"}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="table-actions">
                        <button
                          className="btn btn-ghost btn-icon btn-sm"
                          onClick={() => {
                            setEditing(c);
                            setDrawerOpen(true);
                          }}
                        >
                          <SquarePen size={16} />
                        </button>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setDeleteTarget(c)}>
                          <Trash2 size={16} color="var(--color-danger-text)" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CustomerDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} onSubmit={handleSubmit} customer={editing} submitting={submitting} />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Кардарды өчүрөсүзбү?"
        description={`"${deleteTarget?.name}" толугу менен өчүрүлөт.`}
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
