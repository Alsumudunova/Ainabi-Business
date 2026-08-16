export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return "Кутман түн";
  if (hour < 12) return "Кутман таң";
  if (hour < 18) return "Кутман күн";
  return "Кутман кеч";
}
