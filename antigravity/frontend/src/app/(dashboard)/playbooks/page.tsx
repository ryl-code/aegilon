"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { ShieldCheck, Zap, Play, CheckCircle, ArrowRight } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { Loading } from "@/components/ui/Loading";
import { ErrorState } from "@/components/ui/ErrorState";
import { api } from "@/lib/axios";

interface Playbook {
  id: string;
  name: string;
  actions: string[];
  description: string;
  enabled: boolean;
}

export default function PlaybooksPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["playbooks"],
    queryFn: async () => {
      const { data } = await api.get<Playbook[]>("/playbooks");
      return data;
    },
  });

  if (isLoading) return <Loading label="Loading SOAR playbooks..." />;
  if (isError) return <ErrorState description="Failed to load SOAR playbooks from backend." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase">
            <Zap size={16} /> Security Orchestration, Automation & Response (SOAR)
          </div>
          <h1 className="text-xl font-bold text-text mt-1">Automated SOAR Playbooks</h1>
          <p className="text-sm text-text-muted">
            Pre-configured automated remediation workflows executed when high-severity threats occur.
          </p>
        </div>
      </div>

      {/* Active Playbooks List */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {(data ?? []).map((pb) => (
          <Card key={pb.id} className="flex flex-col justify-between space-y-4 border-l-4 border-l-primary">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20 font-semibold">
                  {pb.id}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                  <CheckCircle size={12} /> Active Playbook
                </span>
              </div>
              <h3 className="text-sm font-semibold text-text">{pb.name}</h3>
              <p className="text-xs text-text-muted leading-relaxed">{pb.description}</p>
            </div>

            <div className="space-y-2 pt-3 border-t border-border">
              <span className="text-[11px] text-text-muted font-medium">Automated Response Sequence:</span>
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {pb.actions.map((act, idx) => (
                  <React.Fragment key={act}>
                    <span className="rounded bg-surface-hover px-2 py-1 font-mono text-[11px] font-semibold text-text border border-border">
                      {act}
                    </span>
                    {idx < pb.actions.length - 1 && <ArrowRight size={12} className="text-text-muted" />}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
