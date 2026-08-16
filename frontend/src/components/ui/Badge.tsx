import { ReactNode } from "react";

type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral";

export function Badge({ variant = "neutral", children }: { variant?: BadgeVariant; children: ReactNode }) {
  return <span className={`badge badge-${variant}`}>{children}</span>;
}
