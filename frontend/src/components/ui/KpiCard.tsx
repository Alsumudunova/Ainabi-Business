import { LucideIcon, Minus, TrendingDown, TrendingUp } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string;
  changePercent?: number;
  icon: LucideIcon;
  accent?: "primary" | "success" | "warning" | "danger";
  /** Stagger index — each card fades in a beat after the previous one. */
  index?: number;
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

export function KpiCard({ label, value, changePercent, icon: Icon, accent = "primary", index = 0 }: KpiCardProps) {
  const trend = changePercent === undefined ? null : changePercent > 0 ? "up" : changePercent < 0 ? "down" : "flat";
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  return (
    <div className="card card-pad card-hoverable stack gap-3 animate-in" style={{ animationDelay: `${Math.min(index, 6) * 50}ms` }}>
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
          {changePercent}% мурунку мезгилге салыштырмалуу
        </span>
      )}
    </div>
  );
}
