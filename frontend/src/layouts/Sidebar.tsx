import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Warehouse,
  Users,
  Wallet,
  Truck,
  Receipt,
  BarChart3,
  UserCog,
  Settings,
  LifeBuoy,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

const NAV_ITEMS: Array<{ to: string; key: string; icon: typeof LayoutDashboard; end?: boolean }> = [
  { to: "/dashboard", key: "dashboard", icon: LayoutDashboard, end: true },
  { to: "/pos", key: "pos", icon: ShoppingCart },
  { to: "/products", key: "products", icon: Package },
  { to: "/stock", key: "stock", icon: Warehouse },
  { to: "/customers", key: "customers", icon: Users },
  { to: "/debts", key: "debts", icon: Wallet },
  { to: "/suppliers", key: "suppliers", icon: Truck },
  { to: "/expenses", key: "expenses", icon: Receipt },
  { to: "/reports", key: "reports", icon: BarChart3 },
  { to: "/employees", key: "employees", icon: UserCog },
];

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ collapsed, onToggleCollapsed, mobileOpen, onCloseMobile }: SidebarProps) {
  const { t } = useTranslation();

  return (
    <>
      {mobileOpen && <div className="sidebar-mobile-overlay" onClick={onCloseMobile} />}
      <aside className={`sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-mark">AB</div>
          {!collapsed && <span className="sidebar-brand-name">Ainabi Business</span>}
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
              onClick={onCloseMobile}
              title={collapsed ? t(`nav.${item.key}`) : undefined}
            >
              <item.icon size={19} />
              {!collapsed && <span>{t(`nav.${item.key}`)}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <NavLink to="/settings" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`} onClick={onCloseMobile}>
            <Settings size={19} />
            {!collapsed && <span>{t("nav.settings")}</span>}
          </NavLink>
          <NavLink to="/support" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`} onClick={onCloseMobile}>
            <LifeBuoy size={19} />
            {!collapsed && <span>{t("nav.support")}</span>}
          </NavLink>
          <button className="sidebar-collapse-btn" onClick={onToggleCollapsed}>
            {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            {!collapsed && <span>{t("nav.collapse")}</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
