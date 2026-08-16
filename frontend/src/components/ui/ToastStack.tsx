import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { useToast } from "../../hooks/useToast";

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

export function ToastStack() {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-stack">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.variant];
        return (
          <div key={toast.id} className={`toast toast-${toast.variant} ${toast.leaving ? "toast-leaving" : ""}`} role="status">
            <Icon
              size={20}
              style={{
                color:
                  toast.variant === "success" ? "var(--color-success-text)" : toast.variant === "error" ? "var(--color-danger-text)" : "var(--color-primary-600)",
                flexShrink: 0,
              }}
            />
            <div className="stack gap-1" style={{ flex: 1 }}>
              <span className="toast-title">{toast.title}</span>
              {toast.message && <span className="toast-message">{toast.message}</span>}
            </div>
            <button className="btn btn-ghost btn-icon btn-sm" onClick={() => dismissToast(toast.id)} aria-label="Жабуу">
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
