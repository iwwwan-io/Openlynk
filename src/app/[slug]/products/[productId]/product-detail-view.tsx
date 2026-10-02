"use client";

import { useState } from "react";
import Link from "next/link";
import Script from "next/script";
import {
  ShoppingBag,
  Zap,
  Package,
  ArrowLeft,
  Share2,
  Check,
  ShieldCheck,
  Plus,
  Minus,
  Loader2,
  CheckCircle2,
  Download,
  MessageCircle,
  ExternalLink,
  Lock,
  Tag,
} from "lucide-react";
import type { Page, Product } from "@/lib/types";
import { formatIDR } from "@/lib/types";
import { fee } from "@/lib/validate";

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

export function ProductDetailView({
  page,
  product: p,
}: {
  page: Page;
  product: Product;
}) {
  const [qty, setQty] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

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

  // Order & Payment state
  const [step, setStep] = useState<"form" | "payment" | "success">("form");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [snapToken, setSnapToken] = useState<string | null>(null);
  const [simulating, setSimulating] = useState(false);

  const soldOut = p.kind === "fisik" && p.stock !== null && p.stock <= 0;
  const subtotal = p.priceIdr * qty;
  const discountAmount = appliedCoupon
    ? appliedCoupon.discountType === "percent"
      ? Math.round((subtotal * appliedCoupon.discountValue) / 100)
      : Math.min(appliedCoupon.discountValue, subtotal)
    : 0;
  const finalSubtotal = Math.max(subtotal - discountAmount, 0);
  const platformFee = fee(finalSubtotal);
  const grandTotal = finalSubtotal + platformFee;
  const accent = page.accentColor || "#2563eb";

  async function handleCopyLink() {
    if (typeof window !== "undefined") {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function scrollToCheckout() {
    if (typeof window !== "undefined") {
      const checkoutCard = document.getElementById("checkout-box");
      if (checkoutCard) {
        checkoutCard.scrollIntoView({ behavior: "smooth", block: "start" });
        setTimeout(() => {
          const input = document.getElementById("buyer-name-input");
          if (input) input.focus();
        }, 350);
      }
    }
  }

  async function handleApplyCoupon() {
    if (!couponInput.trim()) return;
    setCheckingCoupon(true);
    setCouponError("");
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageId: page.id,
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

  async function handleCreateOrder(e: React.FormEvent) {
    e.preventDefault();
    if (soldOut) return;

    if (!name.trim()) {
      setFormError("Nama lengkap wajib diisi.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setFormError("Alamat email valid wajib diisi untuk penerimaan akses / bukti.");
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
          pageId: page.id,
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

      setOrderId(data.order.id);
      setSnapToken(data.snapToken ?? null);
      setStep("payment");

      // Scroll smoothly to checkout card on mobile
      if (typeof window !== "undefined") {
        const checkoutCard = document.getElementById("checkout-box");
        if (checkoutCard) {
          checkoutCard.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Terjadi kesalahan saat memproses pesanan.");
    } finally {
      setLoading(false);
    }
  }

  function handleSnapPay() {
    if (window.snap && snapToken) {
      window.snap.pay(snapToken, {
        onSuccess: () => setStep("success"),
        onPending: () => setStep("success"),
        onError: () => alert("Pembayaran belum berhasil diselesaikan."),
      });
    } else {
      alert("Midtrans Snap belum aktif atau tanpa client key. Silakan gunakan tombol 'Simulasi Bayar Instan (Demo)' di bawah.");
    }
  }

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
      alert(err instanceof Error ? err.message : "Gagal simulasi");
    } finally {
      setSimulating(false);
    }
  }

  // text-base on mobile prevents iOS Safari auto-zoom, sm:text-sm for desktop
  const inputCls =
    "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-base sm:text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-foreground transition-colors";

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col">
      {/* Midtrans Snap Script */}
      {process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY && (
        <Script
          src="https://app.sandbox.midtrans.com/snap/snap.js"
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        />
      )}

      {/* Top Navigation Bar - Compact & Ergonomic on Mobile */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-3.5 py-2.5 sm:px-6 sm:py-3.5">
          <Link
            href={`/${page.slug}`}
            className="group inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-border/80 bg-card px-2.5 sm:px-3.5 py-1.5 text-xs font-semibold text-foreground transition-all hover:bg-muted shrink-0"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span className="hidden sm:inline">Kembali ke @{page.slug}</span>
            <span className="sm:hidden">Kembali</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link
              href={`/${page.slug}`}
              className="flex items-center gap-2 text-xs font-semibold text-foreground hover:opacity-80 transition-opacity truncate"
            >
              {page.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={page.image}
                  alt={page.name}
                  className="h-7 w-7 rounded-full object-cover border border-border shrink-0"
                />
              ) : (
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-2xs"
                  style={{ backgroundColor: accent }}
                >
                  {page.name.slice(0, 1).toUpperCase()}
                </span>
              )}
              <span className="hidden sm:inline truncate">{page.name}</span>
            </Link>

            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-card px-2.5 sm:px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors shrink-0"
              title="Salin tautan produk"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-emerald-500 font-semibold">Tersalin</span>
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Bagikan</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container with generous bottom padding for mobile sticky purchase bar */}
      <main className="flex-1 mx-auto w-full max-w-5xl px-3.5 sm:px-6 py-4 sm:py-8 pb-28 lg:pb-12">
        {/* Breadcrumb Navigation */}
        <nav className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground overflow-hidden text-ellipsis whitespace-nowrap">
          <Link href={`/${page.slug}`} className="hover:text-foreground transition-colors shrink-0">
            @{page.slug}
          </Link>
          <span className="shrink-0">/</span>
          <span className="text-muted-foreground shrink-0">Produk</span>
          <span className="shrink-0">/</span>
          <span className="font-semibold text-foreground truncate max-w-[200px] sm:max-w-md">
            {p.name}
          </span>
        </nav>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-10">
          {/* ================= LEFT COLUMN: PRODUCT PRESENTATION ================= */}
          <div className="lg:col-span-7 space-y-5">
            {/* Hero Image - 4:3 on mobile looks great for e-books & mockups, 16:9 on desktop */}
            {p.imageUrl ? (
              <div className="relative aspect-[4/3] sm:aspect-video w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-muted shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.02]"
                />
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                  {p.kind === "digital" ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/95 backdrop-blur px-2.5 sm:px-3 py-1 text-xs font-semibold text-white shadow-md">
                      <Zap className="h-3.5 w-3.5" /> Akses Instan Digital
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/95 backdrop-blur px-2.5 sm:px-3 py-1 text-xs font-semibold text-white shadow-md">
                      <Package className="h-3.5 w-3.5" /> Produk Fisik
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex aspect-[4/3] sm:aspect-video w-full items-center justify-center rounded-2xl sm:rounded-3xl border border-dashed border-border bg-muted/30">
                <ShoppingBag className="h-14 w-14 text-muted-foreground/30" />
              </div>
            )}

            {/* Title & Price Header */}
            <div>
              <h1 className="font-display text-xl sm:text-3xl font-bold tracking-tight text-foreground leading-snug">
                {p.name}
              </h1>

              <div className="mt-2.5 sm:mt-3 flex flex-wrap items-baseline gap-3">
                <span
                  className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight"
                  style={{ color: accent }}
                >
                  {formatIDR(p.priceIdr)}
                </span>
                {p.kind === "fisik" && p.stock !== null && (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      soldOut
                        ? "bg-red-500/10 text-red-600 dark:text-red-400"
                        : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {soldOut ? "🔴 Stok Habis" : `🟢 Tersedia ${p.stock} unit`}
                  </span>
                )}
              </div>

              {/* Creator / Seller Badge */}
              <div className="mt-3 flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 p-2.5 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  {page.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={page.image}
                      alt={page.name}
                      className="h-6 w-6 rounded-full object-cover border border-border shrink-0"
                    />
                  ) : (
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                      style={{ backgroundColor: accent }}
                    >
                      {page.name.slice(0, 1).toUpperCase()}
                    </span>
                  )}
                  <span className="truncate text-muted-foreground">
                    Dijual oleh <strong className="text-foreground">{page.name}</strong> (@{page.slug})
                  </span>
                </div>
                <span className="shrink-0 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Terverifikasi
                </span>
              </div>

              {/* Quick CTA button on Mobile immediately beneath price */}
              {!soldOut && step === "form" && (
                <div className="mt-3 block lg:hidden">
                  <button
                    type="button"
                    onClick={scrollToCheckout}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl py-3 px-4 text-sm font-bold text-white shadow-md active:scale-[0.98] transition-all"
                    style={{ backgroundColor: accent }}
                  >
                    <ShoppingBag className="h-4 w-4" />
                    <span>Beli Sekarang • {formatIDR(grandTotal)}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Description Section */}
            <div className="rounded-2xl sm:rounded-3xl border border-border/80 bg-card p-4 sm:p-6 shadow-2xs space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Deskripsi Lengkap
              </h2>
              <div className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line">
                {p.description || "Tidak ada deskripsi tambahan untuk produk ini."}
              </div>

              {p.kind === "digital" && (
                <div className="mt-4 rounded-xl sm:rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 sm:p-4 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2.5">
                  <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                  <p className="leading-relaxed">
                    <strong>Akses Langsung:</strong> File digital dapat langsung diunduh pada halaman konfirmasi setelah pembayaran selesai, serta tautan cadangan dikirimkan ke email Anda.
                  </p>
                </div>
              )}

              {/* Chat Penjual WhatsApp */}
              <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Ada pertanyaan tentang produk?</span>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `Halo kak ${page.name}, saya ingin tanya tentang produk "${p.name}" di OpenLynk.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>Tanya via WA</span>
                </a>
              </div>
            </div>

            {/* Trust & Guarantee Section */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <div className="flex items-center gap-2.5 rounded-2xl border border-border/60 bg-muted/30 p-3 text-xs">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-card border border-border text-foreground">
                  <Lock className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground truncate">Pembayaran Aman</p>
                  <p className="text-[10px] text-muted-foreground truncate">QRIS & Midtrans Snap</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 rounded-2xl border border-border/60 bg-muted/30 p-3 text-xs">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-card border border-border text-foreground">
                  <Zap className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground truncate">Proses Instan</p>
                  <p className="text-[10px] text-muted-foreground truncate">Otomatis tanpa verifikasi</p>
                </div>
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: CHECKOUT & PURCHASE BOX ================= */}
          <div className="lg:col-span-5">
            <div
              id="checkout-box"
              className="sticky top-20 rounded-2xl sm:rounded-3xl border border-border/80 bg-card p-4 sm:p-6 shadow-lg transition-all scroll-mt-20"
            >
              {/* STEP 1: FORM PEMBELI */}
              {step === "form" && (
                <form onSubmit={handleCreateOrder} className="space-y-4 sm:space-y-5">
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <h3 className="font-display text-base font-bold text-foreground">
                      Beli Produk Ini
                    </h3>
                    <span className="text-xs text-muted-foreground">Langkah 1 dari 2</span>
                  </div>

                  {formError && (
                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
                      {formError}
                    </div>
                  )}

                  {/* Quantity selector (jika tidak sold out) */}
                  {!soldOut && (
                    <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-muted/30 p-3">
                      <div>
                        <p className="text-xs font-semibold text-foreground">Jumlah Pembelian</p>
                        <p className="text-[11px] text-muted-foreground">
                          {formatIDR(p.priceIdr)} per unit
                        </p>
                      </div>
                      <div className="flex items-center gap-2 rounded-full border border-border bg-card px-2 py-1">
                        <button
                          type="button"
                          onClick={() => setQty((q) => Math.max(1, q - 1))}
                          className="h-8 w-8 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors active:scale-95"
                          title="Kurang 1"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-6 text-center text-sm font-bold text-foreground">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQty((q) => Math.min(p.stock ?? 10, q + 1))}
                          className="h-8 w-8 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors active:scale-95"
                          title="Tambah 1"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Form Inputs */}
                  <div className="space-y-3">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-foreground">
                        Nama Lengkap <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="buyer-name-input"
                        type="text"
                        required
                        autoComplete="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Contoh: Rian Pratama"
                        className={inputCls}
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-foreground">
                        Alamat Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nama@email.com"
                        className={inputCls}
                      />
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        Akses link download / invoice akan dikirim ke email ini.
                      </p>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-foreground">
                        Nomor WhatsApp <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        inputMode="tel"
                        required
                        autoComplete="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="081234567890"
                        className={inputCls}
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-foreground">
                        Catatan Tambahan (Opsional)
                      </label>
                      <textarea
                        rows={2}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Alamat pengiriman / catatan untuk penjual"
                        className={`${inputCls} resize-none`}
                      />
                    </div>
                  </div>

                  {/* Kupon Diskon Promo */}
                  <div className="rounded-2xl border border-border/80 bg-card p-3 sm:p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                        <Tag className="h-3.5 w-3.5 text-emerald-500" />
                        <span>Punya Kode Kupon?</span>
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
                        <div className="flex items-center gap-2 min-w-0">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                          <div className="truncate">
                            <span className="font-bold tracking-wider">{appliedCoupon.code}</span>
                            <span className="ml-1 text-[11px] opacity-80">
                              ({appliedCoupon.discountType === "percent" ? `${appliedCoupon.discountValue}%` : formatIDR(appliedCoupon.discountValue)} off)
                            </span>
                          </div>
                        </div>
                        <span className="font-bold shrink-0">-{formatIDR(discountAmount)}</span>
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
                          className="min-w-0 flex-1 uppercase font-mono tracking-wider rounded-xl border border-border bg-background px-3 py-2 text-base sm:text-xs outline-none focus:border-foreground transition"
                        />
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          disabled={checkingCoupon || !couponInput.trim()}
                          className="inline-flex items-center justify-center rounded-xl bg-foreground text-background px-3.5 py-2 text-xs font-bold hover:opacity-90 disabled:opacity-50 transition-all shrink-0 whitespace-nowrap active:scale-95"
                        >
                          {checkingCoupon ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Terapkan"}
                        </button>
                      </div>
                    )}

                    {couponError && (
                      <p className="text-[11px] text-red-500">{couponError}</p>
                    )}
                  </div>

                  {/* Price Summary Breakdown */}
                  <div className="rounded-2xl border border-border/70 bg-muted/20 p-3.5 sm:p-4 space-y-1.5 sm:space-y-2 text-xs">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Harga ({qty} item)</span>
                      <span>{formatIDR(subtotal)}</span>
                    </div>
                    {appliedCoupon && (
                      <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                        <span>Diskon Kupon ({appliedCoupon.code})</span>
                        <span>-{formatIDR(discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-muted-foreground">
                      <span>Biaya Layanan (5%)</span>
                      <span>{formatIDR(platformFee)}</span>
                    </div>
                    <div className="border-t border-border/60 pt-2 flex justify-between font-bold text-sm text-foreground">
                      <span>Total Pembayaran</span>
                      <span style={{ color: accent }}>{formatIDR(grandTotal)}</span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  {soldOut ? (
                    <div className="rounded-2xl bg-muted py-3 text-center text-xs font-bold text-muted-foreground">
                      Stok Produk Ini Sedang Habis
                    </div>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 px-4 text-sm font-bold text-white shadow-md transition-all hover:opacity-95 active:scale-[0.99] disabled:opacity-50 min-h-[48px]"
                      style={{ backgroundColor: accent }}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Menyiapkan Pesanan...</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="h-4 w-4" />
                          <span>Lanjut ke Pembayaran ({formatIDR(grandTotal)})</span>
                        </>
                      )}
                    </button>
                  )}
                </form>
              )}

              {/* STEP 2: METODE & EKSEKUSI PEMBAYARAN */}
              {step === "payment" && (
                <div className="space-y-4 sm:space-y-5 animate-fade-in">
                  <div className="border-b border-border/60 pb-3">
                    <h3 className="font-display text-base font-bold text-foreground">
                      Pilih Pembayaran
                    </h3>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5 truncate">
                      Order ID: {orderId}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border/70 bg-muted/30 p-3.5 sm:p-4 text-xs space-y-1.5">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Produk:</span>
                      <span className="font-semibold text-foreground truncate max-w-[180px]">{p.name} (x{qty})</span>
                    </div>
                    {appliedCoupon && (
                      <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                        <span>Diskon Kupon ({appliedCoupon.code}):</span>
                        <span>-{formatIDR(discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-muted-foreground">
                      <span>Pembeli:</span>
                      <span className="font-semibold text-foreground truncate max-w-[180px]">{name}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>WhatsApp:</span>
                      <span className="font-semibold text-foreground">{phone}</span>
                    </div>
                    <div className="border-t border-border/60 pt-2 flex justify-between font-bold text-sm text-foreground">
                      <span>Total Tagihan:</span>
                      <span style={{ color: accent }}>{formatIDR(grandTotal)}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={handleSnapPay}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 px-4 text-sm font-bold text-white shadow-md transition-all hover:opacity-95 active:scale-[0.99] min-h-[48px]"
                      style={{ backgroundColor: accent }}
                    >
                      <Zap className="h-4 w-4" />
                      <span>Bayar via QRIS / Midtrans Snap</span>
                    </button>

                    <button
                      type="button"
                      disabled={simulating}
                      onClick={handleSimulatePay}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 py-3 px-4 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 active:scale-[0.99] transition-all disabled:opacity-50 min-h-[44px]"
                    >
                      {simulating ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Memproses Simulasi...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Simulasi Bayar Instan (Demo Sandbox)</span>
                        </>
                      )}
                    </button>

                    {orderId && (
                      <Link
                        href={`/checkout/${orderId}?slug=${page.slug}`}
                        target="_blank"
                        className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-border/80 py-2.5 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Buka Halaman Invoice Khusus</span>
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={() => setStep("form")}
                      className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors pt-1"
                    >
                      ← Ubah data pembeli atau jumlah
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: SUKSES & AKSES PRODUK */}
              {step === "success" && (
                <div className="space-y-4 sm:space-y-5 text-center animate-fade-in py-2">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>

                  <div>
                    <h3 className="font-display text-lg font-bold text-foreground">
                      Pembayaran Berhasil! 🎉
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Terima kasih atas pesanan Anda. Transaksi Anda telah lunas.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border/70 bg-muted/30 p-3.5 sm:p-4 text-xs text-left space-y-1">
                    <p className="text-muted-foreground">
                      Order ID: <span className="font-mono font-bold text-foreground">{orderId}</span>
                    </p>
                    <p className="text-muted-foreground truncate">
                      Produk: <span className="font-semibold text-foreground">{p.name} (x{qty})</span>
                    </p>
                    <p className="text-muted-foreground">
                      Total: <span className="font-bold text-foreground">{formatIDR(grandTotal)}</span>
                    </p>
                  </div>

                  {p.kind === "digital" && p.fileUrl && (
                    <a
                      href={p.fileUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 px-4 text-sm font-bold text-white shadow-md hover:bg-emerald-500 active:scale-[0.99] transition-all min-h-[48px]"
                    >
                      <Download className="h-4 w-4" />
                      <span>Unduh File Digital Sekarang</span>
                    </a>
                  )}

                  <div className="space-y-2 pt-1">
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(
                        `Halo kak ${page.name}, saya sudah bayar pesanan ${p.name} (Order ID: ${orderId})`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border/80 bg-card py-2.5 px-4 text-xs font-semibold text-foreground hover:bg-muted transition-colors min-h-[42px]"
                    >
                      <MessageCircle className="h-3.5 w-3.5 text-emerald-500" />
                      <span>Konfirmasi via WhatsApp</span>
                    </a>

                    {orderId && (
                      <Link
                        href={`/checkout/${orderId}?slug=${page.slug}`}
                        className="block text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
                      >
                        Lihat rincian invoice pemesanan
                      </Link>
                    )}

                    <Link
                      href={`/${page.slug}`}
                      className="block text-xs font-semibold text-foreground hover:underline pt-2"
                    >
                      ← Kembali ke Halaman Utama @{page.slug}
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Sticky Bottom Checkout Bar (Hidden on lg+ screens) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/80 bg-background/95 px-4 py-3 backdrop-blur-md lg:hidden shadow-[0_-4px_24px_rgba(0,0,0,0.12)]">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {step === "payment" ? "Total Tagihan" : step === "success" ? "Pesanan Lunas" : "Total Harga"}
            </p>
            <div className="flex items-baseline gap-1.5">
              <span
                className="font-display text-lg font-extrabold truncate"
                style={{ color: accent }}
              >
                {formatIDR(grandTotal)}
              </span>
              {appliedCoupon && (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold line-through">
                  {formatIDR(subtotal + platformFee)}
                </span>
              )}
            </div>
          </div>

          {step === "form" && (
            soldOut ? (
              <button
                disabled
                className="rounded-xl bg-muted px-4 py-2.5 text-xs font-bold text-muted-foreground"
              >
                Stok Habis
              </button>
            ) : (
              <button
                type="button"
                onClick={scrollToCheckout}
                className="flex items-center gap-2 rounded-xl py-2.5 px-4 text-xs font-bold text-white shadow-md active:scale-95 transition-all"
                style={{ backgroundColor: accent }}
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Beli Sekarang</span>
              </button>
            )
          )}

          {step === "payment" && (
            <button
              type="button"
              onClick={handleSnapPay}
              className="flex items-center gap-2 rounded-xl py-2.5 px-4 text-xs font-bold text-white shadow-md active:scale-95 transition-all"
              style={{ backgroundColor: accent }}
            >
              <Zap className="h-4 w-4" />
              <span>Bayar Sekarang</span>
            </button>
          )}

          {step === "success" && (
            p.kind === "digital" && p.fileUrl ? (
              <a
                href={p.fileUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md active:scale-95 transition-all"
              >
                <Download className="h-4 w-4" />
                <span>Unduh File</span>
              </a>
            ) : (
              <Link
                href={`/${page.slug}`}
                className="flex items-center gap-1.5 rounded-xl bg-foreground text-background px-4 py-2.5 text-xs font-bold shadow-md active:scale-95 transition-all"
              >
                <span>Kembali</span>
              </Link>
            )
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        <div className="mx-auto max-w-5xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link
            href={`/${page.slug}`}
            className="font-semibold text-foreground hover:underline"
          >
            ← Kembali ke profil @{page.slug}
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 transition-all hover:text-foreground"
          >
            Dibuat dengan <span className="font-bold text-foreground">OpenLynk</span>
          </Link>
        </div>
      </footer>
    </div>
  );
}
