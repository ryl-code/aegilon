"use client";

import React from "react";

interface ExportButtonsProps<T extends Record<string, any>> {
  data: T[];
  filenamePrefix?: string;
}

export function ExportButtons<T extends Record<string, any>>({
  data,
  filenamePrefix = "aegilon_export",
}: ExportButtonsProps<T>) {

  const exportToJson = () => {
    if (!data || data.length === 0) return;
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filenamePrefix}_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportToCsv = () => {
    if (!data || data.length === 0) return;

    // Flatten first level keys for CSV headers
    const sample = data[0];
    const keys = Object.keys(sample).filter(
      (k) => typeof sample[k] !== "object" || sample[k] === null
    );

    const csvRows: string[] = [];
    csvRows.push(keys.join(","));

    for (const row of data) {
      const values = keys.map((k) => {
        const val = row[k];
        if (val === null || val === undefined) return '""';
        const escaped = String(val).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(","));
    }

    const csvStr = csvRows.join("\n");
    const blob = new Blob([csvStr], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filenamePrefix}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={exportToCsv}
        disabled={!data || data.length === 0}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-muted hover:bg-surface-hover hover:text-text transition-colors disabled:opacity-40"
        title="Export data to CSV spreadsheet"
      >
        <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Export CSV
      </button>

      <button
        onClick={exportToJson}
        disabled={!data || data.length === 0}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-muted hover:bg-surface-hover hover:text-text transition-colors disabled:opacity-40"
        title="Export raw data to JSON file"
      >
        <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Export JSON
      </button>
    </div>
  );
}
