"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Crown,
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
  currentUser?: User | null;
  onOpenProfileModal?: () => void;
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
  currentUser: propUser,
  onOpenProfileModal,
}: DashboardHeaderProps) {
  const router = useRouter();
  const [localUser, setLocalUser] = useState<User | null>(null);
  const currentUser = propUser !== undefined ? propUser : localUser;
  const [pageDropdownOpen, setPageDropdownOpen] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (propUser === undefined) {
      fetch("/api/auth/me")
        .then((r) => r.json())
        .then((d) => {
          if (d.user) setLocalUser(d.user);
        })
        .catch(() => {});
    }
  }, [propUser]);

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
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignore
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("openlynk_session_token");
      localStorage.removeItem("openlynk_admin");
    }
    router.push("/masuk");
    router.refresh();
  }

  const activePage = pages.find(
    (p) => (activePageId && p.id === activePageId) || (activeSlug && p.slug === activeSlug)
  );

  function copyProfileUrl() {
    if (!activePage) return;
    const url = `${window.location.origin}/${activePage.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  }

  const isPro = currentUser?.role === "admin" || currentUser?.plan === "pro";

  const tabs: {
    id: DashboardTab;
    label: string;
    icon: typeof LayoutGrid;
    count?: number;
  }[] = [
    { id: "pages", label: "Studio & Halaman", icon: LayoutGrid },
    { id: "store", label: "Pesanan & Toko", icon: ShoppingBag, count: ordersCount },
    { id: "coupons", label: "Kupon Promo", icon: Tag },
    { id: "analytics", label: "Analitik", icon: BarChart3 },
    { id: "finance", label: "Dompet & Saldo", icon: Wallet },
    { id: "settings", label: "Pengaturan", icon: KeyRound },
  ];

  return (
    <header className="border-b border-border/70 bg-card/80 backdrop-blur-xl sticky top-0 z-40 transition-colors shadow-2xs">
      <div className="mx-auto flex max-w-7xl flex-col lg:flex-row lg:items-center lg:justify-between px-4 py-2.5 sm:px-6 lg:h-16 lg:py-0 gap-y-3">
        {/* Left Section: Brand Logo + Page Switcher Dropdown + Quick Actions */}
        <div className="flex items-center justify-between lg:justify-start gap-2.5 sm:gap-3 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Logo */}
            <Link
              href="/"
              className="font-display text-lg font-bold tracking-tight text-foreground shrink-0 hover:opacity-85 transition-opacity flex items-center gap-1.5"
            >
              <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">OpenLynk</span>
              <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider hidden sm:inline">
                Studio
              </span>
            </Link>

            {/* Dropdown Switcher Halaman Profil */}
            <div className="relative flex items-center gap-1.5 border-l border-border/80 pl-2 sm:pl-3" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setPageDropdownOpen((v) => !v)}
                className={`group flex items-center gap-1.5 sm:gap-2 rounded-xl border px-2.5 sm:px-3 py-1.5 text-xs font-medium transition-all shadow-2xs cursor-pointer ${
                  pageDropdownOpen
                    ? "border-foreground bg-muted text-foreground ring-2 ring-foreground/10"
                    : "border-border/80 bg-background/90 text-foreground hover:bg-muted hover:border-foreground/30"
                }`}
                title="Pilih halaman profil aktif"
              >
                {activePage ? (
                  <>
                    <span
                      className="h-2 w-2 rounded-full shrink-0 shadow-2xs transition-transform group-hover:scale-125"
                      style={{ backgroundColor: activePage.accentColor || "#10b981" }}
                    />
                    <span className="max-w-[100px] sm:max-w-[140px] truncate font-semibold">
                      {activePage.name}
                    </span>
                    <span className="hidden md:inline text-[11px] font-mono text-muted-foreground">
                      /{activePage.slug}
                    </span>
                  </>
                ) : (
                  <>
                    <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="font-medium text-muted-foreground">Pilih Profil</span>
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
                <div className="absolute left-0 top-full mt-2 w-72 rounded-2xl border border-border bg-card p-2 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-2.5 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between border-b border-border/50 mb-1">
                    <span>Halaman Profil ({pages.length})</span>
                    <span className="font-mono text-[9px] lowercase opacity-80">pilih profil</span>
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-1 scrollbar-thin">
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
                                ? "bg-muted font-bold text-foreground ring-1 ring-border"
                                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span
                                className="h-2.5 w-2.5 rounded-full shrink-0 shadow-2xs"
                                style={{ backgroundColor: p.accentColor || "#10b981" }}
                              />
                              <div className="text-left truncate">
                                <p className="truncate text-xs font-semibold text-foreground">{p.name}</p>
                                <p className="font-mono text-[10px] text-muted-foreground">openlynk.id/{p.slug}</p>
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

                  {/* Option: Buat Halaman Baru */}
                  {onNewPageClick && (
                    <div className="border-t border-border/60 pt-1.5 mt-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setPageDropdownOpen(false);
                          onNewPageClick();
                        }}
                        className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-muted/60 hover:bg-muted px-2.5 py-2 text-xs font-semibold text-foreground transition-colors cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5 text-emerald-500" />
                        <span>Buat Halaman Profil Baru</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Desktop Quick Shortcuts for Active Page (Visit Live & Copy Link) */}
            {activePage && (
              <div className="hidden xl:flex items-center gap-1 pl-1">
                <a
                  href={`/${activePage.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  title="Buka halaman profil publik di tab baru"
                >
                  <Globe className="h-3.5 w-3.5" />
                  <span>Lihat Live</span>
                </a>
                <button
                  type="button"
                  onClick={copyProfileUrl}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                  title="Salin tautan profil publik"
                >
                  {copiedUrl ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="text-emerald-500 font-semibold">Tersalin</span>
                    </>
                  ) : (
                    <span>Salin</span>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Mobile Right Bar: Status & Logout (Hidden on Desktop) */}
          <div className="flex lg:hidden items-center gap-2 text-xs shrink-0">
            {currentUser ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={onOpenProfileModal}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background px-2.5 py-1 text-[11px] font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer shadow-2xs"
                  title="Kelola Profil & Langganan"
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isPro ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                  />
                  <span className="max-w-[75px] truncate">{currentUser.name}</span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded-sm ${
                      isPro ? "bg-amber-500/20 text-amber-500" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isPro ? "PRO" : "FREE"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center rounded-full border border-border p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  title="Keluar"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <Link
                href="/masuk"
                className="inline-flex items-center gap-1 rounded-full bg-foreground text-background px-3 py-1 text-[11px] font-semibold"
              >
                <UserIcon className="h-3 w-3" />
                <span>Masuk</span>
              </Link>
            )}
          </div>
        </div>

        {/* Center Section on Desktop: Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none justify-start lg:justify-center">
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
                    ? "bg-foreground text-background shadow-xs font-bold ring-1 ring-foreground/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{t.label}</span>
                {t.count !== undefined && t.count > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                      isActive
                        ? "bg-background text-foreground font-bold"
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

        {/* Right Section on Desktop: Status & User Info */}
        <div className="hidden lg:flex items-center gap-3 text-xs shrink-0">
          {currentUser ? (
            <button
              type="button"
              onClick={onOpenProfileModal}
              className="flex items-center gap-2 rounded-full border border-border/80 bg-background/80 hover:bg-muted/80 pl-1.5 pr-3 py-1 text-xs text-muted-foreground shadow-2xs transition-all cursor-pointer group"
              title="Kelola Profil & Paket Langganan"
            >
              <div className="relative flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted border border-border text-[11px] font-bold text-foreground">
                {currentUser.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={currentUser.avatar} alt={currentUser.name} className="h-full w-full object-cover" />
                ) : (
                  <span>{currentUser.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <span className="font-semibold text-foreground max-w-[120px] truncate group-hover:text-primary transition-colors">
                {currentUser.name}
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  isPro
                    ? "bg-amber-500/20 text-amber-500 border border-amber-500/30 shadow-2xs"
                    : "bg-muted text-muted-foreground border border-border"
                }`}
              >
                {isPro && <Crown className="h-2.5 w-2.5 fill-current" />}
                {isPro ? "PRO" : "FREE"}
              </span>
            </button>
          ) : (
            <div className="flex items-center gap-2 rounded-full border border-border/80 bg-background/80 px-3 py-1.5 text-xs text-muted-foreground shadow-2xs">
              <span
                className={`h-2 w-2 rounded-full transition-colors ${
                  hasToken
                    ? "bg-blue-500 shadow-xs shadow-blue-500/50"
                    : "bg-zinc-400"
                }`}
              />
              <span className="font-medium text-foreground">
                {hasToken ? "Admin Mode" : "Sandbox"}
              </span>
            </div>
          )}

          {currentUser ? (
            <button
              type="button"
              onClick={handleLogout}
              title="Keluar dari sesi akun"
              className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-card px-3.5 py-1.5 font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30 transition-all shadow-2xs cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Keluar</span>
            </button>
          ) : (
            <Link
              href="/masuk"
              className="inline-flex items-center gap-1.5 rounded-full bg-foreground text-background px-4 py-1.5 font-semibold hover:opacity-90 transition-all shadow-2xs"
            >
              <UserIcon className="h-3.5 w-3.5" />
              <span>Masuk</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
