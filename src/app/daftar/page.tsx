"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { GradientButton } from "@/components/ui";
import { UserPlus, Sparkles, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";

function DaftarForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSlug = searchParams.get("slug") || "";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [slug, setSlug] = useState(initialSlug);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Semua bidang wajib diisi");
      return;
    }
    if (password.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          slugToClaim: slug.trim().toLowerCase() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal mendaftar. Silakan coba lagi.");
        setLoading(false);
        return;
      }

      if (data.token) {
        localStorage.setItem("openlynk_session_token", data.token);
      }

      // Jika berhasil klaim halaman, arahkan ke dashboard halaman tersebut
      if (data.claimedSlug) {
        router.push(`/dashboard/studio/${data.claimedSlug}`);
      } else {
        router.push("/dashboard");
      }
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

        <div className="mb-6 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
            <UserPlus className="h-6 w-6" />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Buat Akun Kreator</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Mulai bangun bio bento, terima traktir kopi, dan jual produk digital Anda.
          </p>
        </div>

        {slug && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>
              Username <strong className="font-mono">/{slug}</strong> akan otomatis diklaim untuk akun Anda!
            </span>
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs font-medium text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5" htmlFor="name">
              Nama Lengkap / Nama Kreator
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Rian Pratama"
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

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
            <label className="block text-xs font-semibold mb-1.5" htmlFor="password">
              Password (min. 6 karakter)
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

          {!initialSlug && (
            <div>
              <label className="block text-xs font-semibold mb-1.5" htmlFor="slug">
                Klaim Username Laman (Opsional)
              </label>
              <div className="flex items-center rounded-xl border border-input bg-background overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                <span className="pl-3.5 pr-1 text-sm text-muted-foreground select-none">openlynk.id/</span>
                <input
                  id="slug"
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                  placeholder="namamu"
                  className="w-full py-2.5 pr-3 text-sm outline-none bg-transparent"
                />
              </div>
            </div>
          )}

          <div className="pt-2">
            <GradientButton type="submit" disabled={loading} className="w-full py-2.5">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Mendaftarkan...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>Daftar Akun Gratis</span>
                  <Sparkles className="h-4 w-4" />
                </span>
              )}
            </GradientButton>
          </div>
        </form>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          Sudah punya akun?{" "}
          <Link href="/masuk" className="font-semibold text-primary underline underline-offset-4">
            Masuk di sini
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function DaftarPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Memuat...</div>}>
      <DaftarForm />
    </Suspense>
  );
}
