"use client";

import { useState } from "react";
import { Check, Globe, AlertCircle, Trash2, ArrowUpRight, Copy, User as UserIcon, Crown } from "lucide-react";
import { ConfirmDialog } from "@/components/confirm";
import type { Page, User } from "@/lib/types";

interface SettingsTabProps {
  initialToken: string;
  onSaveToken: (token: string) => void;
  activePage?: Page;
  onUpdateCustomDomain?: (domain: string | null) => Promise<void>;
  currentUser?: User | null;
  onOpenProfileModal?: () => void;
  pageCount?: number;
}

export function SettingsTab({
  activePage,
  onUpdateCustomDomain,
  currentUser,
  onOpenProfileModal,
  pageCount = 0,
}: SettingsTabProps) {
  // Custom Domain state
  const [domainInput, setDomainInput] = useState(activePage?.customDomain || "");
  const [isSavingDomain, setIsSavingDomain] = useState(false);
  const [domainError, setDomainError] = useState("");
  const [domainSuccess, setDomainSuccess] = useState(false);
  const [copiedRecord, setCopiedRecord] = useState<string | null>(null);
  const [confirmRemoveDomain, setConfirmRemoveDomain] = useState(false);

  async function handleSaveDomain(e: React.FormEvent) {
    e.preventDefault();
    if (!onUpdateCustomDomain) return;
    setDomainError("");
    setDomainSuccess(false);

    const cleanDomain = domainInput.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");

    try {
      setIsSavingDomain(true);
      await onUpdateCustomDomain(cleanDomain || null);
      setDomainSuccess(true);
      setTimeout(() => setDomainSuccess(false), 3000);
    } catch (err: unknown) {
      setDomainError(err instanceof Error ? err.message : "Gagal menyimpan domain kustom.");
    } finally {
      setIsSavingDomain(false);
    }
  }

  async function handleRemoveDomain() {
    if (!onUpdateCustomDomain) return;
    try {
      setIsSavingDomain(true);
      await onUpdateCustomDomain(null);
      setDomainInput("");
      setDomainSuccess(true);
      setTimeout(() => setDomainSuccess(false), 3000);
    } catch (err: unknown) {
      setDomainError(err instanceof Error ? err.message : "Gagal menghapus domain.");
    } finally {
      setIsSavingDomain(false);
    }
  }

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedRecord(id);
    setTimeout(() => setCopiedRecord(null), 2000);
  }

  const isPro = currentUser?.role === "admin" || currentUser?.plan === "pro";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* SECTION 0: USER PROFILE & SUBSCRIPTION STATUS */}
      {currentUser && (
        <div className="lg:col-span-12 rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-muted border border-border text-lg font-bold text-foreground">
                {currentUser.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={currentUser.avatar} alt={currentUser.name} className="h-full w-full object-cover" />
                ) : (
                  <span>{currentUser.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-display text-base sm:text-lg font-bold text-foreground">
                    {currentUser.name}
                  </h3>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                      isPro
                        ? "bg-amber-500/20 text-amber-500 border border-amber-500/30 shadow-2xs"
                        : "bg-muted text-muted-foreground border border-border"
                    }`}
                  >
                    {isPro && <Crown className="h-3 w-3 fill-current" />}
                    {isPro ? "OpenLynk PRO" : "Paket Free"}
                  </span>
                  {currentUser.role === "admin" && (
                    <span className="rounded-full bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 text-[10px] font-semibold text-blue-400">
                      Admin
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground font-mono">
                  {currentUser.email} • {isPro ? "Halaman Unlimited" : `Kuota: ${pageCount}/1 Halaman`}
                </p>
              </div>
            </div>

            {onOpenProfileModal && (
              <button
                type="button"
                onClick={onOpenProfileModal}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-foreground text-background px-5 py-2.5 text-xs font-bold shadow-xs hover:opacity-90 active:scale-95 transition-all cursor-pointer self-start sm:self-auto"
              >
                <UserIcon className="h-4 w-4" />
                <span>Kelola Profil & Langganan</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* SECTION 1: CUSTOM DOMAIN SETTINGS */}
      <div className="lg:col-span-12 rounded-3xl border border-border bg-card p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <Globe className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">Domain Kustom</h2>
              <p className="text-xs text-muted-foreground">
                Gunakan domain web atau subdomain Anda sendiri (misal:{" "}
                <span className="font-mono text-foreground font-semibold">bio.brandanda.com</span>)
              </p>
            </div>
          </div>

          {activePage?.customDomain && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Domain Terhubung
            </span>
          )}
        </div>

        {activePage ? (
          <form onSubmit={handleSaveDomain} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-foreground">
                Domain / Subdomain Anda
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-muted-foreground">
                    https://
                  </span>
                  <input
                    type="text"
                    value={domainInput}
                    onChange={(e) => setDomainInput(e.target.value)}
                    placeholder="links.namabrand.com atau namaanda.id"
                    className="w-full rounded-xl border border-border bg-background pl-20 pr-3.5 py-2.5 text-sm font-mono outline-none focus:border-foreground transition"
                  />
                </div>
                {activePage.customDomain && (
                  <button
                    type="button"
                    onClick={() => setConfirmRemoveDomain(true)}
                    disabled={isSavingDomain}
                    className="rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-rose-600 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-400 transition"
                    title="Hapus domain kustom"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <p className="mt-1.5 text-[11px] text-muted-foreground leading-relaxed">
                Tautkan domain unik Anda agar pengunjung mengakses tautan dan produk digital Anda di bawah merek Anda sendiri.
              </p>
            </div>

            {domainError && (
              <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-600 dark:text-rose-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{domainError}</span>
              </div>
            )}

            {domainSuccess && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-600 dark:text-emerald-400">
                <Check className="h-4 w-4 shrink-0" />
                <span>Domain kustom berhasil diperbarui!</span>
              </div>
            )}

            {/* DNS Instructions Guide */}
            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 text-xs space-y-2.5">
              <div className="font-semibold text-foreground flex items-center justify-between">
                <span>Konfigurasi DNS di Penyedia Domain (Cloudflare, Niagahoster, Domainesia, dsb):</span>
              </div>
              <div className="overflow-x-auto text-[11px]">
                <table className="w-full text-left font-mono">
                  <thead>
                    <tr className="border-b border-border/60 text-muted-foreground">
                      <th className="pb-1.5 pr-2 font-medium">Tipe</th>
                      <th className="pb-1.5 pr-2 font-medium">Nama / Host</th>
                      <th className="pb-1.5 pr-2 font-medium">Target / Value</th>
                      <th className="pb-1.5 text-right font-medium">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 text-foreground">
                    <tr>
                      <td className="py-2 pr-2 font-bold text-emerald-500">CNAME</td>
                      <td className="py-2 pr-2 text-muted-foreground">bio (atau subdomain)</td>
                      <td className="py-2 pr-2 text-foreground">cname.openlynk.id</td>
                      <td className="py-2 text-right">
                        <button
                          type="button"
                          onClick={() => copyToClipboard("cname.openlynk.id", "cname")}
                          className="text-[10px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                        >
                          {copiedRecord === "cname" ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                          <span>{copiedRecord === "cname" ? "Tersalin" : "Salin"}</span>
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-2 font-bold text-blue-500">A</td>
                      <td className="py-2 pr-2 text-muted-foreground">@ (root domain)</td>
                      <td className="py-2 pr-2 text-foreground">76.76.21.21</td>
                      <td className="py-2 text-right">
                        <button
                          type="button"
                          onClick={() => copyToClipboard("76.76.21.21", "a")}
                          className="text-[10px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                        >
                          {copiedRecord === "a" ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                          <span>{copiedRecord === "a" ? "Tersalin" : "Salin"}</span>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              {activePage.customDomain ? (
                <a
                  href={`https://${activePage.customDomain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium hover:underline"
                >
                  <span>Buka {activePage.customDomain}</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              ) : (
                <div />
              )}

              <button
                type="submit"
                disabled={isSavingDomain}
                className="inline-flex items-center gap-1.5 rounded-full bg-foreground text-background px-6 py-2.5 text-xs font-bold shadow-xs hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
              >
                {isSavingDomain ? (
                  <span>Menyimpan...</span>
                ) : (
                  <span>Hubungkan Domain</span>
                )}
              </button>
            </div>
          </form>
        ) : (
          <p className="text-xs text-muted-foreground">Pilih atau buat profil halaman terlebih dahulu untuk mengatur domain.</p>
        )}
      </div>

      <ConfirmDialog
        open={confirmRemoveDomain}
        onOpenChange={setConfirmRemoveDomain}
        title="Hapus domain kustom?"
        description="Pengunjung tidak lagi bisa mengakses halaman via domain ini."
        confirmLabel="Ya, hapus"
        danger
        busy={isSavingDomain}
        onConfirm={handleRemoveDomain}
      />
    </div>
  );
}
