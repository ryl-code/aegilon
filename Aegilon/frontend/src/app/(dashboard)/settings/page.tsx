"use client";

import { useQuery } from "@tanstack/react-query";
import { Settings, User, Monitor, Server, ShieldCheck, LogOut } from "lucide-react";
import { getHealth } from "@/services/health";
import { useAuth } from "@/providers/AuthProvider";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Loading } from "@/components/ui/Loading";
import { PageHeader } from "@/components/ui/PageHeader";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { data: health, isLoading, isError } = useQuery({
    queryKey: ["health"],
    queryFn: getHealth,
    refetchInterval: 15_000,
  });

  return (
    <div className="max-w-4xl space-y-5">
      <PageHeader
        title="Platform Settings"
        description="Analyst profile, theme configurations, and backend system health"
        badge="System Administration"
        badgeIcon={<Settings size={13} />}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* User Profile Card */}
        <Card className="space-y-4">
          <div className="flex items-center gap-2 border-b border-border/40 pb-3">
            <User className="text-primary" size={18} />
            <h3 className="text-xs font-bold uppercase tracking-wider text-text">Analyst Profile</h3>
          </div>
          <dl className="space-y-3">
            <div>
              <dt className="text-xs text-text-muted">Full Name</dt>
              <dd className="mt-0.5 text-sm font-semibold text-text">{user?.name ?? "Analyst"}</dd>
            </div>
            <div>
              <dt className="text-xs text-text-muted">Email Address</dt>
              <dd className="mt-0.5 text-sm font-mono text-text">{user?.email ?? "analyst@aegilon.sec"}</dd>
            </div>
            <div>
              <dt className="text-xs text-text-muted">Role & Privilege Level</dt>
              <dd className="mt-0.5">
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary border border-primary/20">
                  <ShieldCheck size={12} /> Security Analyst L2
                </span>
              </dd>
            </div>
          </dl>
        </Card>

        {/* Interface Theme Card & Official Logo */}
        <Card className="space-y-4">
          <div className="flex items-center gap-2 border-b border-border/40 pb-3">
            <Monitor className="text-primary" size={18} />
            <h3 className="text-xs font-bold uppercase tracking-wider text-text">Visual Identity & Logo</h3>
          </div>
          <div className="relative overflow-hidden rounded-xl bg-black border border-border p-3 flex items-center justify-center">
            <img src="/logo.png" alt="Official AEGILON Logo" className="h-24 w-auto object-contain rounded" />
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            AEGILON XDR uses a high-contrast Cyberpunk Cyber Defense brand identity paired with a clean <strong>Royal Blue Light Theme</strong> for maximum SOC analyst readability.
          </p>
        </Card>

        {/* System Status Card */}
        <Card className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <div className="flex items-center gap-2">
              <Server className="text-primary" size={18} />
              <h3 className="text-xs font-bold uppercase tracking-wider text-text">System & Infrastructure Status</h3>
            </div>
            <span className="text-[10px] font-mono text-text-muted">Refreshes every 15s</span>
          </div>

          {isLoading ? (
            <Loading label="Checking backend connection..." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3.5 rounded-xl border border-border bg-surface-secondary/50 space-y-1">
                <span className="text-xs text-text-muted">FastAPI Engine</span>
                <div className="pt-1">
                  <Badge tone={isError ? "danger" : "success"}>{isError ? "Unreachable" : "Online"}</Badge>
                </div>
              </div>
              <div className="p-3.5 rounded-xl border border-border bg-surface-secondary/50 space-y-1">
                <span className="text-xs text-text-muted">Backend Health</span>
                <div className="pt-1">
                  <Badge tone={health?.status === "healthy" ? "success" : "danger"}>
                    {health?.status ?? "Unknown"}
                  </Badge>
                </div>
              </div>
              <div className="p-3.5 rounded-xl border border-border bg-surface-secondary/50 space-y-1">
                <span className="text-xs text-text-muted">PostgreSQL Database</span>
                <div className="pt-1">
                  <Badge tone={health?.database === "connected" ? "success" : "danger"}>
                    {health?.database ?? "Connected"}
                  </Badge>
                </div>
              </div>
              <div className="p-3.5 rounded-xl border border-border bg-surface-secondary/50 space-y-1">
                <span className="text-xs text-text-muted">Wazuh Engine</span>
                <div className="pt-1">
                  <Badge
                    tone={
                      health?.wazuh === "connected"
                        ? "success"
                        : health?.wazuh === "simulated"
                        ? "warning"
                        : "success"
                    }
                  >
                    {health?.wazuh ? health.wazuh.charAt(0).toUpperCase() + health.wazuh.slice(1) : "Connected"}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Session Management */}
        <Card className="md:col-span-2 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-text">Session Management</h3>
            <p className="text-xs text-text-muted">Sign out of current analyst session</p>
          </div>
          <Button variant="danger" onClick={logout} className="flex items-center gap-1.5 text-xs">
            <LogOut size={14} /> Logout
          </Button>
        </Card>
      </div>
    </div>
  );
}
