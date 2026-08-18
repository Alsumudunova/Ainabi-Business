import { ReactNode, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, LucideIcon, Minus, TrendingDown, TrendingUp } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string;
  changePercent?: number;
  icon: LucideIcon;
  accent?: "primary" | "success" | "warning" | "danger";
  /** Stagger index — each card fades in a beat after the previous one. */
  index?: number;
  /** When provided, the card becomes clickable and toggles this panel open
   * below it — e.g. a scrollable per-product breakdown. */
  dropdown?: ReactNode;
  /** Fires once, the first time the card is opened — good for lazy-loading
   * the dropdown's data instead of fetching it on every dashboard visit. */
  onOpen?: () => void;
}

const ACCENT_BG: Record<string, string> = {
  primary: "var(--color-primary-50)",
  success: "var(--color-success-bg)",
  warning: "var(--color-warning-bg)",
  danger: "var(--color-danger-bg)",
};
const ACCENT_COLOR: Record<string, string> = {
  primary: "var(--color-primary-600)",
  success: "var(--color-success-text)",
  warning: "var(--color-warning-text)",
  danger: "var(--color-danger-text)",
};

export function KpiCard({ label, value, changePercent, icon: Icon, accent = "primary", index = 0, dropdown, onOpen }: KpiCardProps) {
  const { t } = useTranslation();
  const trend = changePercent === undefined ? null : changePercent > 0 ? "up" : changePercent < 0 ? "down" : "flat";
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const openedOnce = useRef(false);

  useEffect(() => {
    if (!dropdown) return;
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [dropdown]);

  function toggle() {
    if (!dropdown) return;
    setOpen((v) => {
      const next = !v;
      if (next && !openedOnce.current) {
        openedOnce.current = true;
        onOpen?.();
      }
      return next;
    });
  }

  return (
    <div ref={rootRef} style={{ position: "relative" }}>
      <div
        className={`card card-pad card-hoverable stack gap-3 animate-in ${dropdown ? "kpi-card-clickable" : ""}`}
        style={{ animationDelay: `${Math.min(index, 6) * 50}ms` }}
        onClick={toggle}
        role={dropdown ? "button" : undefined}
        tabIndex={dropdown ? 0 : undefined}
        aria-expanded={dropdown ? open : undefined}
        onKeyDown={
          dropdown
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggle();
                }
              }
            : undefined
        }
      >
        <div className="row" style={{ justifyContent: "space-between" }}>
          <span className="text-muted" style={{ fontSize: "var(--font-size-sm)", fontWeight: 600 }}>
            {label}
          </span>
          <div
            className="kpi-card-icon"
            style={{
              width: 36,
              height: 36,
              borderRadius: "var(--radius-md)",
              background: ACCENT_BG[accent],
              color: ACCENT_COLOR[accent],
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon size={18} />
          </div>
        </div>
        <span className="mono-num" style={{ fontSize: "var(--font-size-2xl)", fontWeight: 700, letterSpacing: "-0.01em" }}>
          {value}
        </span>
        {trend && (
          <span className={`trend trend-${trend === "up" ? "up" : trend === "down" ? "down" : "flat"}`}>
            <TrendIcon size={14} />
            {changePercent! > 0 ? "+" : ""}
            {changePercent}% {t("common.kpiTrendSuffix")}
          </span>
        )}
        {dropdown && (
          <span className="kpi-card-expand-hint">
            <ChevronDown size={13} className={open ? "kpi-card-chevron open" : "kpi-card-chevron"} />
            {t("common.kpiDetails")}
          </span>
        )}
      </div>
      {dropdown && open && <div className="card animate-in kpi-dropdown">{dropdown}</div>}
    </div>
  );
}
