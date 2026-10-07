"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { GradientButton } from "@/components/primitives";
import { KeyRound, Mail, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";

function LupaPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetToken = searchParams.get("token") ?? "";
  const [email, setEmail] = useState("");
  const [token, setToken] = useState(presetToken);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [sessionCheck, setSessionCheck] = useState<"checking" | "guest">(
    presetToken ? "guest" : "checking"
  );

  // Reset via email hanya untuk yang belum login; yang sudah login kelola lewat dashboard.
  // Tautan dari email membawa token — tetap izinkan meski ada sesi.
  useEffect(() => {
    if (presetToken) return;
    let cancelled = false;
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (cancelled) return;
        if (j?.user) {
          router.replace("/dashboard");
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
  }, [router, presetToken]);

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memproses");
      // Di dev, token dikembalikan untuk testing
      if (data.debugToken) {
        setToken(data.debugToken);
        setSuccess(`Tautan reset dibuat (mode dev). Token: ${data.debugToken}`);
      } else {
        setSuccess("Jika email terdaftar, tautan reset telah dikirim. Cek inbox/spam (berlaku 1 jam).");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Konfirmasi password tidak cocok");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mereset password");
      setSuccess("Password berhasil diubah! Silakan masuk dengan password baru.");
      setToken("");
      setPassword("");
      setConfirm("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
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
          href="/masuk"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Kembali Masuk</span>
        </Link>
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
            <KeyRound className="h-6 w-6" />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            {token ? "Buat password baru" : "Lupa password?"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {token
              ? "Masukkan password baru Anda (min. 6 karakter)."
              : "Masukkan email akun, kami kirim tautan reset 1 jam."}
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs font-medium text-destructive">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
            <span className="break-all">{success}</span>
          </div>
        )}

        {!token ? (
          <form onSubmit={handleRequest} className="space-y-4">
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
            <GradientButton type="submit" disabled={loading} className="w-full py-2.5">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Mengirim...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>Kirim tautan reset</span>
                </span>
              )}
            </GradientButton>
          </form>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" htmlFor="token">
                Token reset
              </label>
              <input
                id="token"
                type="text"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Token dari email"
                className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-xs font-mono outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" htmlFor="password">
                Password baru
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" htmlFor="confirm">
                Konfirmasi password baru
              </label>
              <input
                id="confirm"
                type="password"
                required
                minLength={6}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <GradientButton type="submit" disabled={loading} className="w-full py-2.5">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Menyimpan...</span>
                </span>
              ) : (
                <span>Simpan password baru</span>
              )}
            </GradientButton>
          </form>
        )}

        <div className="mt-6 text-center text-xs text-muted-foreground">
          <Link href="/masuk" className="font-semibold text-primary underline underline-offset-4">
            Kembali ke halaman masuk
          </Link>
        </div>
      </div>
      )}
    </div>
  );
}

export default function LupaPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Memuat...</div>}>
      <LupaPasswordContent />
    </Suspense>
  );
}
