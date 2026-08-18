import i18n from "../i18n";

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return i18n.t("dashboard.greeting.night");
  if (hour < 12) return i18n.t("dashboard.greeting.morning");
  if (hour < 18) return i18n.t("dashboard.greeting.day");
  return i18n.t("dashboard.greeting.evening");
}
