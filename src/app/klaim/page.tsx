"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { GradientButton } from "@/components/ui";

function KlaimContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [slug, setSlug] = useState(() => searchParams.get("slug") ?? "");
  const [debounced, setDebounced] = useState("");
  const [available, setAvailable] = useState<boolean | undefined>(undefined);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebounced(slug.trim().toLowerCase()), 500);
    return () => clearTimeout(t);
  }, [slug]);

  useEffect(() => {
    if (!debounced) {
      // reset saat input kosong
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAvailable(undefined);
      return;
    }
    setChecking(true);
    fetch(`/api/pages?slug=${encodeURIComponent(debounced)}`)
      .then((r) => r.json())
      .then((j) => {
        setAvailable(j.available ?? false);
        setError(j.error ?? (j.available ? "" : "Slug sudah dipakai"));
      })
      .catch(() => setAvailable(false))
      .finally(() => setChecking(false));
  }, [debounced]);

  async function claim() {
    if (!debounced || checking || !available) return;

    // Cek apakah user sudah login
    const meRes = await fetch("/api/auth/me")
      .then((r) => r.json())
      .catch(() => ({ user: null }));

    if (!meRes.user) {
      // Belum login: arahkan ke pendaftaran akun kreator baru dengan klaim otomatis
      router.push(`/daftar?slug=${encodeURIComponent(debounced)}`);
      return;
    }

    const t = localStorage.getItem("openlynk_admin") ?? "";
    const res = await fetch("/api/pages", {
      method: "POST",
      headers: t
        ? { "Content-Type": "application/json", Authorization: `Bearer ${t}` }
        : { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: debounced, name: debounced }),
    });
    if (!res.ok) {
      setError((await res.json()).error ?? "gagal");
      return;
    }
    router.push(`/dashboard/studio/${debounced}`);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-foreground">
      <div className="animate-fade-up w-full max-w-md rounded-2xl border border-border/50 bg-card p-8 shadow-lg">
        <div className="mb-8 flex flex-col items-center">
          <Link href="/">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 font-display text-xl font-bold text-white">
              O
            </span>
          </Link>
          <h1 className="mt-4 font-display text-3xl font-bold">Klaim halamanmu</h1>
          <p className="mt-1 text-sm text-muted-foreground">Pilih slug untuk halaman OpenLynk</p>
        </div>
        <div className="space-y-4">
          <div className="flex h-12 items-center gap-x-1 rounded-xl border border-border bg-background px-4 shadow-sm">
            <span className="text-sm text-muted-foreground">openlynk/</span>
            <input
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              autoFocus
              placeholder="namamu"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
            {debounced && (
              <span className="ml-auto text-sm">
                {checking ? (
                  <span className="text-muted-foreground">…</span>
                ) : available ? (
                  <span className="text-green-500">✓</span>
                ) : (
                  <span className="text-red-500">✕</span>
                )}
              </span>
            )}
          </div>
          {debounced && !checking && !available && (
            <p className="text-center text-sm text-red-500">{error || "Slug sudah dipakai"}</p>
          )}
          {debounced && !checking && available && (
            <GradientButton className="w-full" onClick={claim}>
              Klaim halamanku
            </GradientButton>
          )}
          <p className="text-center">
            <Link href="/" className="text-xs text-muted-foreground transition-colors hover:text-foreground">
              ← Kembali
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Klaim() {
  return (
    <Suspense fallback={null}>
      <KlaimContent />
    </Suspense>
  );
}
