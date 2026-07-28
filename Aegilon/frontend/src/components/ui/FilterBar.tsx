"use client";

import React from "react";

interface FilterBarProps {
  severity: string;
  onSeverityChange: (severity: string) => void;
  timeRange: number; // in minutes, 0 means all time
  onTimeRangeChange: (minutes: number) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export function FilterBar({
  severity,
  onSeverityChange,
  timeRange,
  onTimeRangeChange,
  searchQuery,
  onSearchChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface p-3 text-xs">
      {/* Search Input */}
      {onSearchChange !== undefined && (
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search host, rule, or title..."
            value={searchQuery ?? ""}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-1.5 pl-8 text-xs text-text placeholder:text-text-muted focus:border-primary focus:outline-none"
          />
          <svg
            className="absolute left-2.5 top-2 h-3.5 w-3.5 text-text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      )}

      {/* Severity Filter Dropdown */}
      <div className="flex items-center gap-1.5">
        <span className="text-text-muted font-medium">Severity:</span>
        <select
          value={severity}
          onChange={(e) => onSeverityChange(e.target.value)}
          className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-text focus:border-primary focus:outline-none"
        >
          <option value="ALL">All Severities</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      {/* Time Range Filter Dropdown */}
      <div className="flex items-center gap-1.5">
        <span className="text-text-muted font-medium">Time Window:</span>
        <select
          value={timeRange}
          onChange={(e) => onTimeRangeChange(Number(e.target.value))}
          className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-text focus:border-primary focus:outline-none"
        >
          <option value={0}>All Time</option>
          <option value={15}>Last 15 minutes</option>
          <option value={60}>Last 1 hour</option>
          <option value={1440}>Last 24 hours</option>
          <option value={10080}>Last 7 days</option>
        </select>
      </div>
    </div>
  );
}
