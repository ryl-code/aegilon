import { cn } from "@/utils/cn";

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/80 bg-surface p-5 shadow-card transition-all duration-200 hover:shadow-md",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center justify-between border-b border-border/40 pb-2.5">
      <h3 className="text-xs font-bold uppercase tracking-wider text-text">{title}</h3>
      {action}
    </div>
  );
}
