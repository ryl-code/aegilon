import { cn } from "@/utils/cn";

interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: string; // small uppercase label above the title
  badgeIcon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

/**
 * Consistent page-level header used across all dashboard pages.
 * Matches the Royal Blue design system (light & dark).
 */
export function PageHeader({
  title,
  description,
  badge,
  badgeIcon,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between", className)}>
      <div className="space-y-0.5">
        {badge && (
          <div className="flex items-center gap-1.5 text-primary font-semibold text-[11px] tracking-widest uppercase mb-1">
            {badgeIcon}
            {badge}
          </div>
        )}
        <h1 className="text-xl font-bold text-text leading-tight">{title}</h1>
        {description && (
          <p className="text-sm text-text-muted leading-relaxed">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>
      )}
    </div>
  );
}

/**
 * Standard wrapper for page content (table or card list).
 * Provides consistent border, background, padding, and rounded corners.
 */
export function PageCard({
  children,
  className,
  noPadding = false,
}: {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/80 bg-surface shadow-card",
        !noPadding && "p-5",
        className
      )}
    >
      {children}
    </div>
  );
}
