import { EmptyState } from "./EmptyState";

export interface Column<T> {
  header: string;
  render: (row: T) => React.ReactNode;
  className?: string;
}

export function DataTable<T>({
  columns,
  rows,
  keyFn,
  onRowClick,
  emptyTitle = "No records found",
  emptyDescription,
}: {
  columns: Column<T>[];
  rows: T[];
  keyFn: (row: T) => string;
  onRowClick?: (row: T) => void;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (rows.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="table-scroll">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-secondary/60 text-left text-[11px] uppercase tracking-widest text-text-muted">
            {columns.map((col) => (
              <th key={col.header} className="px-3 py-3 font-semibold first:rounded-tl-lg last:rounded-tr-lg">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={keyFn(row)}
              onClick={() => onRowClick?.(row)}
              className={
                onRowClick
                  ? "cursor-pointer border-b border-border/40 hover:bg-primary-light/60 transition-colors duration-100"
                  : "border-b border-border/40"
              }
            >
              {columns.map((col) => (
                <td key={col.header} className={`px-3 py-3 text-text text-sm ${col.className ?? ""}`}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
