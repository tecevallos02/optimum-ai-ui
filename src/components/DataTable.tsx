// path: src/components/DataTable.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";

export type Column<T extends Record<string, any>> = {
  key: keyof T & string;                 // ensure key is a string key of T
  header: string;
  render?: (row: T) => React.ReactNode;  // row is strongly typed as T
};

export default function DataTable<T extends Record<string, any>>({
  data,
  columns,
  pageSize = 10,
}: {
  data?: T[] | null;
  columns: Column<T>[];
  pageSize?: number;
}) {
  const rows: T[] = Array.isArray(data) ? data : [];
  const [page, setPage] = useState(0);

  const { pageData, pageCount, safePage } = useMemo(() => {
    const total = rows.length;
    const count = Math.max(1, Math.ceil(total / pageSize)); // avoid 0 pages
    const clampedPage = Math.min(Math.max(0, page), count - 1);
    const start = clampedPage * pageSize;
    const end = start + pageSize;
    return {
      pageData: rows.slice(start, end),
      pageCount: count,
      safePage: clampedPage,
    };
  }, [rows, page, pageSize]);

  // keep page in bounds when data changes (avoid setState during render)
  useEffect(() => {
    if (safePage !== page) setPage(safePage);
  }, [safePage, page]);

  return (
    <div className="w-full">
      <div className="overflow-x-auto rounded-xl border border-border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-bg text-left">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className="px-4 py-3 font-semibold">
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-muted" colSpan={columns.length}>
                  No data to display.
                </td>
              </tr>
            ) : (
              pageData.map((row, idx) => (
                <tr key={(row as any).id ?? idx} className="border-t border-border">
                  {columns.map((c) => (
                    <td key={c.key} className="px-4 py-3">
                      {c.render
                        ? c.render(row)
                        : String((row as any)[c.key] ?? "")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pager */}
      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-muted">
          Page {pageCount === 0 ? 0 : safePage + 1} of {pageCount}
        </span>
        <div className="space-x-2">
          <button
            className="rounded border px-3 py-1 disabled:opacity-50"
            onClick={() => setPage(0)}
            disabled={safePage <= 0}
          >
            « First
          </button>
          <button
            className="rounded border px-3 py-1 disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={safePage <= 0}
          >
            ‹ Prev
          </button>
          <button
            className="rounded border px-3 py-1 disabled:opacity-50"
            onClick={() => setPage((p) => p + 1)}
            disabled={safePage >= pageCount - 1}
          >
            Next ›
          </button>
          <button
            className="rounded border px-3 py-1 disabled:opacity-50"
            onClick={() => setPage(pageCount - 1)}
            disabled={safePage >= pageCount - 1}
          >
            Last »
          </button>
        </div>
      </div>
    </div>
  );
}
