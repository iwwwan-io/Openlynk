"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Coffee,
  Heart,
  Sparkles,
  Loader2,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import type { BentoSize } from "@/lib/types";
import { formatIDR } from "@/lib/types";
import { fee } from "@/lib/validate";

export function SawerCard({
  bentoId,
  pageId,
  pageName,
  title = "Traktir Kopi ☕",
  message = "Dukung karya dan konten saya dengan mentraktir secangkir kopi hangat.",
  unitName = "Kopi",
  unitPrice = 15000,
  targetAmount,
  currentAmount = 0,
  size = "2x2",
}: {
  bentoId: string;
  pageId: string;
  pageName?: string;
  title?: string;
  message?: string;
  unitName?: string;
  unitPrice?: number;
  targetAmount?: number;
  currentAmount?: number;
  size?: BentoSize;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [unitCount, setUnitCount] = useState(1);
  const [customNominal, setCustomNominal] = useState<number | null>(null);
  const [donorName, setDonorName] = useState("");
  const [donorContact, setDonorContact] = useState("");
  const [supporterMessage, setSupporterMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderResult, setOrderResult] = useState<{ id: string; redirectUrl?: string } | null>(null);

  const pricePerUnit = unitPrice > 0 ? unitPrice : 15000;
  const nominal = customNominal ?? unitCount * pricePerUnit;
  const feeAmount = fee(nominal);
  const totalPay = nominal + feeAmount;

  const progressPercent =
    targetAmount && targetAmount > 0
      ? Math.min(Math.round((currentAmount / targetAmount) * 100), 100)
      : null;

  async function handleDonate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isDonation: true,
          pageId,
          bentoId,
          amount: nominal,
          qty: unitCount,
          buyerName: isAnonymous ? "Kawan Anonim" : donorName.trim() || "Kawan Baik",
          buyerContact: donorContact.trim() || "donatur@openlynk.id",
          message: supporterMessage.trim() || `Traktir ${unitCount} ${unitName}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Gagal memproses donasi. Silakan coba lagi.");
        setSubmitting(false);
        return;
      }

      setOrderResult({ id: data.order.id, redirectUrl: data.redirectUrl });
      setSuccess(true);

      // Jika ada Midtrans Snap di window
      if (typeof window !== "undefined" && window.snap && data.snapToken) {
        window.snap.pay(data.snapToken, {
          onSuccess: () => {
            setSuccess(true);
          },
          onClose: () => {
            // Pengguna menutup popup Midtrans
          },
        });
      }
    } catch {
      toast.error("Terjadi kesalahan koneksi. Silakan periksa jaringan Anda.");
    } finally {
      setSubmitting(false);
    }
  }

  // Preset options
  const presets = [
    { count: 1, label: `1 ${unitName}` },
    { count: 3, label: `3 ${unitName}` },
    { count: 5, label: `5 ${unitName}` },
  ];

  // 1x1: Mini square tile
  if (size === "1x1") {
    return (
      <>
        <div
          onClick={() => setModalOpen(true)}
          className="group relative flex h-full w-full cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-card to-card p-3.5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-500/50 hover:shadow-md"
        >
          <div className="flex items-start justify-between">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <Coffee className="h-4 w-4" />
            </span>
            <span className="rounded-full bg-amber-500/15 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-700 dark:text-amber-300">
              {formatIDR(pricePerUnit)}
            </span>
          </div>
          <div className="pt-2">
            <p className="truncate font-display text-xs font-bold text-foreground">
              {title}
            </p>
            <p className="truncate text-[10px] text-muted-foreground mt-0.5">
              Beri dukungan
            </p>
          </div>
        </div>
        {renderModal()}
      </>
    );
  }

  // 2x1: Compact horizontal banner
  if (size === "2x1") {
    return (
      <>
        <div
          onClick={() => setModalOpen(true)}
          className="group relative flex h-full w-full cursor-pointer items-center justify-between overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-card to-card px-4 py-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-500/50 hover:shadow-md"
        >
          <div className="flex items-center gap-3 min-w-0 pr-2">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 shadow-2xs">
              <Coffee className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="truncate font-display text-sm font-bold text-foreground">
                  {title}
                </p>
                <span className="shrink-0 rounded-md bg-amber-500/15 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-amber-700 dark:text-amber-300">
                  {formatIDR(pricePerUnit)}
                </span>
              </div>
              <p className="truncate text-xs text-muted-foreground mt-0.5">
                {message || `Dukung dengan segelas ${unitName}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-500 px-3 py-1.5 text-xs font-bold text-zinc-950 shadow-xs hover:bg-amber-400 transition-colors"
          >
            <span>Sawer</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
        {renderModal()}
      </>
    );
  }

  // 4x2: Wide rich layout
  if (size === "4x2") {
    return (
      <>
        <div className="group relative flex h-full w-full flex-col justify-between overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-card to-card p-5 shadow-sm transition-all duration-200 hover:border-amber-500/50 hover:shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="flex items-start gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 shadow-2xs">
                <Coffee className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-base font-bold text-foreground">
                    {title}
                  </h3>
                  <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-300 font-mono">
                    {formatIDR(pricePerUnit)} / {unitName}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-xl">
                  {message}
                </p>
              </div>
            </div>

            {progressPercent !== null && (
              <div className="rounded-xl border border-border/60 bg-muted/40 p-3 sm:w-60 shrink-0">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">Target Donasi</span>
                  <span className="font-mono text-amber-600 dark:text-amber-400">{progressPercent}%</span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-amber-500 transition-all duration-500 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground font-mono">
                  {formatIDR(currentAmount)} dari {formatIDR(targetAmount!)}
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/40 pt-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium">Pilih cepat:</span>
              <div className="flex items-center gap-1.5">
                {presets.map((p) => (
                  <button
                    key={p.count}
                    type="button"
                    onClick={() => {
                      setUnitCount(p.count);
                      setCustomNominal(null);
                      setModalOpen(true);
                    }}
                    className="rounded-xl border border-border/70 bg-card px-2.5 py-1 text-xs font-semibold text-foreground hover:border-amber-500/50 hover:bg-amber-500/10 transition-colors"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-zinc-950 shadow-xs hover:bg-amber-400 active:scale-95 transition-all"
            >
              <Heart className="h-3.5 w-3.5 fill-current" />
              <span>Traktir Sekarang ({formatIDR(pricePerUnit)})</span>
            </button>
          </div>
        </div>
        {renderModal()}
      </>
    );
  }

  // 2x2: Standard interactive bento tile (Default)
  return (
    <>
      <div className="group relative flex h-full w-full flex-col justify-between overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-card to-card p-4 shadow-sm transition-all duration-200 hover:border-amber-500/50 hover:shadow-md">
        {/* Header */}
        <div>
          <div className="flex items-start justify-between gap-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 shadow-2xs">
              <Coffee className="h-5 w-5" />
            </div>
            <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 font-mono text-[11px] font-bold text-amber-700 dark:text-amber-300">
              {formatIDR(pricePerUnit)} / {unitName}
            </span>
          </div>

          <div className="mt-3">
            <h4 className="font-display text-sm font-bold text-foreground line-clamp-1">
              {title}
            </h4>
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Progress Goal (if enabled) */}
        {progressPercent !== null && (
          <div className="my-2 rounded-xl border border-border/50 bg-muted/40 p-2.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground font-medium">Goal Dukungan</span>
              <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{progressPercent}%</span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-amber-500 transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Quick Stepper & Button */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between gap-1.5">
            {presets.map((p) => (
              <button
                key={p.count}
                type="button"
                onClick={() => {
                  setUnitCount(p.count);
                  setCustomNominal(null);
                  setModalOpen(true);
                }}
                className="flex-1 rounded-lg border border-border/60 bg-card py-1 text-center text-[11px] font-medium text-muted-foreground hover:border-amber-500/50 hover:bg-amber-500/10 hover:text-foreground transition-all"
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-amber-500 py-2.5 text-xs font-bold text-zinc-950 shadow-xs hover:bg-amber-400 active:scale-95 transition-all"
          >
            <Heart className="h-3.5 w-3.5 fill-current" />
            <span>Kirim Saweran</span>
          </button>
        </div>
      </div>
      {renderModal()}
    </>
  );

  function renderModal() {
    return (
      <Dialog open={modalOpen} onOpenChange={(v) => { if (!v) { setModalOpen(false); setSuccess(false); } }}>
        <DialogContent className="max-w-md rounded-3xl border-border bg-card p-6 shadow-2xl sm:rounded-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="text-left">
            <DialogTitle className="sr-only">{title || "Dukung kreator"}</DialogTitle>
            <DialogDescription className="sr-only">
              Formulir donasi via QRIS
            </DialogDescription>
          </DialogHeader>

          {success ? (
            <div className="py-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="mt-4 font-display text-xl font-bold text-foreground">
                Terima Kasih Banyak! 🎉
              </h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Dukungan Anda sebesar{" "}
                <span className="font-semibold text-foreground">{formatIDR(nominal)}</span>{" "}
                sangat berharga untuk {pageName || "kreator"}.
              </p>
              {orderResult?.redirectUrl && (
                <div className="mt-6">
                  <a
                    href={orderResult.redirectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-xs hover:opacity-90"
                  >
                    <span>Selesaikan Pembayaran QRIS</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              )}
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    setSuccess(false);
                  }}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
                >
                  Tutup
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleDonate} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                  <Coffee className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-foreground">
                    {title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Dukung {pageName || "Kreator"} via QRIS / E-Wallet
                  </p>
                </div>
              </div>

              {/* Unit Stepper */}
              <div className="rounded-2xl border border-border/80 bg-muted/30 p-3.5">
                <label className="text-xs font-semibold text-foreground">
                  Jumlah {unitName}:
                </label>
                <div className="mt-2 flex items-center justify-between gap-2">
                  {[1, 2, 3, 5, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => {
                        setUnitCount(num);
                        setCustomNominal(null);
                      }}
                      className={`flex-1 rounded-xl py-2 font-display text-xs font-bold transition-all ${
                        unitCount === num && customNominal === null
                          ? "bg-amber-500 text-zinc-950 shadow-xs"
                          : "border border-border/60 bg-card text-foreground hover:bg-muted"
                      }`}
                    >
                      {num}x
                    </button>
                  ))}
                </div>

                {/* Custom nominal input option */}
                <div className="mt-3 pt-3 border-t border-border/40">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Atau nominal bebas (Rp):</span>
                    {customNominal !== null && (
                      <button
                        type="button"
                        onClick={() => setCustomNominal(null)}
                        className="text-[10px] text-amber-600 hover:underline"
                      >
                        Reset ke kelipatan
                      </button>
                    )}
                  </div>
                  <input
                    type="number"
                    min={1000}
                    step={1000}
                    placeholder={`Contoh: ${pricePerUnit * 2}`}
                    value={customNominal ?? ""}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setCustomNominal(isNaN(val) ? null : val);
                    }}
                    className="mt-1.5 w-full rounded-xl border border-border bg-card px-3 py-2 text-xs font-mono font-medium focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Supporter Details */}
              <div className="space-y-2.5">
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-semibold text-foreground">Nama Pengirim</label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-muted-foreground text-[11px]">
                      <Checkbox
                        checked={isAnonymous}
                        onCheckedChange={(v) => setIsAnonymous(v === true)}
                        aria-label="Kirim anonim"
                      />
                      <span>Kirim Anonim</span>
                    </label>
                  </div>
                  {!isAnonymous && (
                    <input
                      type="text"
                      placeholder="Nama Anda atau inisial"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-2 text-xs focus:border-amber-500 focus:outline-hidden"
                    />
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground">
                    Email / No. WhatsApp (Bukti Pembayaran)
                  </label>
                  <input
                    type="text"
                    placeholder="nama@email.com atau 0812..."
                    value={donorContact}
                    onChange={(e) => setDonorContact(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-2 text-xs focus:border-amber-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground">
                    Pesan Dukungan (Opsional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Tulis ucapan semangat atau pesan untuk kreator..."
                    value={supporterMessage}
                    onChange={(e) => setSupporterMessage(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-2 text-xs resize-none focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="rounded-xl bg-muted/40 p-3 text-xs space-y-1">
                <div className="flex justify-between text-muted-foreground">
                  <span>Nominal Dukungan:</span>
                  <span className="font-mono font-semibold text-foreground">{formatIDR(nominal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Biaya Layanan (3–5%):</span>
                  <span className="font-mono text-muted-foreground">{formatIDR(feeAmount)}</span>
                </div>
                <div className="flex justify-between border-t border-border/50 pt-1 font-bold text-foreground">
                  <span>Total Bayar:</span>
                  <span className="font-mono text-amber-600 dark:text-amber-400">{formatIDR(totalPay)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || nominal <= 0}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 text-xs font-bold text-zinc-950 shadow-md hover:bg-amber-400 active:scale-95 disabled:opacity-50 transition-all"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Memproses QRIS...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Bayar {formatIDR(totalPay)} via QRIS</span>
                  </>
                )}
              </button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    );
  }
}
