import { useEffect, useState } from "react";
import { Drawer } from "../../components/ui/Drawer";
import type { Customer } from "../../types";

interface CustomerDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: { name: string; phone: string; notes: string }) => Promise<void>;
  customer?: Customer | null;
  submitting: boolean;
}

export function CustomerDrawer({ open, onClose, onSubmit, customer, submitting }: CustomerDrawerProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      setName(customer?.name ?? "");
      setPhone(customer?.phone ?? "");
      setNotes(customer?.notes ?? "");
    }
  }, [open, customer]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await onSubmit({ name, phone, notes });
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={customer ? "Кардарды өзгөртүү" : "Жаңы кардар кошуу"}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose} disabled={submitting}>
            Жокко чыгаруу
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Сакталууда..." : "Сактоо"}
          </button>
        </>
      }
    >
      <form className="stack gap-4" onSubmit={handleSubmit}>
        <div className="field">
          <label className="field-label">Аты</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Кардардын аты" required />
        </div>
        <div className="field">
          <label className="field-label">Телефон</label>
          <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+996 700 000 000" />
        </div>
        <div className="field">
          <label className="field-label">Комментарий</label>
          <textarea className="textarea" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Кошумча маалымат..." />
        </div>
      </form>
    </Drawer>
  );
}
