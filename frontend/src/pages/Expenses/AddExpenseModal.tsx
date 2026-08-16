import { useEffect, useState } from "react";
import { Modal } from "../../components/ui/Modal";
import { expenseCategoryLabels } from "../../utils/labels";
import type { ExpenseCategory } from "../../types";

interface AddExpenseModalProps {
  open: boolean;
  onClose: () => void;
  submitting: boolean;
  onSubmit: (values: { category: ExpenseCategory; amount: number; comment?: string }) => Promise<void>;
}

const CATEGORY_ORDER: ExpenseCategory[] = ["RENT", "SALARY", "PURCHASE", "TRANSPORT", "UTILITIES", "ADVERTISING", "OTHER"];

export function AddExpenseModal({ open, onClose, submitting, onSubmit }: AddExpenseModalProps) {
  const [category, setCategory] = useState<ExpenseCategory>("OTHER");
  const [amount, setAmount] = useState("");
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (open) {
      setCategory("OTHER");
      setAmount("");
      setComment("");
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount) return;
    await onSubmit({ category, amount: Number(amount), comment: comment || undefined });
  }

  return (
    <Modal open={open} onClose={onClose}>
      <form className="stack gap-4" onSubmit={handleSubmit}>
        <h2 className="card-title">Чыгым кошуу</h2>

        <div className="field">
          <label className="field-label">Категория</label>
          <select className="select" value={category} onChange={(e) => setCategory(e.target.value as ExpenseCategory)}>
            {CATEGORY_ORDER.map((c) => (
              <option key={c} value={c}>
                {expenseCategoryLabels[c]}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="field-label">Сумма (сом)</label>
          <input type="number" min={1} step="0.01" className="input" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        </div>

        <div className="field">
          <label className="field-label">Комментарий</label>
          <textarea className="textarea" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Кошумча маалымат" />
        </div>

        <div className="row gap-3" style={{ justifyContent: "flex-end" }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
            Жокко чыгаруу
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Сакталууда..." : "Кошуу"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
