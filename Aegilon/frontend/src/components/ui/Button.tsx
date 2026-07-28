import { cn } from "@/utils/cn";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-primary text-background dark:text-[#060b13] font-semibold hover:opacity-90",
  secondary: "bg-surface text-text hover:bg-background border border-border",
  danger: "bg-danger text-white hover:bg-danger/90",
  ghost: "text-text-muted hover:text-text hover:bg-surface",
};

export function Button({
  children,
  variant = "primary",
  loading = false,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  loading?: boolean;
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        VARIANT_CLASSES[variant],
        className
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Loader2 size={15} className="animate-spin" />}
      {children}
    </button>
  );
}
