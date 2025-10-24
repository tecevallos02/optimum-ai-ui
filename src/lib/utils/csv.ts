export function toCsv<T extends Record<string, unknown>>(rows: T[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const lines = rows.map((row) =>
    headers.map((h) => JSON.stringify(row[h] ?? "")).join(","),
  );
  return [headers.join(","), ...lines].join("\n");
}
