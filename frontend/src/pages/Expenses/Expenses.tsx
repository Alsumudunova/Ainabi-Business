import { useCallback, useEffect, useState } from "react";
import { Plus, Receipt, Trash2 } from "lucide-react";
import { EmptyState } from "../../components/ui/EmptyState";
import { SkeletonRows } from "../../components/ui/Skeleton";
import { Badge } from "../../components/ui/Badge";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { AddExpenseModal } from "./AddExpenseModal";
import { useToast } from "../../hooks/useToast";
import * as expenseService from "../../services/expense.service";
import { extractErrorMessage } from "../../services/api";
import { formatDateTime, formatMoney } from "../../utils/format";
import { expenseCategoryLabels } from "../../utils/labels";
import type { Expense, ExpenseCategory } from "../../types";

export default function Expenses() {
  const { showToast } = useToast();
  const [expenses, setExpenses] = useState<Expense[] | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | "">("");
  const [addOpen, setAddOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    setExpenses(null);
    expenseService
      .listExpenses({ category: categoryFilter || undefined })
      .then(setExpenses)
      .catch((error) => showToast({ variant: "error", title: "Жүктөлгөн жок", message: extractErrorMessage(error) }));
  }, [categoryFilter, showToast]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAdd(values: { category: ExpenseCategory; amount: number; comment?: string }) {
    setSubmitting(true);
    try {
      await expenseService.createExpense(values);
      showToast({ variant: "success", title: "Чыгым кошулду" });
      setAddOpen(false);
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
      await expenseService.deleteExpense(deleteTarget.id);
      showToast({ variant: "success", title: "Чыгым өчүрүлдү" });
      setDeleteTarget(null);
      load();
    } catch (error) {
      showToast({ variant: "error", title: "Өчүрүлгөн жок", message: extractErrorMessage(error) });
    } finally {
      setDeleting(false);
    }
  }

  const total = expenses?.reduce((sum, e) => sum + e.amount, 0) ?? 0;

  return (
    <div className="stack gap-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Чыгымдар</h1>
          <p className="page-subtitle">Бизнес чыгымдарыңызды категория боюнча көзөмөлдөңүз</p>
        </div>
        <button className="btn btn-primary" onClick={() => setAddOpen(true)}>
          <Plus size={18} />
          Чыгым кошуу
        </button>
      </div>

      <div className="card card-pad row gap-4">
        <div className="stack gap-1">
          <span className="text-muted" style={{ fontSize: "var(--font-size-sm)", fontWeight: 600 }}>Жалпы чыгым</span>
          <span className="mono-num" style={{ fontSize: "var(--font-size-2xl)", fontWeight: 700 }}>{formatMoney(total)}</span>
        </div>
      </div>

      <div className="card">
        <div className="filter-bar">
          <select className="select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as ExpenseCategory | "")}>
            <option value="">Бардык категория</option>
            {Object.entries(expenseCategoryLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {expenses === null ? (
          <div className="card-pad">
            <SkeletonRows rows={5} height={48} />
          </div>
        ) : expenses.length === 0 ? (
          <EmptyState icon={<Receipt size={26} />} title="Чыгым жок" subtitle="Азырынча чыгым катталган эмес." />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Категория</th>
                  <th className="table-cell-num">Сумма</th>
                  <th>Комментарий</th>
                  <th>Ким кошту</th>
                  <th>Дата</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((e) => (
                  <tr key={e.id}>
                    <td>
                      <Badge variant="neutral">{expenseCategoryLabels[e.category]}</Badge>
                    </td>
                    <td className="table-cell-num" style={{ fontWeight: 700 }}>{formatMoney(e.amount)}</td>
                    <td className="text-muted">{e.comment ?? "—"}</td>
                    <td className="text-muted">{e.addedBy}</td>
                    <td className="text-muted">{formatDateTime(e.createdAt)}</td>
                    <td>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setDeleteTarget(e)}>
                        <Trash2 size={16} color="var(--color-danger-text)" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddExpenseModal open={addOpen} onClose={() => setAddOpen(false)} submitting={submitting} onSubmit={handleAdd} />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Чыгымды өчүрөсүзбү?"
        description="Бул аракетти артка кайтарууга болбойт."
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
