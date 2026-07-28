import { AlertTriangle } from "lucide-react";

export function ErrorState({
  title = "Something went wrong",
  description,
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <AlertTriangle size={32} className="mb-1 text-danger" />
      <p className="text-sm font-medium text-text">{title}</p>
      {description && (
        <p className="max-w-sm text-xs text-text-muted">{description}</p>
      )}
    </div>
  );
}
