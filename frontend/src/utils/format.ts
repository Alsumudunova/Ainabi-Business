/** Formats a number as Kyrgyz currency, e.g. 12500 -> "12 500 сом". */
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

const UNIT_LABELS: Record<string, string> = {
  PIECE: "даана",
  KG: "кг",
  LITER: "л",
  METER: "м",
  PACK: "пачка",
};

export function unitLabel(unit: string): string {
  return UNIT_LABELS[unit] ?? unit;
}
