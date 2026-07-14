import { EmptyState } from "@/components/ui/EmptyState";

export function TopBarList({
  items,
  labelKey,
  valueKey,
}: {
  items: Array<Record<string, unknown>>;
  labelKey: string;
  valueKey: string;
}) {
  if (!items || items.length === 0) {
    return <EmptyState title="No data yet" />;
  }

  const max = Math.max(...items.map((i) => Number(i[valueKey]) || 0), 1);

  return (
    <ul className="space-y-3">
      {items.slice(0, 6).map((item, idx) => {
        const label = String(item[labelKey] ?? "Unknown");
        const value = Number(item[valueKey]) || 0;
        return (
          <li key={`${label}-${idx}`}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="truncate text-text-muted">{label}</span>
              <span className="font-medium text-text">{value}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${(value / max) * 100}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
