// path: src/components/DataTable.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";

export type Column<T extends Record<string, unknown>> = {
  key: keyof T & string; // ensure key is a string key of T
  header: string;
  render?: (row: T) => React.ReactNode; // row is strongly typed as T
};

export default function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  pageSize = 10,
}: {
  data?: T[] | null;
  columns: Column<T>[];
  pageSize?: number;
}) {
  const [page, setPage] = useState(0);

  const { pageData, pageCount, safePage } = useMemo(() => {
    const rows: T[] = Array.isArray(data) ? data : [];
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
  }, [data, page, pageSize]);

  // keep page in bounds when data changes (avoid setState during render)
  useEffect(() => {
    if (safePage !== page) setPage(safePage);
  }, [safePage, page]);

  return (
    <div className="w-full">
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:!bg-dark-card shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 dark:bg-dark-hover text-left">
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  className="px-4 py-3 font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-dark-border"
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-dark-card">
            {pageData.length === 0 ? (
              <tr>
                <td
                  className="px-4 py-6 text-gray-500 dark:text-dark-text-secondary text-center"
                  colSpan={columns.length}
                >
                  No data to display.
                </td>
              </tr>
            ) : (
              pageData.map((row, idx) => (
                <tr
                  key={String((row as Record<string, unknown>).id) || idx}
                  className="border-t border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-hover bg-white dark:bg-dark-card"
                >
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className="px-4 py-3 text-gray-900 dark:text-white"
                    >
                      {c.render
                        ? c.render(row)
                        : String((row as Record<string, unknown>)[c.key] ?? "")}
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
        <span className="text-gray-500 dark:text-dark-text-secondary">
          Page {pageCount === 0 ? 0 : safePage + 1} of {pageCount}
        </span>
        <div className="space-x-2">
          <button
            className="rounded border border-gray-300 dark:border-dark-border px-3 py-1 disabled:opacity-50 bg-white dark:bg-dark-card text-gray-700 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-hover"
            onClick={() => setPage(0)}
            disabled={safePage <= 0}
          >
            « First
          </button>
          <button
            className="rounded border border-gray-300 dark:border-dark-border px-3 py-1 disabled:opacity-50 bg-white dark:bg-dark-card text-gray-700 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-hover"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={safePage <= 0}
          >
            ‹ Prev
          </button>
          <button
            className="rounded border border-gray-300 dark:border-dark-border px-3 py-1 disabled:opacity-50 bg-white dark:bg-dark-card text-gray-700 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-hover"
            onClick={() => setPage((p) => p + 1)}
            disabled={safePage >= pageCount - 1}
          >
            Next ›
          </button>
          <button
            className="rounded border border-gray-300 dark:border-dark-border px-3 py-1 disabled:opacity-50 bg-white dark:bg-dark-card text-gray-700 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-hover"
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
