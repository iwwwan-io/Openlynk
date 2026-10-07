"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application runtime error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="relative w-full max-w-md rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-xl text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive border border-destructive/20 shadow-xs">
          <AlertTriangle className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Terjadi Kendala Teknis
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Maaf, kami mengalami kendala saat memproses permintaan Anda. Silakan coba muat ulang halaman atau kembali ke beranda utama.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-foreground text-background px-5 py-2.5 text-xs font-semibold hover:opacity-90 transition-all cursor-pointer shadow-xs"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Coba Lagi</span>
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-muted/50 px-5 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-all"
          >
            <Home className="h-3.5 w-3.5" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
