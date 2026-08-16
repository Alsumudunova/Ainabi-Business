import { useEffect, useState } from "react";
import { Modal } from "../../components/ui/Modal";
import type { Customer } from "../../types";

interface AddDebtModalProps {
  open: boolean;
  onClose: () => void;
  customers: Customer[];
  submitting: boolean;
  onSubmit: (values: { customerId: string; totalAmount: number; comment?: string }) => Promise<void>;
}

export function AddDebtModal({ open, onClose, customers, submitting, onSubmit }: AddDebtModalProps) {
  const [customerId, setCustomerId] = useState("");
  const [amount, setAmount] = useState("");
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (open) {
      setCustomerId("");
      setAmount("");
      setComment("");
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!customerId || !amount) return;
    await onSubmit({ customerId, totalAmount: Number(amount), comment: comment || undefined });
  }

  return (
    <Modal open={open} onClose={onClose}>
      <form className="stack gap-4" onSubmit={handleSubmit}>
        <h2 className="card-title">Карыз кошуу</h2>

        <div className="field">
          <label className="field-label">Кардар</label>
          <select className="select" value={customerId} onChange={(e) => setCustomerId(e.target.value)} required>
            <option value="">Кардарды тандаңыз</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.phone ? `— ${c.phone}` : ""}
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
          <textarea className="textarea" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Мисалы: товар үчүн карыз" />
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
