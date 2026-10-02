"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import {
  LayoutGrid,
  ShoppingBag,
  BarChart3,
  KeyRound,
  Tag,
  LogOut,
  User as UserIcon,
  Wallet,
  ChevronDown,
  Plus,
  Check,
  Globe,
} from "lucide-react";
import type { User, Page } from "@/lib/types";

export type DashboardTab = "pages" | "store" | "coupons" | "analytics" | "finance" | "settings";

interface DashboardHeaderProps {
  tab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  hasToken: boolean;
  activeSlug?: string;
  ordersCount: number;
  pages?: Page[];
  activePageId?: string;
  onSelectPage?: (pageId: string) => void;
  onNewPageClick?: () => void;
}

export function DashboardHeader({
  tab,
  onTabChange,
  hasToken,
  activeSlug,
  ordersCount,
  pages = [],
  activePageId,
  onSelectPage,
  onNewPageClick,
}: DashboardHeaderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [pageDropdownOpen, setPageDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) setCurrentUser(d.user);
      })
      .catch(() => {});
  }, []);

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setPageDropdownOpen(false);
      }
    }
    if (pageDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [pageDropdownOpen]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    localStorage.removeItem("openlynk_session_token");
    window.location.href = "/masuk";
  }

  const activePage = pages.find(
    (p) => (activePageId && p.id === activePageId) || (activeSlug && p.slug === activeSlug)
  );

  const tabs: {
    id: DashboardTab;
    label: string;
    icon: typeof LayoutGrid;
    count?: number;
  }[] = [
    { id: "pages", label: "Halaman & Studio", icon: LayoutGrid },
    { id: "store", label: "Pesanan & Toko", icon: ShoppingBag, count: ordersCount },
    { id: "coupons", label: "Kupon Promo", icon: Tag },
    { id: "analytics", label: "Analitik", icon: BarChart3 },
    { id: "finance", label: "Dompet & Saldo", icon: Wallet },
    { id: "settings", label: "Pengaturan Token", icon: KeyRound },
  ];

  return (
    <header className="border-b border-border/80 bg-card/60 backdrop-blur-md sticky top-0 z-40">
      <div className="mx-auto flex max-w-6xl flex-col gap-y-3 px-4 py-3 sm:px-6">
        {/* Top Brand Bar */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Logo */}
            <Link
              href="/"
              className="font-display text-lg font-bold tracking-tight text-foreground shrink-0 hover:opacity-85 transition-opacity"
            >
              OpenLynk <span className="text-xs font-normal text-muted-foreground">Studio</span>
            </Link>

            {/* Dropdown Pilih Halaman & Buat Halaman (Sebelah Logo) */}
            <div className="relative flex items-center gap-1.5 border-l border-border/80 pl-2 sm:pl-3" ref={dropdownRef}>
              {/* Dropdown Trigger */}
              <button
                type="button"
                onClick={() => setPageDropdownOpen((v) => !v)}
                className={`flex items-center gap-1.5 sm:gap-2 rounded-xl border px-2.5 sm:px-3 py-1.5 text-xs font-medium transition-all shadow-2xs cursor-pointer ${
                  pageDropdownOpen
                    ? "border-foreground bg-muted text-foreground ring-2 ring-foreground/10"
                    : "border-border/80 bg-background/90 text-foreground hover:bg-muted hover:border-foreground/30"
                }`}
                title="Pilih halaman profil aktif"
              >
                {activePage ? (
                  <>
                    <span
                      className="h-2 w-2 rounded-full shrink-0 shadow-2xs"
                      style={{ backgroundColor: activePage.accentColor || "#10b981" }}
                    />
                    <span className="max-w-[90px] sm:max-w-[130px] truncate font-semibold">
                      {activePage.name}
                    </span>
                    <span className="hidden md:inline text-[10px] font-mono text-muted-foreground">
                      /{activePage.slug}
                    </span>
                  </>
                ) : (
                  <>
                    <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="font-medium text-muted-foreground">Pilih Halaman</span>
                  </>
                )}
                <ChevronDown
                  className={`h-3 w-3 text-muted-foreground shrink-0 transition-transform duration-200 ${
                    pageDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Popover Menu Dropdown */}
              {pageDropdownOpen && (
                <div className="absolute left-0 top-full mt-1.5 w-64 rounded-2xl border border-border bg-card p-1.5 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-2.5 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between border-b border-border/50 mb-1">
                    <span>Halaman Profil ({pages.length})</span>
                    <span className="font-mono text-[9px] lowercase opacity-80">pilih profil</span>
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-0.5 scrollbar-thin">
                    {pages.length === 0 ? (
                      <div className="p-3 text-center text-xs text-muted-foreground">
                        Belum ada halaman profil.
                      </div>
                    ) : (
                      pages.map((p) => {
                        const isCurrent =
                          (activePageId && p.id === activePageId) ||
                          (activeSlug && p.slug === activeSlug);
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              onSelectPage?.(p.id);
                              setPageDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-xs transition-colors cursor-pointer ${
                              isCurrent
                                ? "bg-muted font-bold text-foreground"
                                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className="h-2.5 w-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: p.accentColor || "#10b981" }}
                              />
                              <div className="text-left truncate">
                                <p className="truncate text-xs font-medium text-foreground">{p.name}</p>
                                <p className="font-mono text-[10px] text-muted-foreground">/{p.slug}</p>
                              </div>
                            </div>
                            {isCurrent && (
                              <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>

                  {/* Option: Buat Halaman Baru di dalam Menu */}
                  {onNewPageClick && (
                    <div className="border-t border-border/60 pt-1 mt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setPageDropdownOpen(false);
                          onNewPageClick();
                        }}
                        className="w-full flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>+ Buat Halaman Profil Baru</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-xs shrink-0">
            {/* Status User / Token */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span
                className={`h-2 w-2 rounded-full transition-colors ${
                  currentUser
                    ? "bg-emerald-500 shadow-xs shadow-emerald-500/50"
                    : hasToken
                    ? "bg-blue-500 shadow-xs shadow-blue-500/50"
                    : "bg-zinc-400"
                }`}
                title={
                  currentUser
                    ? `Login sebagai ${currentUser.name}`
                    : hasToken
                    ? "Admin Token Aktif"
                    : "Tanpa Token (Sandbox)"
                }
              />
              <span className="hidden sm:inline font-medium">
                {currentUser
                  ? currentUser.name
                  : hasToken
                  ? "Admin Mode"
                  : "Sandbox"}
              </span>
            </div>

            {currentUser ? (
              <button
                type="button"
                onClick={handleLogout}
                title="Keluar dari akun"
                className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background px-3 py-1.5 font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shadow-2xs cursor-pointer"
              >
                <LogOut className="h-3 w-3" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            ) : (
              <Link
                href="/masuk"
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-primary/10 text-primary px-3 py-1.5 font-medium hover:bg-primary/20 transition-colors shadow-2xs"
              >
                <UserIcon className="h-3 w-3" />
                <span>Masuk</span>
              </Link>
            )}
          </div>
        </div>

        {/* Tab Navigation Bar */}
        <nav className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onTabChange(t.id as DashboardTab)}
                className={`flex shrink-0 whitespace-nowrap items-center gap-2 rounded-full px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? "bg-foreground text-background shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{t.label}</span>
                {t.count !== undefined && t.count > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                      isActive
                        ? "bg-background text-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {t.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
