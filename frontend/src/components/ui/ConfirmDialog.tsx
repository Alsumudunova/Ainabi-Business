import { useTranslation } from "react-i18next";
import { AlertTriangle, HelpCircle } from "lucide-react";
import { Modal } from "./Modal";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { t } = useTranslation();

  return (
    <Modal open={open} onClose={onCancel}>
      <div className="stack gap-4">
        <div className={`empty-state-icon ${danger ? "confirm-icon-danger" : "confirm-icon-neutral"}`} style={{ marginBottom: 0 }}>
          {danger ? <AlertTriangle size={24} /> : <HelpCircle size={24} />}
        </div>
        <div className="stack gap-1">
          <h3 className="card-title">{title}</h3>
          {description && <p className="text-secondary">{description}</p>}
        </div>
        <div className="row gap-3" style={{ justifyContent: "flex-end" }}>
          <button className="btn btn-secondary" onClick={onCancel} disabled={loading}>
            {cancelLabel ?? t("common.cancel")}
          </button>
          <button className={`btn ${danger ? "btn-danger" : "btn-primary"}`} onClick={onConfirm} disabled={loading}>
            {loading ? t("common.confirmLoading") : (confirmLabel ?? t("common.confirmYes"))}
          </button>
        </div>
      </div>
    </Modal>
  );
}
