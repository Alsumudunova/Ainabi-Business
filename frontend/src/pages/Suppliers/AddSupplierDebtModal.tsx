import { useEffect, useState } from "react";
import { Modal } from "../../components/ui/Modal";

interface AddSupplierDebtModalProps {
  open: boolean;
  onClose: () => void;
  supplierName: string;
  submitting: boolean;
  onSubmit: (values: { totalAmount: number; comment?: string }) => Promise<void>;
}

export function AddSupplierDebtModal({ open, onClose, supplierName, submitting, onSubmit }: AddSupplierDebtModalProps) {
  const [amount, setAmount] = useState("");
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (open) {
      setAmount("");
      setComment("");
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount) return;
    await onSubmit({ totalAmount: Number(amount), comment: comment || undefined });
  }

  return (
    <Modal open={open} onClose={onClose}>
      <form className="stack gap-4" onSubmit={handleSubmit}>
        <h2 className="card-title">Карыз кошуу</h2>
        <p className="text-secondary">{supplierName}</p>

        <div className="field">
          <label className="field-label">Сумма (сом)</label>
          <input type="number" min={1} step="0.01" className="input" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        </div>

        <div className="field">
          <label className="field-label">Комментарий</label>
          <textarea className="textarea" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Мисалы: 50 даана Coca-Cola үчүн" />
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
