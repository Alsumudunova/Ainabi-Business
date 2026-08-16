import { ReactNode } from "react";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, subtitle, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon ?? <Inbox size={26} />}</div>
      <span className="empty-state-title">{title}</span>
      {subtitle && <span className="empty-state-subtitle">{subtitle}</span>}
      {action}
    </div>
  );
}
