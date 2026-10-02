import Link from "next/link";
import type { ReactNode } from "react";

export function NavbarShell({
  children,
  className = "max-w-5xl",
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
      <nav
        className={`flex h-14 w-full ${className} items-center rounded-full border border-border/60 bg-background/80 px-4 sm:px-6 shadow-sm backdrop-blur-md transition-all`}
      >
        <Link href="/" className="flex items-center gap-x-2.5 group">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 font-display text-sm font-bold text-white shadow-xs group-hover:scale-105 transition-transform dark:bg-white dark:text-zinc-900">
            O
          </span>
          <span className="font-display text-base font-bold tracking-tight">OpenLynk</span>
          <span className="hidden sm:inline-flex rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            v2.0
          </span>
        </Link>
        <div className="ml-auto flex items-center gap-x-2 sm:gap-x-3">{children}</div>
      </nav>
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

        <div className="flex flex-wrap justify-center items-center gap-5 text-xs text-muted-foreground font-medium">
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
            Studio Dashboard
          </Link>
          <Link href="/klaim" className="transition-colors hover:text-foreground">
            Klaim Link
          </Link>
        </div>
      </div>
      <div className="border-t border-border/40 py-4 text-center text-[11px] text-muted-foreground">
        © {new Date().getFullYear()} OpenLynk. Open source & mobile-first creator platform.
      </div>
    </footer>
  );
}
