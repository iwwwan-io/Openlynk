"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import Script from "next/script";
import {
  X,
  ChevronLeft,
  ShoppingBag,
  Plus,
  Minus,
  CheckCircle2,
  Download,
  Zap,
  ShieldCheck,
  User,
  Mail,
  Phone,
  FileText,
  Loader2,
  Package,
  ExternalLink,
  MessageCircle,
  Tag,
} from "lucide-react";
import { formatIDR } from "@/lib/types";
import { fee } from "@/lib/validate";
import { useCheckout } from "./checkout-context";

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        options?: {
          onSuccess?: (result: unknown) => void;
          onPending?: (result: unknown) => void;
          onError?: (result: unknown) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}

export function ProductBottomSheet() {
  const {
    selectedProduct: p,
    isOpen,
    step,
    qty,
    orderId,
    snapToken,
    accentColor,
    closeCheckout,
    setStep,
    setQty,
    setOrderData,
  } = useCheckout();

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);

  // Coupon states
  const [couponInput, setCouponInput] = useState("");
  const [checkingCoupon, setCheckingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountIdr: number;
    discountType: "percent" | "fixed";
    discountValue: number;
  } | null>(null);
  const [couponError, setCouponError] = useState("");

  const [prevProductId, setPrevProductId] = useState<string | null>(p?.id ?? null);
  if (p && p.id !== prevProductId) {
    setPrevProductId(p.id);
    setFormError("");
    setAppliedCoupon(null);
    setCouponError("");
    setCouponInput("");
  }

  // Lock body scroll saat bottom sheet aktif
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") closeCheckout();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen, closeCheckout]);

  if (!isOpen || !p) return null;

  const subtotal = p.priceIdr * qty;
  const discountAmount = appliedCoupon ? appliedCoupon.discountIdr : 0;
  const finalSubtotal = Math.max(subtotal - discountAmount, 0);
  const platformFee = fee(finalSubtotal);
  const grandTotal = finalSubtotal + platformFee;
  const soldOut = p.kind === "fisik" && p.stock !== null && p.stock <= 0;

  // Handler Terapkan Kupon Promo
  async function handleApplyCoupon() {
    if (!p || !couponInput.trim()) return;
    setCheckingCoupon(true);
    setCouponError("");
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageId: p.pageId,
          code: couponInput.trim().toUpperCase(),
          subtotal,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        setCouponError(data.message || "Kode kupon tidak valid");
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon({
          code: data.coupon.code,
          discountIdr: data.discountIdr,
          discountType: data.coupon.discountType,
          discountValue: data.coupon.discountValue,
        });
        setCouponInput("");
        setCouponError("");
      }
    } catch {
      setCouponError("Gagal memeriksa kupon, coba lagi.");
    } finally {
      setCheckingCoupon(false);
    }
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null);
    setCouponError("");
  }

  // Handler Submit Form Pembeli & Buat Order
  async function handleCreateOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!p) return;
    if (!name.trim()) {
      setFormError("Nama lengkap wajib diisi.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setFormError("Email valid wajib diisi untuk pengiriman file / bukti pesanan.");
      return;
    }
    if (!phone.trim()) {
      setFormError("Nomor WhatsApp wajib diisi.");
      return;
    }

    setFormError("");
    setLoading(true);
    try {
      const contactInfo = `${email.trim()} / WA: ${phone.trim()}${notes ? ` (Catatan: ${notes.trim()})` : ""}`;
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: p.id,
          buyerName: name.trim(),
          buyerContact: contactInfo,
          qty,
          couponCode: appliedCoupon?.code,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Gagal membuat pesanan.");
      }

      setOrderData(data.order.id, data.snapToken ?? null);
      setStep("payment");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Terjadi kesalahan saat memproses pesanan.");
    } finally {
      setLoading(false);
    }
  }

  // Handler Bayar via Midtrans Snap (Langsung di halaman tanpa redirect)
  function handleSnapPay() {
    if (window.snap && snapToken) {
      window.snap.pay(snapToken, {
        onSuccess: () => {
          setStep("success");
        },
        onPending: () => {
          setStep("success");
        },
        onError: () => {
          toast.error("Pembayaran belum berhasil diselesaikan.");
        },
        onClose: () => {
          // Tetap di halaman bottom sheet
        },
      });
    } else {
      toast.error("Midtrans Snap belum aktif atau tanpa client key. Silakan gunakan tombol 'Simulasi Bayar Instan (Demo)' di bawah.");
    }
  }

  // Handler Simulasi Bayar Instan (Sandbox Demo 1 Halaman)
  async function handleSimulatePay() {
    if (!orderId) return;
    setSimulating(true);
    try {
      const res = await fetch("/api/orders/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal simulasi bayar.");
      setStep("success");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal simulasi");
    } finally {
      setSimulating(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4">
      {/* Script Midtrans Snap jika ada client key */}
      {process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY && (
        <Script
          src={
            process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true" ||
            process.env.NODE_ENV === "production"
              ? "https://app.midtrans.com/snap/snap.js"
              : "https://app.sandbox.midtrans.com/snap/snap.js"
          }
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        />
      )}

      {/* Backdrop Blur */}
      <div
        onClick={closeCheckout}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />

      {/* Sheet Container */}
      <div
        className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-t-[32px] sm:rounded-[32px] border border-border/70 bg-card text-card-foreground shadow-2xl transition-all"
        style={{ ["--ring-color" as string]: accentColor }}
      >
        {/* Grabber Handle untuk Mobile */}
        <div className="pt-3 pb-1 flex justify-center sm:hidden">
          <div className="h-1.5 w-12 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b border-border/50 px-5 py-3">
          <div className="flex items-center gap-2">
            {step === "checkout" && (
              <button
                type="button"
                onClick={() => setStep("detail")}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                title="Kembali ke detail produk"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            {step === "payment" && (
              <button
                type="button"
                onClick={() => setStep("checkout")}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                title="Kembali ke data pembeli"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            <h3 className="font-display text-base font-bold text-foreground">
              {step === "detail" && "Detail Produk"}
              {step === "checkout" && "Data Pembeli & Checkout"}
              {step === "payment" && "Pilih Pembayaran"}
              {step === "success" && "Pesanan Berhasil"}
            </h3>
          </div>

          <button
            type="button"
            onClick={closeCheckout}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title="Tutup"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* ================= STEP 1: DETAIL PRODUK ================= */}
          {step === "detail" && (
            <div className="space-y-4">
              {/* Gambar Produk */}
              {p.imageUrl ? (
                <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border/60 bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    {p.kind === "digital" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-semibold text-white shadow backdrop-blur">
                        <Zap className="h-3 w-3" /> Akses Instan Digital
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/90 px-3 py-1 text-xs font-semibold text-white shadow backdrop-blur">
                        <Package className="h-3 w-3" /> Produk Fisik
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex aspect-video w-full items-center justify-center rounded-2xl border border-dashed border-border bg-muted/40">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground/40" />
                </div>
              )}

              {/* Judul & Harga */}
              <div>
                <h2 className="font-display text-xl sm:text-2xl font-bold leading-tight text-foreground">
                  {p.name}
                </h2>
                <div className="mt-2 flex items-baseline gap-3">
                  <span
                    className="font-display text-2xl font-extrabold"
                    style={{ color: accentColor }}
                  >
                    {formatIDR(p.priceIdr)}
                  </span>
                  {p.kind === "fisik" && p.stock !== null && (
                    <span className="text-xs text-muted-foreground">
                      {soldOut ? "Stok habis" : `Tersedia ${p.stock} unit`}
                    </span>
                  )}
                </div>
              </div>

              {/* Deskripsi Lengkap */}
              <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Deskripsi Lengkap
                </h4>
                <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-foreground/90">
                  {p.description || "Tidak ada deskripsi tambahan untuk produk ini."}
                </p>

                {p.kind === "digital" && (
                  <div className="mt-3.5 border-t border-border/40 pt-3 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    <ShieldCheck className="h-4 w-4 shrink-0" />
                    <span>File dapat langsung diakses & diunduh setelah pembayaran selesai.</span>
                  </div>
                )}
              </div>

              {/* Quantity Selector & Subtotal */}
              {!soldOut && (
                <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-card p-3.5">
                  <div>
                    <p className="text-xs text-muted-foreground">Jumlah Pembelian</p>
                    <p className="text-sm font-bold text-foreground">
                      Total: {formatIDR(subtotal)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-border bg-muted/40 px-2 py-1">
                    <button
                      type="button"
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      className="p-1 rounded-full text-muted-foreground hover:bg-card hover:text-foreground transition-colors"
                      title="Kurang 1"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-6 text-center text-sm font-bold">{qty}</span>
                    <button
                      type="button"
                      onClick={() => setQty((q) => Math.min(p.stock ?? 10, q + 1))}
                      className="p-1 rounded-full text-muted-foreground hover:bg-card hover:text-foreground transition-colors"
                      title="Tambah 1"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= STEP 2: CHECKOUT & FORM PEMBELI ================= */}
          {step === "checkout" && (
            <form onSubmit={handleCreateOrder} className="space-y-4">
              {/* Mini Item Summary */}
              <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-muted/30 p-3">
                {p.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="h-12 w-12 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-xs truncate text-foreground">{p.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {qty} x {formatIDR(p.priceIdr)} ={" "}
                    <span className="font-bold text-foreground">{formatIDR(subtotal)}</span>
                  </p>
                </div>
              </div>

              {formError && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
                  {formError}
                </div>
              )}

              {/* Form Input Data Pembeli */}
              <div className="space-y-3">
                <div>
                  <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Rian Pratama"
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition focus:border-foreground"
                  />
                </div>

                <div>
                  <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    Email Aktif <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Contoh: nama@domain.com"
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition focus:border-foreground"
                  />
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Link akses dan bukti transaksi akan dikirimkan ke email ini.
                  </p>
                </div>

                <div>
                  <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    Nomor WhatsApp / HP <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition focus:border-foreground"
                  />
                </div>

                <div>
                  <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    Catatan untuk Penjual (Opsional)
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Tulis catatan opsional atau instruksi..."
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm outline-none transition focus:border-foreground resize-none"
                  />
                </div>
              </div>

              {/* Kupon Diskon Promo */}
              <div className="rounded-2xl border border-border/80 bg-card p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <Tag className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Punya Kode Kupon / Diskon?</span>
                  </label>
                  {appliedCoupon && (
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-[11px] text-red-500 hover:underline font-medium"
                    >
                      Hapus Kupon
                    </button>
                  )}
                </div>

                {appliedCoupon ? (
                  <div className="flex items-center justify-between rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-2.5 text-xs text-emerald-600 dark:text-emerald-400">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      <div>
                        <span className="font-bold tracking-wider">{appliedCoupon.code}</span>
                        <span className="ml-1.5 text-[11px] opacity-80">
                          ({appliedCoupon.discountType === "percent" ? `${appliedCoupon.discountValue}%` : formatIDR(appliedCoupon.discountValue)} off)
                        </span>
                      </div>
                    </div>
                    <span className="font-bold">-{formatIDR(appliedCoupon.discountIdr)}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value.toUpperCase());
                        setCouponError("");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (!checkingCoupon && couponInput.trim()) {
                            handleApplyCoupon();
                          }
                        }
                      }}
                      placeholder="Contoh: HEMAT20"
                      className="min-w-0 flex-1 uppercase font-mono tracking-wider rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-foreground transition"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={checkingCoupon || !couponInput.trim()}
                      className="inline-flex items-center justify-center rounded-xl bg-foreground text-background px-3.5 py-2 text-xs font-bold hover:opacity-90 disabled:opacity-50 transition-all shrink-0 whitespace-nowrap"
                    >
                      {checkingCoupon ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Terapkan"}
                    </button>
                  </div>
                )}

                {couponError && (
                  <p className="text-[11px] text-red-500">{couponError}</p>
                )}
              </div>

              {/* Rincian Biaya */}
              <div className="rounded-2xl border border-border/70 bg-muted/20 p-3.5 text-xs space-y-1.5">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal ({qty} barang)</span>
                  <span>{formatIDR(subtotal)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                    <span>Diskon Kupon ({appliedCoupon.code})</span>
                    <span>-{formatIDR(appliedCoupon.discountIdr)}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>Biaya Layanan Platform</span>
                  <span>{formatIDR(platformFee)}</span>
                </div>
                <div className="border-t border-border/50 pt-2 flex justify-between font-bold text-sm text-foreground">
                  <span>Total Tagihan</span>
                  <span style={{ color: accentColor }}>{formatIDR(grandTotal)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 px-4 font-bold text-white shadow-md transition-all hover:opacity-95 disabled:opacity-50"
                style={{ backgroundColor: accentColor }}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Memproses Pesanan...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    <span>Lanjut ke Pembayaran • {formatIDR(grandTotal)}</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* ================= STEP 3: PILIH PEMBAYARAN (NO REDIRECT) ================= */}
          {step === "payment" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-border/60 bg-muted/30 p-4 text-center">
                <p className="text-xs text-muted-foreground">Total yang harus dibayar:</p>
                <p
                  className="font-display text-3xl font-extrabold tracking-tight mt-1"
                  style={{ color: accentColor }}
                >
                  {formatIDR(grandTotal)}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground font-mono">
                  Order ID: {orderId}
                </p>
              </div>

              <div className="space-y-3">
                {/* Tombol Snap Payment (Popup Midtrans asli di halaman) */}
                <button
                  type="button"
                  onClick={handleSnapPay}
                  className="w-full flex items-center justify-between rounded-2xl border-2 border-foreground/10 bg-foreground text-background p-4 font-bold shadow-md transition-all hover:bg-foreground/90 active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-background/20 flex items-center justify-center">
                      <ShieldCheck className="h-5 w-5 text-background" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold">Bayar via Midtrans</p>
                      <p className="text-[11px] font-normal opacity-80">
                        QRIS, GoPay, ShopeePay, Virtual Account
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-background/20">
                    Buka Popup
                  </span>
                </button>

                {/* Tombol Simulasi 1 Halaman Tanpa Redirect (Hanya Mode Dev/Sandbox) */}
                {!(
                  process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true" ||
                  process.env.NODE_ENV === "production"
                ) && (
                  <button
                    type="button"
                    onClick={handleSimulatePay}
                    disabled={simulating}
                    className="w-full flex items-center justify-between rounded-2xl border border-dashed border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 p-4 font-bold transition-all active:scale-[0.99] disabled:opacity-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                        {simulating ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Zap className="h-5 w-5" />
                        )}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold">Simulasi Bayar Instan (Demo)</p>
                        <p className="text-[11px] font-normal opacity-80">
                          Langsung lunas tanpa Midtrans client key
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20">
                      1-Klik Bayar
                    </span>
                  </button>
                )}
              </div>

              <div className="flex items-center justify-center gap-1.5 pt-2 text-[11px] text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Transaksi diproses di halaman ini secara aman tanpa redirect.</span>
              </div>
            </div>
          )}

          {/* ================= STEP 4: SUKSES & AKSES PRODUK ================= */}
          {step === "success" && (
            <div className="py-2 text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-10 w-10 animate-in zoom-in-75 duration-300" />
              </div>

              <div>
                <h3 className="font-display text-xl font-bold text-foreground">
                  Pembayaran Berhasil!
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Terima kasih, pesanan{" "}
                  <span className="font-mono font-semibold text-foreground">#{orderId}</span> telah
                  berhasil diproses.
                </p>
              </div>

              {/* Tautan Akses Produk Digital */}
              {p.kind === "digital" && p.fileUrl && (
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-left">
                  <div className="flex items-start gap-3">
                    <Download className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                        Akses File Digital Langsung
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground leading-relaxed">
                        Klik tombol di bawah untuk mengunduh atau membuka materi Anda sekarang:
                      </p>
                      <a
                        href={p.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center justify-center gap-2 w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 text-xs font-bold shadow transition-colors"
                      >
                        <Download className="h-4 w-4" />
                        <span>Unduh / Buka File Digital</span>
                        <ExternalLink className="h-3.5 w-3.5 opacity-80" />
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Chat Konfirmasi WhatsApp */}
              <div className="space-y-2">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `Halo kak, saya sudah menyelesaikan pembayaran untuk pesanan #${orderId} (${p.name}). Total: ${formatIDR(grandTotal)}. Mohon konfirmasi ya. Terima kasih!`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full rounded-xl border border-border bg-card py-2.5 px-4 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  <MessageCircle className="h-4 w-4 text-emerald-500" />
                  <span>Kirim Konfirmasi ke WhatsApp Penjual</span>
                </a>

                <button
                  type="button"
                  onClick={closeCheckout}
                  className="w-full rounded-xl py-2.5 px-4 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  Selesai & Kembali ke Profil
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Action untuk Step Detail */}
        {step === "detail" && (
          <div className="border-t border-border/50 bg-card/95 p-4 backdrop-blur">
            {soldOut ? (
              <button
                type="button"
                disabled
                className="w-full rounded-2xl bg-muted py-3 px-4 text-sm font-bold text-muted-foreground"
              >
                Stok Produk Habis
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStep("checkout")}
                className="w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 px-4 font-bold text-white shadow-lg transition-all hover:opacity-95 active:scale-[0.99]"
                style={{ backgroundColor: accentColor }}
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Beli Sekarang • {formatIDR(subtotal)}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
