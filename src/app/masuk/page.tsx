"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { GradientButton } from "@/components/ui";
import { LogIn, Sparkles, Loader2, ArrowLeft } from "lucide-react";

function MasukForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError("Email dan password wajib diisi");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal masuk. Periksa kembali email dan password Anda.");
        setLoading(false);
        return;
      }

      // Simpan session token di localStorage sebagai fallback client
      if (data.token) {
        localStorage.setItem("openlynk_session_token", data.token);
      }

      router.push(redirectPath);
      router.refresh();
    } catch {
      setError("Terjadi kesalahan jaringan. Silakan coba lagi.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-foreground py-12">
      <div className="w-full max-w-md rounded-2xl border border-border/80 bg-card p-8 shadow-xl">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Kembali ke Beranda</span>
        </Link>

        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
            <LogIn className="h-6 w-6" />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Masuk ke OpenLynk</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola laman bio bento, produk toko, dan analitik Anda.
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs font-medium text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5" htmlFor="email">
              Alamat Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="kreator@contoh.id"
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold" htmlFor="password">
                Password
              </label>
            </div>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="pt-2">
            <GradientButton type="submit" disabled={loading} className="w-full py-2.5">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Memproses...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>Masuk Sekarang</span>
                  <Sparkles className="h-4 w-4" />
                </span>
              )}
            </GradientButton>
          </div>
        </form>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          Belum memiliki akun kreator?{" "}
          <Link href="/daftar" className="font-semibold text-primary underline underline-offset-4">
            Daftar gratis
          </Link>
        </div>

        <div className="mt-6 border-t border-border/60 pt-4 text-center text-[11px] text-muted-foreground">
          Akun demo: <span className="font-mono text-foreground font-medium">demo@openlynk.id</span> / <span className="font-mono text-foreground font-medium">password123</span>
        </div>
      </div>
    </div>
  );
}

export default function MasukPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Memuat...</div>}>
      <MasukForm />
    </Suspense>
  );
}
