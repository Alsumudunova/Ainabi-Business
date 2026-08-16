import { useEffect, useState } from "react";
import { Globe, Save, User } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import * as settingsService from "../../services/settings.service";
import { extractErrorMessage } from "../../services/api";
import type { Business } from "../../types";

export default function Settings() {
  const { session } = useAuth();
  const { showToast } = useToast();
  const [business, setBusiness] = useState<Business | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", address: "", currency: "KGS" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    settingsService
      .getBusiness()
      .then((b) => {
        setBusiness(b);
        setForm({ name: b.name, phone: b.phone ?? "", address: b.address ?? "", currency: b.currency });
      })
      .catch(() => undefined);
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await settingsService.updateBusiness(form);
      setBusiness(updated);
      showToast({ variant: "success", title: "Настройкалар сакталды" });
    } catch (error) {
      showToast({ variant: "error", title: "Сакталган жок", message: extractErrorMessage(error) });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="stack gap-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Настройкалар</h1>
          <p className="page-subtitle">Бизнес жана профиль маалыматтарын башкарыңыз</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Бизнес маалыматы</h2>
        </div>
        <form className="card-pad stack gap-4" onSubmit={handleSave}>
          <div className="field">
            <label className="field-label">Бизнес аты</label>
            <input className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          </div>
          <div className="form-grid">
            <div className="field">
              <label className="field-label">Телефон</label>
              <input className="input" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            </div>
            <div className="field">
              <label className="field-label">Дарек</label>
              <input className="input" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
            </div>
          </div>
          <div className="field" style={{ maxWidth: 200 }}>
            <label className="field-label">Валюта</label>
            <select className="select" value={form.currency} onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}>
              <option value="KGS">Сом (KGS)</option>
              <option value="USD">Доллар (USD)</option>
            </select>
          </div>
          <div>
            <button type="submit" className="btn btn-primary" disabled={saving || !business}>
              <Save size={16} />
              {saving ? "Сакталууда..." : "Сактоо"}
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <User size={16} style={{ marginRight: 6, verticalAlign: -2 }} />
            Профиль
          </h2>
        </div>
        <div className="card-pad stack gap-2">
          <span>
            <strong>{session?.user.name}</strong>
          </span>
          <span className="text-muted">{session?.user.email}</span>
          {session?.user.phone && <span className="text-muted">{session.user.phone}</span>}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <Globe size={16} style={{ marginRight: 6, verticalAlign: -2 }} />
            Тил
          </h2>
        </div>
        <div className="card-pad row gap-3">
          <select className="select" style={{ maxWidth: 220 }} defaultValue="ky" disabled>
            <option value="ky">Кыргызча</option>
            <option value="ru">Русский</option>
          </select>
          <span className="text-muted" style={{ fontSize: "var(--font-size-sm)" }}>
            Орусча версия жакында кошулат.
          </span>
        </div>
      </div>
    </div>
  );
}
