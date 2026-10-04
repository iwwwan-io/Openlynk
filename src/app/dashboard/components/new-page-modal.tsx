"use client";

import { useState } from "react";
import { X, Plus, Loader2 } from "lucide-react";

interface NewPageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (slug: string, name: string) => Promise<void>;
  isPro?: boolean;
  pageCount?: number;
  onUpgradePro?: () => void;
}

export function NewPageModal({
  isOpen,
  onClose,
  onCreate,
  isPro = false,
  pageCount = 0,
  onUpgradePro,
}: NewPageModalProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const isLimitReached = !isPro && pageCount >= 1;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleanSlug = slug.trim().toLowerCase();
    const cleanName = name.trim();
    if (!cleanSlug) {
      setError("Slug wajib diisi");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await onCreate(cleanSlug, cleanName || cleanSlug);
      setName("");
      setSlug("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat halaman");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-[32px] sm:rounded-3xl border border-border/80 bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Grabber Handle */}
        <div className="mx-auto h-1 w-10 rounded-full bg-muted-foreground/30 sm:hidden mb-1" />

        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-foreground text-background">
              <Plus className="h-4 w-4" />
            </span>
            <h3 className="font-display text-base font-bold text-foreground">
              {isLimitReached ? "Batas Halaman Tercapai" : "Buat Halaman Profil Baru"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 transition-colors rounded-full cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {isLimitReached ? (
          <div className="space-y-4 py-2 text-center sm:text-left">
            <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-card to-amber-500/5 p-4.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 text-amber-500 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider">
                  Batas Paket Free: 1/1 Halaman
                </span>
                <span className="font-mono text-xs text-muted-foreground">Kuota Penuh</span>
              </div>

              <h4 className="text-sm font-bold text-foreground">
                Pengguna Free Hanya Dapat Memiliki 1 Halaman Profil
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Anda sudah memiliki <strong>{pageCount} halaman</strong> aktif. Untuk membuat halaman profil baru tanpa batas, silakan upgrade akun Anda ke <strong>OpenLynk PRO</strong>.
              </p>

              <ul className="text-xs text-muted-foreground space-y-1.5 pt-1 text-left list-disc list-inside">
                <li>Buat halaman profil tak terbatas untuk bisnis & proyek Anda</li>
                <li>Dukungan custom domain pribadi</li>
                <li>Akses penuh ke semua tema & fitur bento eksklusif</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2 border-t border-border/50">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto rounded-xl px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted cursor-pointer"
              >
                Kembali
              </button>
              {onUpgradePro && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onUpgradePro();
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black px-5 py-2 text-xs font-bold shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  <span>👑 Upgrade ke Pro Sekarang</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">
                  Nama Profil / Usaha <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!slug) {
                      setSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]/g, "-")
                          .replace(/-+/g, "-")
                      );
                    }
                  }}
                  placeholder="Contoh: Rian Studio, Toko Kopi Senja"
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-foreground transition"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">
                  URL Slug <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center rounded-xl border border-border bg-background px-3">
                  <span className="text-xs text-muted-foreground font-mono">openlynk.id/</span>
                  <input
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    placeholder="nama-kamu"
                    className="flex-1 bg-transparent py-2.5 text-sm font-mono text-foreground focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-foreground text-background px-5 py-2 text-xs font-bold shadow-xs hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Membuat...</span>
                    </>
                  ) : (
                    <span>Buat Halaman</span>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
