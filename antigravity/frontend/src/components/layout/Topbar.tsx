"use client";

import { useState } from "react";
import { LogOut, Menu, Search } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

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
            placeholder="Search threats, hosts, incidents or rules..."
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
