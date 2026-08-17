import { useEffect, useState } from "react";
import { Drawer } from "../../components/ui/Drawer";
import type { Supplier } from "../../types";

interface SupplierDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: { name: string; phone: string; address: string }) => Promise<void>;
  supplier?: Supplier | null;
  submitting: boolean;
}

export function SupplierDrawer({ open, onClose, onSubmit, supplier, submitting }: SupplierDrawerProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (open) {
      setName(supplier?.name ?? "");
      setPhone(supplier?.phone ?? "");
      setAddress(supplier?.address ?? "");
    }
  }, [open, supplier]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await onSubmit({ name, phone, address });
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={supplier ? "Жеткирүүчүнү өзгөртүү" : "Жаңы жеткирүүчү кошуу"}
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
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Мисалы: ОсОО Example" required />
        </div>
        <div className="field">
          <label className="field-label">Телефон</label>
          <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+996 700 000 000" />
        </div>
        <div className="field">
          <label className="field-label">Дарек</label>
          <textarea className="textarea" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Кошумча маалымат..." />
        </div>
      </form>
    </Drawer>
  );
}
