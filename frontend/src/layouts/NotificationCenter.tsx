import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Bell, PackageX, Wallet } from "lucide-react";
import * as dashboardService from "../services/dashboard.service";
import * as debtService from "../services/debt.service";
import * as supplierService from "../services/supplier.service";
import { formatMoney } from "../utils/format";
import type { LowStockProduct } from "../types";

interface NotificationItem {
  id: string;
  icon: typeof Bell;
  title: string;
  subtitle: string;
  to: string;
  variant: "warning" | "danger";
}

export function NotificationCenter() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lowStock, setLowStock] = useState<LowStockProduct[]>([]);
  const [customerDebtTotal, setCustomerDebtTotal] = useState(0);
  const [supplierDebtTotal, setSupplierDebtTotal] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function loadNotifications() {
    setLoading(true);
    Promise.all([
      dashboardService.getLowStock(),
      debtService.getDebtSummary().catch(() => ({ totalOutstanding: 0, openDebts: 0 })),
      supplierService.getSupplierSummary().catch(() => ({ totalOutstanding: 0, openDebts: 0 })),
    ])
      .then(([stock, customerDebts, supplierDebts]) => {
        setLowStock(stock);
        setCustomerDebtTotal(customerDebts.totalOutstanding);
        setSupplierDebtTotal(supplierDebts.totalOutstanding);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadNotifications();
    // Refresh quietly every 2 minutes so the badge count stays current.
    const interval = window.setInterval(loadNotifications, 120000);
    return () => window.clearInterval(interval);
  }, []);

  const items: NotificationItem[] = [];
  const outOfStock = lowStock.filter((p) => p.status === "OUT");
  const lowOnly = lowStock.filter((p) => p.status === "LOW");

  if (outOfStock.length > 0) {
    items.push({
      id: "out-of-stock",
      icon: PackageX,
      title: `${outOfStock.length} товар запаста жок`,
      subtitle: outOfStock.slice(0, 3).map((p) => p.name).join(", "),
      to: "/stock",
      variant: "danger",
    });
  }
  if (lowOnly.length > 0) {
    items.push({
      id: "low-stock",
      icon: AlertTriangle,
      title: `${lowOnly.length} товар аз калды`,
      subtitle: lowOnly.slice(0, 3).map((p) => p.name).join(", "),
      to: "/stock",
      variant: "warning",
    });
  }
  if (customerDebtTotal > 0) {
    items.push({
      id: "customer-debt",
      icon: Wallet,
      title: "Кардарлардын карызы бар",
      subtitle: `Жалпы: ${formatMoney(customerDebtTotal)}`,
      to: "/debts",
      variant: "warning",
    });
  }
  if (supplierDebtTotal > 0) {
    items.push({
      id: "supplier-debt",
      icon: Wallet,
      title: "Жеткирүүчүлөргө карызыңыз бар",
      subtitle: `Жалпы: ${formatMoney(supplierDebtTotal)}`,
      to: "/suppliers",
      variant: "warning",
    });
  }

  return (
    <div style={{ position: "relative" }} ref={rootRef}>
      <button className="header-icon-btn" aria-label="Билдирүүлөр" onClick={() => setOpen((v) => !v)}>
        <Bell size={17} />
        {items.length > 0 && <span className="header-icon-dot pulse-danger" />}
      </button>

      {open && (
        <div className="card animate-in notification-panel">
          <div className="notification-panel-header">
            <span style={{ fontWeight: 700 }}>Билдирүүлөр</span>
          </div>
          {loading && items.length === 0 ? (
            <div className="header-search-empty">Жүктөлүүдө...</div>
          ) : items.length === 0 ? (
            <div className="header-search-empty">Азырынча билдирүү жок — баары жайында.</div>
          ) : (
            <div>
              {items.map((item) => (
                <button
                  key={item.id}
                  className="notification-item"
                  onClick={() => {
                    setOpen(false);
                    navigate(item.to);
                  }}
                >
                  <span className={`notification-item-icon notification-item-icon-${item.variant}`}>
                    <item.icon size={16} />
                  </span>
                  <span className="stack gap-1" style={{ textAlign: "left" }}>
                    <span style={{ fontWeight: 600, fontSize: "var(--font-size-sm)" }}>{item.title}</span>
                    <span className="text-muted" style={{ fontSize: "var(--font-size-xs)" }}>
                      {item.subtitle}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
