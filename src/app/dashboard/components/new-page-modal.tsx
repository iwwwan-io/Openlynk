"use client";

import { useState } from "react";
import { X, Plus, Loader2 } from "lucide-react";

interface NewPageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (slug: string, name: string) => Promise<void>;
}

export function NewPageModal({ isOpen, onClose, onCreate }: NewPageModalProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

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
              Buat Halaman Profil Baru
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 transition-colors rounded-full"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

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
              className="rounded-xl px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl bg-foreground text-background px-5 py-2 text-xs font-bold shadow-xs hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all"
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
      </div>
    </div>
  );
}
