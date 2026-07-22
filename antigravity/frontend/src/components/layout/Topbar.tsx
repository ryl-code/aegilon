"use client";

import { useState, useEffect } from "react";
import { Bell, LogOut, Menu, User as UserIcon, Sun, Moon } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const currentTheme = document.documentElement.classList.contains("light") ? "light" : "dark";
    setTheme(currentTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.className = nextTheme;
    localStorage.setItem("theme", nextTheme);
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-surface px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="text-text-muted hover:text-text lg:hidden"
        >
          <Menu size={20} />
        </button>
        <p className="text-sm font-medium text-text-muted hidden sm:block">
          Low-Overhead Extended Detection &amp; Response
        </p>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="text-text-muted hover:text-text p-1.5 rounded-lg hover:bg-background/80"
          title="Toggle Theme"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button className="text-text-muted hover:text-text">
          <Bell size={18} />
        </button>
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-text hover:bg-background/80"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-primary">
              <UserIcon size={15} />
            </div>
            <span className="hidden sm:inline">{user?.name ?? "Analyst"}</span>
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-11 w-48 rounded-lg border border-border bg-surface p-1 shadow-xl">
              <div className="px-3 py-2 text-xs text-text-muted truncate">
                {user?.email}
              </div>
              <button
                onClick={logout}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-danger hover:bg-danger/10"
              >
                <LogOut size={15} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
