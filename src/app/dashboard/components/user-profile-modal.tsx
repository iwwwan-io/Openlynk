"use client";

import { useState } from "react";
import {
  X,
  User as UserIcon,
  Crown,
  CheckCircle2,
  Sparkles,
  Zap,
  Loader2,
  Mail,
  Shield,
  Layers,
} from "lucide-react";
import type { User } from "@/lib/types";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  pageCount: number;
  onProfileUpdated: (updatedUser: User) => void;
}

export function UserProfileModal({
  isOpen,
  onClose,
  currentUser,
  pageCount,
  onProfileUpdated,
}: UserProfileModalProps) {
  const [name, setName] = useState(currentUser?.name || "");
  const [avatar, setAvatar] = useState(currentUser?.avatar || "");
  const [loading, setLoading] = useState(false);
  const [planLoading, setPlanLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!isOpen || !currentUser) return null;

  const isPro = currentUser.role === "admin" || currentUser.plan === "pro";

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || currentUser?.name,
          avatar: avatar.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal memperbarui profil");
      }

      onProfileUpdated(data.user);
      setSuccess("Profil berhasil disimpan!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  async function handleTogglePlan(targetPlan: "free" | "pro") {
    setError("");
    setSuccess("");
    setPlanLoading(true);

    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: targetPlan,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal mengubah paket langganan");
      }

      onProfileUpdated(data.user);
      setSuccess(
        targetPlan === "pro"
          ? "Selamat! Akun Anda berhasil di-upgrade ke OpenLynk PRO 👑"
          : "Paket berhasil dialihkan ke Free."
      );
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat mengubah paket");
    } finally {
      setPlanLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-t-[32px] sm:rounded-3xl border border-border/80 bg-card p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Grabber */}
        <div className="mx-auto h-1 w-10 rounded-full bg-muted-foreground/30 sm:hidden mb-1" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground text-background">
              <UserIcon className="h-4 w-4" />
            </span>
            <div>
              <h3 className="font-display text-base font-bold text-foreground">
                Profil & Paket Akun
              </h3>
              <p className="text-xs text-muted-foreground">
                Kelola informasi identitas dan status langganan kreator Anda
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-400 font-medium flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {success}
          </div>
        )}

        {/* Card: Status Paket Langganan */}
        <div
          className={`relative overflow-hidden rounded-2xl border p-4.5 transition-all ${
            isPro
              ? "border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-card to-emerald-500/10 shadow-sm"
              : "border-border/80 bg-muted/30"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide uppercase ${
                    isPro
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-xs shadow-amber-500/30"
                      : "bg-muted text-muted-foreground border border-border"
                  }`}
                >
                  {isPro ? (
                    <>
                      <Crown className="h-3 w-3 fill-current" />
                      OpenLynk PRO
                    </>
                  ) : (
                    "Paket Free"
                  )}
                </span>
                {currentUser.role === "admin" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 text-[10px] font-semibold text-blue-400">
                    <Shield className="h-2.5 w-2.5" />
                    Admin
                  </span>
                )}
              </div>

              <h4 className="mt-2 text-sm font-bold text-foreground">
                {isPro ? "Akses Tanpa Batas Aktif" : "Batas Maksimal: 1 Halaman"}
              </h4>
              <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                {isPro
                  ? "Anda dapat membuat halaman profil tanpa batas, menggunakan domain kustom, serta fitur kreator pro."
                  : `Pengguna paket Free hanya dapat memiliki 1 halaman aktif. (Terpakai: ${pageCount}/1)`}
              </p>
            </div>

            <div className="flex flex-col items-end shrink-0">
              <span className="text-[11px] font-mono font-medium text-muted-foreground flex items-center gap-1">
                <Layers className="h-3 w-3" />
                {pageCount} {pageCount > 1 ? "Halaman" : "Halaman"}
              </span>
            </div>
          </div>

          {/* Action Upgrade / Switch Plan */}
          <div className="mt-4 pt-3 border-t border-border/50 flex flex-wrap items-center justify-between gap-2">
            {!isPro ? (
              <>
                <div className="flex items-center gap-1.5 text-xs text-amber-500 font-medium">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Dapatkan halaman unlimited & fitur premium</span>
                </div>
                <button
                  type="button"
                  disabled={planLoading}
                  onClick={() => handleTogglePlan("pro")}
                  className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black px-4 py-1.5 text-xs font-bold shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  {planLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Zap className="h-3.5 w-3.5 fill-current" />
                  )}
                  <span>Upgrade ke Pro (Aktifkan)</span>
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Semua fitur Pro terbuka penuh</span>
                </div>
                {currentUser.role !== "admin" && (
                  <button
                    type="button"
                    disabled={planLoading}
                    onClick={() => handleTogglePlan("free")}
                    className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-background/80 hover:bg-muted px-3 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-all cursor-pointer disabled:opacity-50"
                    title="Uji coba batas paket Free"
                  >
                    {planLoading && <Loader2 className="h-3 w-3 animate-spin" />}
                    <span>Beralih ke Free</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Form: Identitas Profil User */}
        <form onSubmit={handleSaveProfile} className="space-y-4 pt-1">
          {/* Avatar Preview & URL */}
          <div className="flex items-center gap-4">
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted/60 text-lg font-bold text-foreground">
              {avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatar}
                  alt={name || "Avatar"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>{(name || currentUser.name || "U").charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-xs font-semibold text-foreground">
                URL Foto Profil / Avatar
              </label>
              <input
                type="url"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://... (URL gambar avatar)"
                className="w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-foreground/50 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Nama Lengkap */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Nama Lengkap
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama Lengkap Anda"
              className="w-full rounded-xl border border-border/80 bg-background px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-foreground/50 focus:outline-hidden"
            />
          </div>

          {/* Email (Readonly) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>Alamat Email</span>
              <span className="text-[10px] text-muted-foreground font-normal">
                (Terkunci untuk keamanan login)
              </span>
            </label>
            <div className="relative">
              <input
                type="email"
                disabled
                value={currentUser.email}
                className="w-full rounded-xl border border-border/50 bg-muted/40 px-3.5 py-2.5 text-xs text-muted-foreground opacity-80 cursor-not-allowed"
              />
              <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-border/80 bg-card px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              Tutup
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-full bg-foreground text-background px-5 py-2 text-xs font-bold shadow-xs hover:opacity-90 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>Simpan Perubahan</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
