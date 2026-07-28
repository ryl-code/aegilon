"use client";

import React, { useState } from "react";
import { FileSpreadsheet, FileText, FileCode, Loader2 } from "lucide-react";

interface ExportButtonsProps<T extends Record<string, any>> {
  data: T[];
  filenamePrefix?: string;
  title?: string;
  onFetchAllData?: () => Promise<T[]>;
}

export function ExportButtons<T extends Record<string, any>>({
  data,
  filenamePrefix = "aegilon_export",
  title = "AEGILON XDR Threat & Security Data Report",
  onFetchAllData,
}: ExportButtonsProps<T>) {
  const [isExporting, setIsExporting] = useState(false);

  const getExportData = async (): Promise<T[]> => {
    if (onFetchAllData) {
      try {
        setIsExporting(true);
        const all = await onFetchAllData();
        return all && all.length > 0 ? all : data;
      } catch (err) {
        console.error("Failed to fetch all data for export, fallback to current view", err);
        return data;
      } finally {
        setIsExporting(false);
      }
    }
    return data;
  };

  const exportToJson = async () => {
    const targetData = await getExportData();
    if (!targetData || targetData.length === 0) return;

    const jsonStr = JSON.stringify(targetData, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filenamePrefix}_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportToCsv = async () => {
    const targetData = await getExportData();
    if (!targetData || targetData.length === 0) return;

    const sample = targetData[0];
    const keys = Object.keys(sample).filter(
      (k) => typeof sample[k] !== "object" || sample[k] === null
    );

    const csvRows: string[] = [];
    csvRows.push(keys.join(","));

    for (const row of targetData) {
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
    link.download = `${filenamePrefix}_sheets_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportToPdfPrint = async () => {
    const targetData = await getExportData();
    if (!targetData || targetData.length === 0) return;

    const sample = targetData[0];
    const keys = Object.keys(sample).filter(
      (k) => typeof sample[k] !== "object" || sample[k] === null
    ).slice(0, 8); // Top 8 key attributes for print layout

    const printWindow = window.open("", "_blank", "width=1100,height=850");
    if (!printWindow) return;

    const tableHeaders = keys.map((k) => `<th style="border:1px solid #cbd5e1;padding:8px 12px;background:#f8fafc;text-align:left;font-size:12px;text-transform:capitalize;">${k.replace(/_/g, " ")}</th>`).join("");
    
    const tableRows = targetData.map((row, idx) => {
      const bg = idx % 2 === 0 ? "#ffffff" : "#f8fafc";
      const cells = keys.map((k) => `<td style="border:1px solid #e2e8f0;padding:8px 12px;font-size:11px;font-family:monospace;color:#334155;">${row[k] ?? "-"}</td>`).join("");
      return `<tr style="background:${bg};">${cells}</tr>`;
    }).join("");

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            @media print {
              body { margin: 0; padding: 20px; font-family: system-ui, -apple-system, sans-serif; }
              @page { size: A4 landscape; margin: 15mm; }
            }
            body { font-family: system-ui, -apple-system, sans-serif; padding: 24px; color: #0f172a; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 20px; }
            .logo { font-size: 20px; font-weight: 800; color: #2563eb; letter-spacing: -0.5px; }
            .meta { font-size: 11px; color: #64748b; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            .summary { margin-top: 20px; font-size: 12px; color: #475569; border-top: 1px solid #e2e8f0; padding-top: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">🛡️ AEGILON XDR PLATFORM</div>
              <h2 style="margin: 4px 0 0 0; font-size: 16px; font-weight: 700; color: #1e293b;">${title}</h2>
            </div>
            <div class="meta" style="text-align: right;">
              <div>Generated: ${new Date().toLocaleString()}</div>
              <div>Total Records Exported: <strong>${targetData.length} items</strong></div>
            </div>
          </div>
          <table>
            <thead>
              <tr>${tableHeaders}</tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          <div class="summary">
            🔒 AEGILON XDR Security Report &middot; Complete Unpaginated Log Audit &middot; Page 1 of 1
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={exportToCsv}
        disabled={isExporting || !data || data.length === 0}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-muted hover:bg-surface-hover hover:text-text transition-colors disabled:opacity-40"
        title="Export ALL items to CSV / Sheets spreadsheet"
      >
        {isExporting ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
        ) : (
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
        )}
        Sheets / CSV
      </button>

      <button
        onClick={exportToPdfPrint}
        disabled={isExporting || !data || data.length === 0}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-muted hover:bg-surface-hover hover:text-text transition-colors disabled:opacity-40"
        title="Export ALL items to printable PDF report"
      >
        {isExporting ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" />
        ) : (
          <FileText className="w-3.5 h-3.5 text-rose-400" />
        )}
        PDF Report
      </button>

      <button
        onClick={exportToJson}
        disabled={isExporting || !data || data.length === 0}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-muted hover:bg-surface-hover hover:text-text transition-colors disabled:opacity-40"
        title="Export ALL items to JSON file"
      >
        {isExporting ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
        ) : (
          <FileCode className="w-3.5 h-3.5 text-amber-400" />
        )}
        JSON
      </button>
    </div>
  );
}
