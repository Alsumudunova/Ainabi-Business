import { useEffect, useState } from "react";
import { Modal } from "../../components/ui/Modal";
import { formatMoney } from "../../utils/format";
import type { Debt, PaymentMethod } from "../../types";

interface DebtPaymentModalProps {
  open: boolean;
  onClose: () => void;
  debt: Debt | null;
  submitting: boolean;
  onSubmit: (values: { amount: number; method: Exclude<PaymentMethod, "DEBT">; comment?: string }) => Promise<void>;
}

export function DebtPaymentModal({ open, onClose, debt, submitting, onSubmit }: DebtPaymentModalProps) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<Exclude<PaymentMethod, "DEBT">>("CASH");
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (open && debt) {
      setAmount(String(debt.remainingAmount));
      setMethod("CASH");
      setComment("");
    }
  }, [open, debt]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount) return;
    await onSubmit({ amount: Number(amount), method, comment: comment || undefined });
  }

  if (!debt) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <form className="stack gap-4" onSubmit={handleSubmit}>
        <h2 className="card-title">Төлөм кабыл алуу</h2>
        <p className="text-secondary">
          {debt.customerName} — калган карыз: <strong>{formatMoney(debt.remainingAmount)}</strong>
        </p>

        <div className="field">
          <label className="field-label">Төлөм суммасы (сом)</label>
          <input type="number" min={1} max={debt.remainingAmount} step="0.01" className="input" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        </div>

        <div className="field">
          <label className="field-label">Төлөм ыкмасы</label>
          <select className="select" value={method} onChange={(e) => setMethod(e.target.value as Exclude<PaymentMethod, "DEBT">)}>
            <option value="CASH">Накталай</option>
            <option value="CARD">Карта</option>
            <option value="QR">QR</option>
          </select>
        </div>

        <div className="field">
          <label className="field-label">Комментарий</label>
          <input className="input" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Кошумча маалымат" />
        </div>

        <div className="row gap-3" style={{ justifyContent: "flex-end" }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
            Жокко чыгаруу
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Сакталууда..." : "Төлөмдү кабыл алуу"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
