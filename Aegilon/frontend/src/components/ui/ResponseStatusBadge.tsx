"use client";

import React from "react";

interface ResponseStatusBadgeProps {
  status: string;
}

export function ResponseStatusBadge({ status }: ResponseStatusBadgeProps) {
  const s = (status || "").toLowerCase();

  if (s === "pending" || s === "pending approval") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
        Pending Approval
      </span>
    );
  }

  if (s === "executing" || s === "in progress" || s === "running") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-spin" />
        Executing...
      </span>
    );
  }

  if (s === "success" || s === "completed" || s === "approved" || s === "executed") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        Success / Executed
      </span>
    );
  }

  if (s === "failed" || s === "error" || s === "rejected") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
        <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
        Execution Failed
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-surface-hover text-text-muted border border-border">
      {status}
    </span>
  );
}
