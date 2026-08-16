import { useEffect, useState } from "react";
import { Modal } from "../../components/ui/Modal";
import type { Role } from "../../types";

interface InviteEmployeeModalProps {
  open: boolean;
  onClose: () => void;
  submitting: boolean;
  onSubmit: (values: { name: string; email: string; phone: string; password: string; role: Exclude<Role, "OWNER"> }) => Promise<void>;
}

export function InviteEmployeeModal({ open, onClose, submitting, onSubmit }: InviteEmployeeModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Exclude<Role, "OWNER">>("CASHIER");

  useEffect(() => {
    if (open) {
      setName("");
      setEmail("");
      setPhone("");
      setPassword("");
      setRole("CASHIER");
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !password) return;
    await onSubmit({ name, email, phone, password, role });
  }

  return (
    <Modal open={open} onClose={onClose}>
      <form className="stack gap-4" onSubmit={handleSubmit}>
        <h2 className="card-title">Кызматкер кошуу</h2>

        <div className="field">
          <label className="field-label">Аты</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="form-grid">
          <div className="field">
            <label className="field-label">Email</label>
            <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label className="field-label">Телефон</label>
            <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
        </div>
        <div className="form-grid">
          <div className="field">
            <label className="field-label">Убактылуу пароль</label>
            <input className="input" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>
          <div className="field">
            <label className="field-label">Роль</label>
            <select className="select" value={role} onChange={(e) => setRole(e.target.value as Exclude<Role, "OWNER">)}>
              <option value="ADMIN">Админ</option>
              <option value="CASHIER">Кассир</option>
            </select>
          </div>
        </div>
        <p className="field-hint">Кызматкер ушул email жана пароль менен системага кире алат. Кийин паролду өзгөртүүнү сунуштаңыз.</p>

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
