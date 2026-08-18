import i18n from "../i18n";

/** Formats a number as Kyrgyz currency, e.g. 12500 -> "12 500 сом". "Сом" is
 * the currency's own name (KGS) — it doesn't change between ky/ru. */
export function formatMoney(value: number): string {
  const rounded = Math.round(value);
  return `${rounded.toLocaleString("ru-RU")} сом`;
}

export function formatNumber(value: number): string {
  return value.toLocaleString("ru-RU");
}

export function formatDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleDateString("ky-KG", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function formatDateTime(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return `${formatDate(date)}, ${date.toLocaleTimeString("ky-KG", { hour: "2-digit", minute: "2-digit" })}`;
}

export function formatPercent(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value}%`;
}

const UNIT_KEYS: Record<string, string> = {
  PIECE: "products.units.PIECE",
  KG: "products.units.KG",
  LITER: "products.units.LITER",
  METER: "products.units.METER",
  PACK: "products.units.PACK",
};

export function unitLabel(unit: string): string {
  const key = UNIT_KEYS[unit];
  return key ? i18n.t(key) : unit;
}
