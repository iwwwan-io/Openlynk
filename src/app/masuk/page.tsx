"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense, useEffect } from "react";
import { GradientButton } from "@/components/primitives";
import { Label } from "@/components/ui/label";
import { GoogleButton, OAuthDivider } from "@/components/google-button";
import { LogIn, Sparkles, Loader2, ArrowLeft, Eye, EyeOff } from "lucide-react";

const OAUTH_ERRORS: Record<string, string> = {
  cancelled: "Login Google dibatalkan. Silakan coba lagi.",
  state: "Sesi login kedaluwarsa. Silakan ulangi dari awal.",
  exchange: "Gagal terhubung ke Google. Silakan coba lagi.",
  unverified: "Email Google Anda belum terverifikasi.",
  unconfigured: "Login Google belum dikonfigurasi server.",
  rate: "Terlalu banyak percobaan. Tunggu sebentar.",
};

function MasukForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(() => {
    const e = searchParams.get("error");
    return e && OAUTH_ERRORS[e] ? OAUTH_ERRORS[e] : "";
  });
  const [sessionCheck, setSessionCheck] = useState<"checking" | "guest">("checking");
  // Jika sudah login, jangan tampilkan form — langsung lempar ke tujuan/dashboard
  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (cancelled) return;
        if (j?.user) {
          router.replace(redirectPath);
        } else {
          setSessionCheck("guest");
        }
      })
      .catch(() => {
        if (!cancelled) setSessionCheck("guest");
      });
    return () => {
      cancelled = true;
    };
  }, [router, redirectPath, searchParams]);

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
      {sessionCheck === "checking" ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Memeriksa sesi...</span>
        </div>
      ) : (
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
            <Label htmlFor="email" className="mb-1.5 block text-xs font-semibold">
              Alamat Email
            </Label>
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
              <Label htmlFor="password" className="text-xs font-semibold">
                Password
              </Label>
              <Link
                href="/lupa-password"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Lupa password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 pr-11 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
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

        <div className="space-y-3">
          <OAuthDivider />
          <GoogleButton href={`/api/auth/google?redirect=${encodeURIComponent(redirectPath)}`} />
        </div>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          Belum memiliki akun kreator?{" "}
          <Link href="/daftar" className="font-semibold text-primary underline underline-offset-4">
            Daftar gratis
          </Link>
        </div>
      </div>
      )}
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
