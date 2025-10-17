import { startOfDay, endOfDay, subDays, formatISO } from "date-fns";

export function parseDateRange(range: string) {
  // Example range: "2025-01-01:2025-01-31"
  const [start, end] = range.split(":");
  return {
    from: startOfDay(new Date(start)),
    to: endOfDay(new Date(end)),
  };
}

export function lastNDays(n: number) {
  const to = endOfDay(new Date());
  const from = startOfDay(subDays(to, n));
  return { from, to };
}

export function toISO(date: Date) {
  return formatISO(date, { representation: "complete" });
}
