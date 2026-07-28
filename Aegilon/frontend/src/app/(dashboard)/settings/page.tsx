"use client";

import { useQuery } from "@tanstack/react-query";
import { Settings, User, Monitor, Server, ShieldCheck, LogOut } from "lucide-react";
import { getHealth } from "@/services/health";
import { useAuth } from "@/providers/AuthProvider";
import { Card, CardHeader } from "@/components/ui/Card";
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


      </div>
    </div>
  );
}
