import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Warehouse,
  Users,
  Wallet,
  Receipt,
  BarChart3,
  UserCog,
  Settings,
  LifeBuoy,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Башкы бет", icon: LayoutDashboard, end: true },
  { to: "/pos", label: "Сатуу", icon: ShoppingCart },
  { to: "/products", label: "Товарлар", icon: Package },
  { to: "/stock", label: "Склад", icon: Warehouse },
  { to: "/customers", label: "Кардарлар", icon: Users },
  { to: "/debts", label: "Карыздар", icon: Wallet },
  { to: "/expenses", label: "Чыгымдар", icon: Receipt },
  { to: "/reports", label: "Отчеттор", icon: BarChart3 },
  { to: "/employees", label: "Кызматкерлер", icon: UserCog },
];

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ collapsed, onToggleCollapsed, mobileOpen, onCloseMobile }: SidebarProps) {
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
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={19} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <NavLink to="/settings" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`} onClick={onCloseMobile}>
            <Settings size={19} />
            {!collapsed && <span>Настройкалар</span>}
          </NavLink>
          <NavLink to="/support" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`} onClick={onCloseMobile}>
            <LifeBuoy size={19} />
            {!collapsed && <span>Колдоо</span>}
          </NavLink>
          <button className="sidebar-collapse-btn" onClick={onToggleCollapsed}>
            {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            {!collapsed && <span>Жыйыштыруу</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
