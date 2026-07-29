"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Server,
  ShieldAlert,
  Flame,
  Zap,
  BookMarked,
  ScrollText,
  Settings,
  Shield,
  BookOpen,
  Cpu,
  Play,
  Activity,
  CheckCircle2,
  HardDrive,
  Database,
} from "lucide-react";
import { runDetectionEngine } from "@/services/alerts";
import { getIncidentStats } from "@/services/incidents";
import { toast } from "sonner";
import { cn } from "@/utils/cn";

const NAV_ITEMS = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/hosts", label: "Computers & Hosts", icon: Server },
  { href: "/alerts", label: "Alerts Stream", icon: ShieldAlert },
  { href: "/incidents", label: "Incidents Vault", icon: Flame },
  { href: "/responses", label: "Response Actions", icon: Zap },
  { href: "/playbooks", label: "SOAR Playbooks", icon: Cpu },
  { href: "/rules", label: "Detection Rules", icon: BookMarked },
  { href: "/audit-logs", label: "Audit Trails", icon: ScrollText },
  { href: "/iso-standards", label: "ISO Standards", icon: BookOpen },
  { href: "/settings", label: "Platform Settings", icon: Settings },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const statsQuery = useQuery({
    queryKey: ["incidentStats"],
    queryFn: getIncidentStats,
  });
  const stats = statsQuery.data;

  const triggerDetectionMutation = useMutation({
    mutationFn: runDetectionEngine,
    onSuccess: (data) => {
      toast.success(data.message || "Detection engine executed successfully");
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      queryClient.invalidateQueries({ queryKey: ["incidentStats"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || "Failed to run detection engine");
    },
  });

  return (
    <div className="flex h-full w-64 flex-col bg-[#1a64ea] text-white p-5 rounded-tr-3xl rounded-br-3xl shadow-xl justify-between overflow-y-auto select-none">
      <div>
        {/* Brand Logo */}
        <div className="flex items-center gap-3 px-2 py-3 mb-4">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black/90 overflow-hidden shadow-md ring-1 ring-white/20">
            <img
              src="/logo.png"
              alt="AEGILON Logo"
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <span className="text-lg font-extrabold tracking-tight text-white block leading-tight">AEGILON</span>
            <span className="block text-[10px] font-medium text-blue-100/80 uppercase tracking-widest">XDR Defense</span>
          </div>
        </div>

        {/* Top White Pill Button CTA (Matching Screenshot 'Upload New Files') */}
        <button
          suppressHydrationWarning
          onClick={() => triggerDetectionMutation.mutate()}
          disabled={triggerDetectionMutation.isPending}
          className="w-full bg-white text-[#1a64ea] hover:bg-blue-50 transition-all duration-200 font-bold text-xs py-3 px-4 rounded-full shadow-md hover:shadow-lg flex items-center justify-center gap-2 mb-6 disabled:opacity-60"
        >
          <Play className="h-3.5 w-3.5 fill-current" />
          {triggerDetectionMutation.isPending ? "Running Detection..." : "Run Detection Engine"}
        </button>

        {/* Vertical Navigation Links */}
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-150",
                  active
                    ? "bg-white/20 text-white shadow-inner backdrop-blur-md"
                    : "text-blue-100/70 hover:bg-white/10 hover:text-white"
                )}
              >
                <Icon size={18} className={active ? "text-white" : "text-blue-200/60"} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Supabase & Database Storage Details */}
      <div className="pt-6 border-t border-white/15 space-y-3">
        <p className="text-[10px] font-bold tracking-wider text-blue-100/80 uppercase">
          DATABASE & SUPABASE USAGE
        </p>

        {/* Supabase PostgreSQL Database Size Meter */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1.5 text-blue-100 font-medium">
              <Database className="h-3 w-3 text-blue-200" /> Database Size
            </span>
            <span className="font-semibold text-white">
              {stats?.database_size_mb ?? 56.0} MB / 500 MB
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(100, Math.max(5, (((stats?.database_size_mb ?? 56.0) / 500) * 100)))}%`
              }}
            />
          </div>
          <p className="text-[10px] text-blue-200/70">Supabase Free Plan (500 MB limit)</p>
        </div>

        {/* Egress Bandwidth Traffic */}
        <div className="space-y-1 pt-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1.5 text-blue-100 font-medium">
              <HardDrive className="h-3 w-3 text-emerald-300" /> Egress Traffic
            </span>
            <span className="font-semibold text-white">413 MB / 5 GB</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-white/20 overflow-hidden">
            <div className="h-full bg-emerald-300 rounded-full" style={{ width: "8.3%" }} />
          </div>
          <p className="text-[10px] text-blue-200/70">Monthly Bandwidth: 5 GB quota</p>
        </div>

        <div className="pt-2 flex items-center justify-between text-[11px] text-blue-100/90 font-medium">
          <span>SLA: {stats?.sla_compliance_pct ?? 95.0}%</span>
          <span>DB Status: Active ↗</span>
        </div>
      </div>
    </div>
  );
}
