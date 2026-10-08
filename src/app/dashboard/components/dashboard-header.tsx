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
  Sun,
  Moon,
  ExternalLink,
  Copy,
  Settings,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import type { User, Page } from "@/lib/types";
import { useTheme } from "@/components/theme";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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
  const { isDark, toggle: toggleTheme } = useTheme();

  const pageDropdownRef = useRef<HTMLDivElement>(null);

  // Tema awal diterapkan oleh <ThemeProvider /> di layout; hook menyinkronkan ikon + toggle.

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

  // Tutup dropdown halaman saat klik di luar (dropdown user ditangani DropdownMenu)
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (pageDropdownRef.current && !pageDropdownRef.current.contains(target)) {
        setPageDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    { id: "pages", label: "Studio Bento", icon: LayoutGrid },
    { id: "store", label: "Pesanan & Toko", icon: ShoppingBag, count: ordersCount },
    { id: "coupons", label: "Kupon Diskon", icon: Tag },
    { id: "analytics", label: "Analitik Trafik", icon: BarChart3 },
    { id: "finance", label: "Dompet & Saldo", icon: Wallet },
    { id: "settings", label: "Pengaturan", icon: KeyRound },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-card/85 backdrop-blur-xl transition-colors">
      {/* TIER 1: Sleek Brand Bar, Workspace Switcher & User Actions */}
      <div className="border-b border-border/40">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Left: Brand + Breadcrumb Slash + Page Switcher + Live Link */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 group shrink-0"
              title="Kembali ke Beranda OpenLynk"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-foreground text-background font-display font-black text-sm shadow-xs group-hover:scale-105 transition-transform">
                OL
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-extrabold text-base tracking-tight text-foreground">
                  OpenLynk
                </span>
                <span className="hidden sm:inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider border border-border/50">
                  Studio
                </span>
              </div>
            </Link>

            {/* Separator Slash */}
            <span className="text-border/80 font-light select-none hidden sm:inline">/</span>

            {/* Page Switcher Dropdown */}
            <div className="relative" ref={pageDropdownRef}>
              <button
                type="button"
                onClick={() => setPageDropdownOpen((v) => !v)}
                className={`group flex items-center gap-2 rounded-xl border px-2.5 sm:px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                  pageDropdownOpen
                    ? "border-foreground/30 bg-muted text-foreground ring-2 ring-foreground/10"
                    : "border-border/70 bg-background/80 hover:bg-muted text-foreground"
                }`}
                title="Pilih halaman profil aktif"
              >
                {activePage ? (
                  <>
                    <span
                      className="h-2 w-2 rounded-full shrink-0 shadow-2xs transition-transform group-hover:scale-125"
                      style={{ backgroundColor: activePage.accentColor || "#10b981" }}
                    />
                    <span className="max-w-[100px] sm:max-w-[150px] truncate font-semibold text-foreground">
                      {activePage.name}
                    </span>
                    <span className="hidden md:inline text-[11px] font-mono text-muted-foreground">
                      /{activePage.slug}
                    </span>
                  </>
                ) : (
                  <>
                    <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">Pilih Profil</span>
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
                  <div className="px-2.5 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between border-b border-border/50 mb-1">
                    <span>Halaman Profil ({pages.length})</span>
                    <span className="font-mono text-[9px] lowercase opacity-80">pilih profil</span>
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-1 scrollbar-thin">
                    {pages.length === 0 ? (
                      <div className="p-4 text-center text-xs text-muted-foreground">
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

            {/* Quick Link & Copy for Active Page */}
            {activePage && (
              <div className="hidden sm:flex items-center gap-1 border-l border-border/70 pl-2">
                <a
                  href={`/${activePage.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  title="Lihat halaman profil live di tab baru"
                >
                  <Globe className="h-3.5 w-3.5" />
                  <span className="hidden md:inline">Lihat Live</span>
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>

                <button
                  type="button"
                  onClick={copyProfileUrl}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                  title="Salin tautan profil"
                >
                  {copiedUrl ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="text-emerald-500 font-semibold text-[11px]">Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span className="hidden md:inline text-[11px]">Salin</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Right: Theme Toggle & Unified User Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Theme Toggle Button */}
            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border/70 bg-background/80 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                  >
                    {isDark ? (
                      <Sun className="size-4 text-amber-400" />
                    ) : (
                      <Moon className="size-4 text-zinc-700" />
                    )}
                  </button>
                }
              />
              <TooltipContent>{isDark ? "Beralih ke Mode Terang" : "Beralih ke Mode Gelap"}</TooltipContent>
            </Tooltip>

            {/* User Profile Dropdown or Login */}
            {currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <button
                      type="button"
                      className="flex items-center gap-2 rounded-xl border border-border/70 bg-background/80 p-1 text-xs transition-all hover:bg-muted sm:pr-2.5"
                      title="Menu Akun Pengguna"
                    >
                      <Avatar className="size-7 rounded-lg font-display text-xs font-bold shadow-2xs">
                        {currentUser.avatar && (
                          <AvatarImage
                            src={currentUser.avatar}
                            alt={currentUser.name}
                            className="object-cover"
                          />
                        )}
                        <AvatarFallback className="rounded-lg bg-foreground text-background">
                          {currentUser.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden max-w-[110px] truncate text-left font-semibold text-foreground sm:inline">
                        {currentUser.name}
                      </span>
                      <span
                        className={`hidden items-center gap-0.5 rounded-full px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider md:inline-flex ${
                          isPro
                            ? "border border-amber-500/30 bg-amber-500/15 text-amber-600 dark:text-amber-400"
                            : "border border-border bg-muted text-muted-foreground"
                        }`}
                      >
                        {isPro && <Crown className="size-2.5 fill-current" />}
                        {isPro ? "PRO" : "FREE"}
                      </span>
                      <ChevronDown className="size-3 text-muted-foreground" />
                    </button>
                  }
                />
                <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate font-bold text-sm text-foreground">
                          {currentUser.name}
                        </span>
                        <span
                          className={`inline-flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider ${
                            isPro
                              ? "border border-amber-500/30 bg-amber-500/15 text-amber-600 dark:text-amber-400"
                              : "border border-border bg-muted text-muted-foreground"
                          }`}
                        >
                          {isPro && <Crown className="size-2.5 fill-current" />}
                          {isPro ? "PRO" : "FREE"}
                        </span>
                      </span>
                      <span className="block truncate font-mono text-[11px] font-normal text-muted-foreground">
                        {currentUser.email}
                      </span>
                    </DropdownMenuLabel>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => onOpenProfileModal?.()}>
                      <Settings />
                      <span>Kelola Profil & Akun</span>
                    </DropdownMenuItem>
                    {activePage && (
                      <DropdownMenuItem
                        render={
                          <a
                            href={`/${activePage.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Globe />
                            <span>Buka Profil Live</span>
                            <ExternalLink />
                          </a>
                        }
                      />
                    )}
                    {currentUser?.role === "admin" && (
                      <DropdownMenuItem
                        render={
                          <Link href="/admin">
                            <ShieldCheck />
                            <span>Panel Admin Platform</span>
                          </Link>
                        }
                      />
                    )}
                    {!isPro && (
                      <DropdownMenuItem onClick={() => onOpenProfileModal?.()}>
                        <Sparkles />
                        <span>Upgrade ke PRO</span>
                        <DropdownMenuShortcut>Rp 49rb</DropdownMenuShortcut>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                    <LogOut />
                    <span>Keluar dari Akun</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-border/70 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      hasToken ? "bg-blue-500" : "bg-zinc-400"
                    }`}
                  />
                  {hasToken ? "Admin" : "Demo"}
                </span>
                <Link
                  href="/masuk"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-foreground text-background px-3.5 py-1.5 text-xs font-semibold hover:opacity-90 transition-all shadow-2xs"
                >
                  <UserIcon className="h-3.5 w-3.5" />
                  <span>Masuk</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TIER 2: Clean, Spacious Horizontal Navigation Tabs */}
      <div className="bg-card/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2 scrollbar-none">
            {tabs.map((t) => {
              const Icon = t.icon;
              const isActive = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onTabChange(t.id)}
                  className={`flex shrink-0 items-center gap-2 rounded-xl px-3 sm:px-3.5 py-1.5 text-xs font-medium transition-all duration-150 cursor-pointer ${
                    isActive
                      ? "bg-foreground text-background font-bold shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{t.label}</span>
                  {t.count !== undefined && t.count > 0 && (
                    <span
                      className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono leading-none ${
                        isActive
                          ? "bg-background/20 text-background font-bold"
                          : "bg-muted text-muted-foreground border border-border/50"
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
      </div>
    </header>
  );
}
