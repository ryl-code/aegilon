"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Server,
  ShieldAlert,
  Flame,
  Zap,
  BookMarked,
  ScrollText,
  Settings,
  ShieldHalf,
  BookOpen,
  Cpu,
} from "lucide-react";
import { cn } from "@/utils/cn";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/hosts", label: "Hosts", icon: Server },
  { href: "/alerts", label: "Alerts", icon: ShieldAlert },
  { href: "/incidents", label: "Incidents", icon: Flame },
  { href: "/responses", label: "Responses", icon: Zap },
  { href: "/playbooks", label: "SOAR Playbooks", icon: Cpu },
  { href: "/rules", label: "Rules", icon: BookMarked },
  { href: "/audit-logs", label: "Audit Logs", icon: ScrollText },
  { href: "/iso-standards", label: "ISO Standards", icon: BookOpen },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-60 flex-col bg-surface border-r border-border">
      <div className="flex items-center gap-2 px-5 py-5">
        <ShieldHalf className="text-primary" size={24} />
        <span className="text-base font-semibold text-text">AEGILON</span>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-text-muted hover:bg-background/80 hover:text-text"
              )}
            >
              <Icon size={17} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-5 py-4 text-[11px] text-text-muted">
        AEGILON XDR &middot; v1.0
      </div>
    </div>
  );
}
