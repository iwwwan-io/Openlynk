"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Menu, X, Play, LayoutDashboard, Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/theme";
import { GradientButton } from "@/components/primitives";

const HOME_NAV_ITEMS = [
  { href: "#fitur", label: "Fitur" },
  { href: "#showcase", label: "Showcase" },
  { href: "#perbandingan", label: "Keunggulan" },
  { href: "#harga", label: "Harga" },
  { href: "#faq", label: "FAQ" },
  { href: "/jelajahi", label: "Jelajahi" },
];

const SITE_NAV_ITEMS = [
  { href: "/", label: "Beranda" },
  { href: "/jelajahi", label: "Jelajahi" },
  { href: "/demo", label: "Live Demo" },
  { href: "/akses", label: "Portal Pembeli" },
];

function ThemeToggle() {
  const { isDark, toggle, ready } = useTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Beralih ke mode terang" : "Beralih ke mode gelap"}
      title={isDark ? "Mode Terang" : "Mode Gelap"}
      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border/70 bg-card/60 text-muted-foreground transition-all hover:border-foreground/30 hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
    >
      {ready ? (
        isDark ? (
          <Sun className="h-4 w-4 text-amber-400 transition-transform" aria-hidden />
        ) : (
          <Moon className="h-4 w-4 text-zinc-700 transition-transform" aria-hidden />
        )
      ) : (
        <span className="h-4 w-4" />
      )}
    </button>
  );
}

export function NavbarShell({
  children,
  className = "max-w-6xl",
}: {
  children?: ReactNode;
  className?: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const { isDark, toggle: toggleTheme, ready: themeReady } = useTheme();

  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (!cancelled && j?.user?.name) setUserName(String(j.user.name));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const navItems = isHome ? HOME_NAV_ITEMS : SITE_NAV_ITEMS;

  return (
    <div className="fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 sm:px-4 sm:pt-4">
      <div className={`relative w-full ${className}`}>
        {/* Main Navbar Bar (3-Zone Symmetrical Grid / Flex) */}
        <nav
          aria-label="Navigasi utama"
          className={`flex h-14 w-full items-center justify-between rounded-2xl border px-3 transition-all duration-200 sm:px-4 ${
            scrolled
              ? "border-border/90 bg-background/90 shadow-md backdrop-blur-xl"
              : "border-border/60 bg-background/80 shadow-xs backdrop-blur-md"
          }`}
        >
          {/* ZONE 1: BRAND LOGO */}
          <div className="flex items-center gap-2">
            <Link
              href="/"
              aria-label="OpenLynk — ke beranda"
              className="group flex min-h-[44px] items-center gap-x-2 rounded-xl px-1 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-900 font-display text-sm font-bold text-white shadow-xs transition-transform group-hover:scale-105 dark:bg-white dark:text-zinc-900">
                O
              </span>
              <span className="font-display text-base font-bold tracking-tight text-foreground">
                OpenLynk
              </span>
              <span className="hidden rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 sm:inline-flex dark:text-emerald-400">
                v2.0
              </span>
            </Link>
          </div>

          {/* ZONE 2: CENTERED NAVIGATION LINKS (DESKTOP) */}
          <div className="hidden md:flex items-center gap-1 rounded-full border border-border/60 bg-muted/30 px-3 py-1 backdrop-blur-xs">
            {navItems.map((item) =>
              item.href.startsWith("#") ? (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-full px-2.5 py-1 text-xs font-semibold text-muted-foreground transition-all hover:bg-card hover:text-foreground hover:shadow-xs focus-visible:outline-2 focus-visible:outline-foreground"
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full px-2.5 py-1 text-xs font-semibold text-muted-foreground transition-all hover:bg-card hover:text-foreground hover:shadow-xs focus-visible:outline-2 focus-visible:outline-foreground"
                >
                  {item.label}
                </Link>
              )
            )}
          </div>

          {/* ZONE 3: ACTIONS & AUTH (RIGHT) */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Theme Toggle (Desktop & Tablet) */}
            <ThemeToggle />

            {/* Live Demo Link (Home only, dan hanya jika BELUM login) */}
            {isHome && !userName && (
              <Link
                href="/demo"
                aria-label="Lihat live demo OpenLynk"
                className="hidden lg:inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-semibold text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
              >
                <Play className="h-3 w-3 fill-current text-emerald-500" aria-hidden />
                <span>Demo</span>
              </Link>
            )}

            {/* Auth State Button */}
            {userName ? (
              <Link
                href="/dashboard"
                className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full bg-zinc-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-foreground dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
              >
                <LayoutDashboard className="h-3.5 w-3.5" aria-hidden />
                <span className="max-w-[120px] truncate">Studio</span>
              </Link>
            ) : (
              <Link
                href="/masuk"
                className="hidden sm:inline-flex min-h-[36px] items-center rounded-full px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-foreground"
              >
                Masuk
              </Link>
            )}

            {/* Primary Action Button (Hanya tampil jika BELUM login) */}
            {children ? (
              children
            ) : !userName ? (
              <Link href="/klaim" aria-label="Klaim halaman OpenLynk gratis">
                <GradientButton className="!min-h-[36px] !px-3.5 !py-1.5 !text-xs font-semibold">
                  Mulai Gratis
                </GradientButton>
              </Link>
            ) : null}

            {/* Hamburger Menu Toggle (Mobile) */}
            <button
              type="button"
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Tutup menu navigasi" : "Buka menu navigasi"}
              onClick={() => setOpen((v) => !v)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground md:hidden"
            >
              {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
            </button>
          </div>
        </nav>

        {/* Backdrop Overlay for Mobile Drawer (Dismiss on Click Outside) */}
        {open && (
          <div
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[-1] bg-black/40 backdrop-blur-xs md:hidden"
            aria-hidden="true"
          />
        )}

        {/* Mobile Dropdown Panel */}
        <div
          id="mobile-nav"
          className={`absolute inset-x-0 top-full mt-2 origin-top overflow-hidden rounded-2xl border border-border/80 bg-card/95 shadow-2xl backdrop-blur-xl transition-all duration-200 md:hidden ${
            open
              ? "visible scale-100 opacity-100"
              : "invisible scale-[0.98] opacity-0 pointer-events-none"
          }`}
        >
          <nav aria-label="Navigasi seluler" className="max-h-[75vh] overflow-y-auto p-3">
            <ul className="flex flex-col space-y-1">
              {navItems.map((l) =>
                l.href.startsWith("#") ? (
                  <li key={l.href}>
                    <a
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className="flex min-h-[44px] items-center rounded-xl px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-foreground"
                    >
                      {l.label}
                    </a>
                  </li>
                ) : (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className="flex min-h-[44px] items-center rounded-xl px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                )
              )}
            </ul>

            <div className="mt-3 flex flex-col gap-2 border-t border-border/60 pt-3">
              <div className="flex items-center justify-between px-2 py-1">
                <span className="text-xs font-semibold text-muted-foreground">Tampilan Tema</span>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
                >
                  {themeReady && isDark ? (
                    <>
                      <Sun className="h-3.5 w-3.5 text-amber-400" />
                      <span>Mode Terang</span>
                    </>
                  ) : (
                    <>
                      <Moon className="h-3.5 w-3.5 text-zinc-700" />
                      <span>Mode Gelap</span>
                    </>
                  )}
                </button>
              </div>

              {(!isHome || !userName) && (
                <Link
                  href="/demo"
                  onClick={() => setOpen(false)}
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-border px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  <Play className="h-3.5 w-3.5 fill-current text-emerald-500" aria-hidden />
                  Lihat Live Demo
                </Link>
              )}

              {userName ? (
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900"
                >
                  <LayoutDashboard className="h-4 w-4" aria-hidden />
                  Buka Studio ({userName})
                </Link>
              ) : (
                <Link
                  href="/masuk"
                  onClick={() => setOpen(false)}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-border px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  Masuk ke Akun
                </Link>
              )}

              {!userName && (
                <Link
                  href="/klaim"
                  onClick={() => setOpen(false)}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-emerald-500"
                >
                  Klaim Link Sekarang (Gratis)
                </Link>
              )}
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}

export function HomeFooter() {
  return (
    <footer className="w-full border-t border-border/60 bg-background/50 backdrop-blur-xs mt-20">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-6 px-4 py-10 sm:flex-row text-center sm:text-left">
        <div className="flex flex-col items-center sm:items-start gap-1.5">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-900 font-display text-xs font-bold text-white dark:bg-white dark:text-zinc-900">
              O
            </span>
            <span className="font-display text-sm font-bold">OpenLynk</span>
          </div>
          <p className="text-xs text-muted-foreground max-w-xs">
            Link-in-bio bento & toko kreator Indonesia. Checkout 1-halaman, QRIS instan, dan embed multimedia.
          </p>
        </div>

        <div className="flex flex-col gap-2.5 sm:items-end">
          <div className="flex flex-wrap justify-center sm:justify-end items-center gap-4 text-xs text-muted-foreground font-medium">
            <Link href="/demo" className="transition-colors hover:text-foreground">
              Live Demo
            </Link>
            <Link href="/jelajahi" className="transition-colors hover:text-foreground">
              Jelajahi Kreator
            </Link>
            <Link href="/akses" className="transition-colors hover:text-foreground">
              Portal Pembeli
            </Link>
            <Link href="/dashboard" className="transition-colors hover:text-foreground">
              Studio
            </Link>
            <Link href="/klaim" className="transition-colors hover:text-foreground">
              Klaim Link
            </Link>
          </div>
          <div className="flex flex-wrap justify-center sm:justify-end items-center gap-4 text-[11px] text-muted-foreground/80">
            <Link href="/terms" className="transition-colors hover:text-foreground">
              Syarat & Ketentuan
            </Link>
            <span>•</span>
            <Link href="/privacy" className="transition-colors hover:text-foreground">
              Kebijakan Privasi
            </Link>
            <span>•</span>
            <Link href="/refund" className="transition-colors hover:text-foreground">
              Kebijakan Refund
            </Link>
            <span>•</span>
            <Link href="/kontak" className="transition-colors hover:text-foreground">
              Bantuan & Kontak
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-border/40 py-4 text-center text-[11px] text-muted-foreground">
        © {new Date().getFullYear()} OpenLynk. Open source & mobile-first creator platform.
      </div>
    </footer>
  );
}
