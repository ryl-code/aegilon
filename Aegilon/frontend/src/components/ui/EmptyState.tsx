import { Inbox, type LucideIcon } from "lucide-react";

export function EmptyState({
  title = "No data",
  description,
  icon: Icon = Inbox,
}: {
  title?: string;
  description?: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-text-muted">
      <Icon size={32} className="mb-1 opacity-50" />
      <p className="text-sm font-medium text-text">{title}</p>
      {description && <p className="max-w-sm text-xs">{description}</p>}
    </div>
  );
}
