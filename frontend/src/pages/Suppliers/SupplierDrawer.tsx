import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
      title={supplier ? t("suppliers.drawer.editTitle") : t("suppliers.drawer.addTitle")}
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
          <label className="field-label">{t("suppliers.drawer.name")}</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder={t("suppliers.drawer.namePlaceholder")} required />
        </div>
        <div className="field">
          <label className="field-label">{t("suppliers.drawer.phone")}</label>
          <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+996 700 000 000" />
        </div>
        <div className="field">
          <label className="field-label">{t("suppliers.drawer.address")}</label>
          <textarea className="textarea" value={address} onChange={(e) => setAddress(e.target.value)} placeholder={t("suppliers.drawer.addressPlaceholder")} />
        </div>
      </form>
    </Drawer>
  );
}
