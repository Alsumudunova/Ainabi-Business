import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
      title={customer ? t("customers.drawer.editTitle") : t("customers.drawer.addTitle")}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose} disabled={submitting}>
            {t("common.cancel")}
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? t("common.saving") : t("common.save")}
          </button>
        </>
      }
    >
      <form className="stack gap-4" onSubmit={handleSubmit}>
        <div className="field">
          <label className="field-label">{t("customers.drawer.name")}</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder={t("customers.drawer.namePlaceholder")} required />
        </div>
        <div className="field">
          <label className="field-label">{t("customers.drawer.phone")}</label>
          <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+996 700 000 000" />
        </div>
        <div className="field">
          <label className="field-label">{t("customers.drawer.comment")}</label>
          <textarea className="textarea" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t("customers.drawer.commentPlaceholder")} />
        </div>
      </form>
    </Drawer>
  );
}
