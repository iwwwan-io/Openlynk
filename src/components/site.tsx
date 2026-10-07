"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Menu, X, Play, LayoutDashboard } from "lucide-react";

const HOME_LINKS = [
  { href: "#fitur", label: "Fitur" },
  { href: "#showcase", label: "Showcase" },
  { href: "#harga", label: "Harga" },
  { href: "#faq", label: "FAQ" },
  { href: "/jelajahi", label: "Jelajahi" },
];

const SITE_LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/jelajahi", label: "Jelajahi" },
  { href: "/demo", label: "Live Demo" },
  { href: "/akses", label: "Portal Pembeli" },
];

export function NavbarShell({
  children,
  className = "max-w-5xl",
}: {
  children?: ReactNode;
  className?: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

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

  // Menu ditutup via onClick setiap tautan + tombol Escape (tanpa effect
  // sinkronisasi pathname agar lolos react-hooks/set-state-in-effect).

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open ]);

  const mobileLinks = isHome ? HOME_LINKS : SITE_LINKS;

  return (
    <div className="fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 sm:px-4 sm:pt-4">
      <div className={`relative w-full ${className}`}>
        <nav
          aria-label="Navigasi utama"
          className={`flex h-14 w-full items-center rounded-2xl border px-3 transition-all duration-200 sm:px-4 ${
            scrolled
              ? "border-border bg-background/90 shadow-md backdrop-blur-xl"
              : "border-border/60 bg-background/80 shadow-sm backdrop-blur-md"
          }`}
        >
          <Link
            href="/"
            aria-label="OpenLynk — ke beranda"
            className="flex min-h-[44px] items-center gap-x-2 rounded-xl px-1 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-900 font-display text-sm font-bold text-white shadow-xs transition-transform group-hover:scale-105 dark:bg-white dark:text-zinc-900">
              O
            </span>
            <span className="font-display text-base font-bold tracking-tight">OpenLynk</span>
            <span className="hidden rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 lg:inline-flex dark:text-emerald-400">
              v2.0
            </span>
          </Link>
          <div className="ml-auto flex items-center gap-x-2 sm:gap-x-3">
            {children}
            {userName ? (
              <Link
                href="/dashboard"
                className="hidden min-h-[44px] items-center gap-1.5 rounded-full bg-zinc-900 px-4 text-xs font-semibold text-white transition-all hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground sm:inline-flex dark:bg-white dark:text-zinc-900"
              >
                <LayoutDashboard className="h-3.5 w-3.5" aria-hidden />
                <span className="max-w-[120px] truncate">Studio</span>
              </Link>
            ) : null}
            <button
              type="button"
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Tutup menu navigasi" : "Buka menu navigasi"}
              onClick={() => setOpen((v) => !v)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground md:hidden"
            >
              {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
            </button>
          </div>
        </nav>

        {/* Mobile dropdown panel — transform/opacity only (no layout animation) */}
        <div
          id="mobile-nav"
          className={`absolute inset-x-0 top-full mt-2 origin-top overflow-hidden rounded-2xl border bg-card/95 shadow-xl backdrop-blur-xl transition-all duration-200 md:hidden ${
            open
              ? "visible scale-100 opacity-100"
              : "invisible scale-[0.98] opacity-0"
          }`}
        >
          <nav aria-label="Navigasi seluler" className="max-h-[70vh] overflow-y-auto p-2">
            <ul className="flex flex-col">
              {mobileLinks.map((l) =>
                l.href.startsWith("#") ? (
                  <li key={l.href}>
                    <a
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className="flex min-h-[44px] items-center rounded-xl px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                    >
                      {l.label}
                    </a>
                  </li>
                ) : (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className="flex min-h-[44px] items-center rounded-xl px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                )
              )}
            </ul>
            <div className="mt-1 flex flex-col gap-2 border-t border-border/60 p-2">
              <Link
                href="/demo"
                onClick={() => setOpen(false)}
                className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-border px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
              >
                <Play className="h-3.5 w-3.5 fill-current" aria-hidden />
                Live Demo
              </Link>
              {userName ? (
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-zinc-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground dark:bg-white dark:text-zinc-900"
                >
                  <LayoutDashboard className="h-4 w-4" aria-hidden />
                  Buka Studio
                </Link>
              ) : (
                <Link
                  href="/masuk"
                  onClick={() => setOpen(false)}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-border px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                >
                  Masuk
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
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-6 px-4 py-10 sm:flex-row text-center sm:text-left">
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
