export type DatePreset = "today" | "yesterday" | "7d" | "30d" | "month" | "prevMonth";

export function resolvePreset(preset: DatePreset | undefined, from?: string, to?: string) {
  const now = new Date();
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

  if (from && to) {
    return { start: new Date(from), end: new Date(to) };
  }

  switch (preset) {
    case "yesterday": {
      const start = new Date(startOfToday);
      start.setDate(start.getDate() - 1);
      const end = new Date(endOfToday);
      end.setDate(end.getDate() - 1);
      return { start, end };
    }
    case "7d": {
      const start = new Date(startOfToday);
      start.setDate(start.getDate() - 6);
      return { start, end: endOfToday };
    }
    case "30d": {
      const start = new Date(startOfToday);
      start.setDate(start.getDate() - 29);
      return { start, end: endOfToday };
    }
    case "month": {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start, end: endOfToday };
    }
    case "prevMonth": {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      return { start, end };
    }
    case "today":
    default:
      return { start: startOfToday, end: endOfToday };
  }
}
