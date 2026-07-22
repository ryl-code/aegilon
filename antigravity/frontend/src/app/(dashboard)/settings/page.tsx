"use client";

import { useQuery } from "@tanstack/react-query";
import { getHealth } from "@/services/health";
import { useAuth } from "@/providers/AuthProvider";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Loading } from "@/components/ui/Loading";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { data: health, isLoading, isError } = useQuery({
    queryKey: ["health"],
    queryFn: getHealth,
    refetchInterval: 15_000,
  });

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-text">Settings</h1>
        <p className="text-sm text-text-muted">Application preferences and system status</p>
      </div>

      <Card>
        <CardHeader title="Profile" />
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-text-muted">Name</dt>
            <dd className="mt-1 text-sm font-medium text-text">{user?.name ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-xs text-text-muted">Email</dt>
            <dd className="mt-1 text-sm font-medium text-text">{user?.email ?? "-"}</dd>
          </div>
        </dl>
      </Card>

      <Card>
        <CardHeader title="Theme" />
        <p className="text-sm text-text-muted">
          AEGILON uses a fixed dark theme, matching Microsoft Defender / Sentinel-style SOC dashboards.
        </p>
      </Card>

      <Card>
        <CardHeader title="System Status" />
        {isLoading ? (
          <Loading label="Checking backend..." />
        ) : (
          <dl className="space-y-3">
            <div className="flex items-center justify-between">
              <dt className="text-sm text-text-muted">API Status</dt>
              <dd>
                <Badge tone={isError ? "danger" : "success"}>{isError ? "Unreachable" : "Online"}</Badge>
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-sm text-text-muted">Backend Status</dt>
              <dd>
                <Badge tone={health?.status === "healthy" ? "success" : "danger"}>
                  {health?.status ?? "Unknown"}
                </Badge>
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-sm text-text-muted">Database</dt>
              <dd>
                <Badge tone={health?.database === "connected" ? "success" : "danger"}>
                  {health?.database ?? "Unknown"}
                </Badge>
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-sm text-text-muted">Wazuh Status</dt>
              <dd>
                <Badge
                  tone={
                    health?.wazuh === "connected"
                      ? "success"
                      : health?.wazuh === "simulated"
                      ? "warning"
                      : "danger"
                  }
                >
                  {health?.wazuh ? health.wazuh.charAt(0).toUpperCase() + health.wazuh.slice(1) : "Unknown"}
                </Badge>
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-sm text-text-muted">Version</dt>
              <dd className="text-sm text-text">2.0.0</dd>
            </div>
          </dl>
        )}
      </Card>

      <Card>
        <CardHeader title="Session" />
        <Button variant="danger" onClick={logout}>
          Logout
        </Button>
      </Card>
    </div>
  );
}
