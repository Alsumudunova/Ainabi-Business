import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, LogOut, Menu, Plus, Search, Settings, User } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { roleLabels } from "../utils/labels";

interface HeaderProps {
  onOpenMobileSidebar: () => void;
}

export function Header({ onOpenMobileSidebar }: HeaderProps) {
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const initials = session?.user.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="header">
      <button className="header-icon-btn header-mobile-toggle" onClick={onOpenMobileSidebar} aria-label="Меню">
        <Menu size={18} />
      </button>

      <div className="header-search">
        <Search size={16} />
        <input placeholder="Товар же кардар издөө..." />
      </div>

      <div className="spacer" />

      <div className="header-actions">
        <button className="btn btn-primary btn-sm" onClick={() => navigate("/pos")}>
          <Plus size={16} />
          <span className="quick-sale-label">Тез сатуу</span>
        </button>

        <button className="header-icon-btn" aria-label="Билдирүүлөр">
          <Bell size={17} />
          <span className="header-icon-dot pulse-danger" />
        </button>

        <div style={{ position: "relative" }} ref={menuRef}>
          <button className="header-profile" onClick={() => setProfileOpen((v) => !v)}>
            {session?.user.avatarUrl ? (
              <img src={session.user.avatarUrl} alt={session.user.name} className="avatar" style={{ objectFit: "cover" }} />
            ) : (
              <span className="avatar">{initials || "AB"}</span>
            )}
            <div className="stack header-profile-text" style={{ textAlign: "left", lineHeight: 1.2 }}>
              <span style={{ fontSize: "var(--font-size-sm)", fontWeight: 700 }}>{session?.business.name}</span>
              <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                {session ? roleLabels[session.role] : ""}
              </span>
            </div>
          </button>

          {profileOpen && (
            <div
              className="card animate-in"
              style={{
                position: "absolute",
                right: 0,
                top: "calc(100% + 8px)",
                width: 220,
                maxWidth: "calc(100vw - 32px)",
                padding: "var(--space-2)",
                zIndex: 50,
              }}
            >
              <div style={{ padding: "var(--space-3)" }}>
                <div style={{ fontWeight: 700 }}>{session?.user.name}</div>
                <div className="text-muted" style={{ fontSize: "var(--font-size-xs)" }}>
                  {session?.user.email}
                </div>
              </div>
              <button className="sidebar-link" style={{ width: "100%" }} onClick={() => { setProfileOpen(false); navigate("/settings"); }}>
                <User size={16} />
                <span>Профиль</span>
              </button>
              <button className="sidebar-link" style={{ width: "100%" }} onClick={() => { setProfileOpen(false); navigate("/settings"); }}>
                <Settings size={16} />
                <span>Настройкалар</span>
              </button>
              <button
                className="sidebar-link"
                style={{ width: "100%", color: "var(--color-danger-text)" }}
                onClick={() => {
                  setProfileOpen(false);
                  logout();
                  navigate("/login");
                }}
              >
                <LogOut size={16} />
                <span>Чыгуу</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
