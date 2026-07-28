"use client";

import { useState } from "react";
import { LogOut, Menu, Search } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";

import { useRouter } from "next/navigation";

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      
      // Page mappings based on exhaustive keywords
      if (q.includes("alert") || q.includes("stream") || q.includes("event") || q.includes("wazuh")) router.push("/alerts");
      else if (q.includes("incident") || q.includes("case") || q.includes("investigat") || q.includes("ticket") || q.startsWith("inc-")) router.push("/incidents");
      else if (q.includes("host") || q.includes("computer") || q.includes("pc") || q.includes("laptop") || q.includes("server") || q.includes("endpoint") || q.includes("agent") || q.includes("machine") || q.match(/^[0-9\.]+$/)) router.push("/hosts");
      else if (q.includes("rule") || q.includes("threat") || q.includes("detect") || q.includes("signature") || q.includes("yara") || q.includes("sigma")) router.push("/rules");
      else if (q.includes("playbook") || q.includes("automation") || q.includes("soar") || q.includes("script") || q.includes("workflow")) router.push("/playbooks");
      else if (q.includes("audit") || q.includes("log") || q.includes("activity") || q.includes("history")) router.push("/audit-logs");
      else if (q.includes("response") || q.includes("action") || q.includes("mitigat") || q.includes("block") || q.includes("isolate") || q.includes("remediat")) router.push("/responses");
      else if (q.includes("iso") || q.includes("standard") || q.includes("compliance") || q.includes("sca") || q.includes("cis") || q.includes("posture")) router.push("/iso-standards");
      else if (q.includes("setting") || q.includes("config") || q.includes("preference") || q.includes("profile") || q.includes("user") || q.includes("telegram")) router.push("/settings");
      else if (q.includes("dash") || q.includes("home")) router.push("/");
      else router.push("/alerts"); // fallback
      
      setSearchQuery("");
    }
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-surface px-4 sm:px-8 shadow-xs">
      {/* Left side: Mobile menu & Search drive/threat bar */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button
          onClick={onMenuClick}
          className="text-text-muted hover:text-text lg:hidden"
        >
          <Menu size={20} />
        </button>

        {/* Pill Search Input matching Screenshot */}
        <div className="relative w-full max-w-md hidden sm:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted h-4 w-4" />
          <input
            suppressHydrationWarning
            type="text"
            placeholder="Search threats, hosts, incidents or rules... (Press Enter)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            className="w-full rounded-full bg-surface-secondary border border-border/80 pl-10 pr-4 py-2 text-xs text-text placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>
      </div>

      {/* Right side: Action icons and user profile avatar */}
      <div className="flex items-center gap-3">


        {/* User Profile Avatar Pill matching Screenshot */}
        <div className="relative">
          <button
            suppressHydrationWarning
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2.5 rounded-full px-2.5 py-1 text-xs font-semibold text-text hover:bg-surface-hover transition-colors"
          >
            <span className="hidden sm:inline text-text-muted">{user?.name ?? "Analyst"}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white font-bold text-xs shadow-sm">
              {user?.name ? user.name[0].toUpperCase() : "J"}
            </div>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-12 w-48 rounded-xl border border-border bg-surface p-1.5 shadow-xl z-50">
              <div className="px-3 py-2 text-xs text-text-muted truncate border-b border-border mb-1">
                {user?.email ?? "analyst@aegilon.sec"}
              </div>
              <button
                onClick={logout}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-danger hover:bg-danger/10 transition-colors"
              >
                <LogOut size={14} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
