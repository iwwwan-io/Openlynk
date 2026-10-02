"use client";

import { useState } from "react";
import type { Coupon } from "@/lib/types";
import { formatIDR } from "@/lib/types";
import {
  Tag,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Calendar,
  Layers,
  Sparkles,
  Percent,
  Coins,
  Search,
} from "lucide-react";

interface CouponsTabProps {
  pageId: string;
  coupons: Coupon[];
  onCreateCoupon: (data: {
    code: string;
    discountType: "percent" | "fixed";
    discountValue: number;
    minOrderIdr?: number;
    maxUses?: number | null;
    expiresAt?: string | null;
  }) => Promise<void>;
  onToggleActive: (id: string, isActive: boolean) => Promise<void>;
  onDeleteCoupon: (id: string) => Promise<void>;
}

export function CouponsTab({
  pageId,
  coupons,
  onCreateCoupon,
  onToggleActive,
  onDeleteCoupon,
}: CouponsTabProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percent" | "fixed">("percent");
  const [discountValue, setDiscountValue] = useState("");
  const [minOrderIdr, setMinOrderIdr] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const activeCount = coupons.filter((c) => c.isActive).length;
  const totalUses = coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0);

  const filteredCoupons = coupons.filter((c) =>
    c.code.toLowerCase().includes(search.toLowerCase().trim())
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim() || !discountValue) return;

    setLoading(true);
    try {
      await onCreateCoupon({
        code: code.trim().toUpperCase(),
        discountType,
        discountValue: Number(discountValue),
        minOrderIdr: minOrderIdr ? Number(minOrderIdr) : 0,
        maxUses: maxUses ? Number(maxUses) : null,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      });

      // Reset form
      setCode("");
      setDiscountValue("");
      setMinOrderIdr("");
      setMaxUses("");
      setExpiresAt("");
      setShowAddModal(false);
    } finally {
      setLoading(false);
    }
  }

  function handleCopy(c: Coupon) {
    navigator.clipboard.writeText(c.code);
    setCopiedId(c.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Header & Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-bold text-foreground">Kupon & Kode Promo</h2>
          <p className="text-xs text-muted-foreground">
            Tingkatkan konversi penjualan toko dengan promo musiman dan voucher diskon
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 rounded-full bg-foreground text-background px-4 py-2 text-xs font-bold shadow-xs hover:opacity-90 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Buat Kupon Baru</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Total Kupon</span>
            <Tag className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-foreground">{coupons.length}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{activeCount} kupon sedang aktif</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Kupon Terpakai</span>
            <Sparkles className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-foreground">{totalUses} kali</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Total voucher di-checkout pembeli</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Preset Cepat</span>
            <Layers className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setCode("DISKON10");
                setDiscountType("percent");
                setDiscountValue("10");
                setShowAddModal(true);
              }}
              className="rounded-lg border border-border bg-muted/40 hover:bg-muted px-2 py-1 text-[11px] font-semibold text-foreground transition-colors"
            >
              10% Off
            </button>
            <button
              type="button"
              onClick={() => {
                setCode("HEMAT25K");
                setDiscountType("fixed");
                setDiscountValue("25000");
                setMinOrderIdr("50000");
                setShowAddModal(true);
              }}
              className="rounded-lg border border-border bg-muted/40 hover:bg-muted px-2 py-1 text-[11px] font-semibold text-foreground transition-colors"
            >
              Potongan 25k
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Buat otomatis 1-klik</p>
        </div>
      </div>

      {/* Search Bar */}
      {coupons.length > 0 && (
        <div className="flex items-center rounded-xl border border-border bg-background px-3 py-1.5 w-full sm:w-72">
          <Search className="h-3.5 w-3.5 text-muted-foreground mr-2" />
          <input
            type="text"
            placeholder="Cari kode kupon..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-xs outline-none"
          />
        </div>
      )}

      {/* Coupons List */}
      <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-xs">
        {filteredCoupons.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <Tag className="mx-auto h-10 w-10 text-muted-foreground/30" />
            <h3 className="mt-3 font-display text-sm font-bold text-foreground">
              {coupons.length === 0 ? "Belum Ada Kupon Promo" : "Tidak Ada Kupon yang Cocok"}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
              {coupons.length === 0
                ? "Buat kupon diskon untuk memancing pembelian pertama dari pengunjung profil Anda."
                : "Coba ganti kata kunci pencarian Anda."}
            </p>
            {coupons.length === 0 && (
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-foreground text-background px-4 py-2 text-xs font-bold shadow-xs hover:opacity-90 transition-all"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Buat Kupon Pertama</span>
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {filteredCoupons.map((c) => (
              <div
                key={c.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                    {c.discountType === "percent" ? "%" : "Rp"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-extrabold tracking-wider text-foreground">
                        {c.code}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(c)}
                        className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        title="Salin Kode Kupon"
                      >
                        {copiedId === c.id ? (
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                          c.isActive
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
                            : "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700"
                        }`}
                      >
                        {c.isActive ? "Aktif" : "Non-aktif"}
                      </span>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        Diskon: {c.discountType === "percent" ? `${c.discountValue}%` : formatIDR(c.discountValue)}
                      </span>
                      {c.minOrderIdr ? (
                        <span>Min. Belanja: {formatIDR(c.minOrderIdr)}</span>
                      ) : (
                        <span>Tanpa min. belanja</span>
                      )}
                      <span>
                        Terpakai: <strong className="text-foreground">{c.usedCount}</strong>
                        {c.maxUses ? ` / ${c.maxUses} kuota` : " (tanpa batas kuota)"}
                      </span>
                      {c.expiresAt && (
                        <span className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400">
                          <Calendar className="h-3 w-3" /> Exp: {new Date(c.expiresAt).toLocaleDateString("id-ID")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => onToggleActive(c.id, !c.isActive)}
                    className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    {c.isActive ? "Non-aktifkan" : "Aktifkan"}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteCoupon(c.id)}
                    className="rounded-xl border border-border bg-background p-1.5 text-muted-foreground hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                    title="Hapus Kupon"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Buat Kupon Baru */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-emerald-500" />
                <h3 className="font-display text-base font-bold text-foreground">Buat Kupon Promo Baru</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Kode Kupon */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">
                  Kode Kupon <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Misal: RAMADHAN50 atau HEMAT20"
                  className="w-full uppercase font-mono tracking-wider rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-foreground transition"
                />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Akan otomatis dikonversi ke huruf kapital (uppercase).
                </p>
              </div>

              {/* Tipe Diskon & Nilai */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">
                    Tipe Diskon <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as "percent" | "fixed")}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs outline-none focus:border-foreground transition"
                  >
                    <option value="percent">Persentase (%)</option>
                    <option value="fixed">Nominal Tetap (Rp)</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">
                    Nilai Diskon <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min={1}
                      max={discountType === "percent" ? 100 : undefined}
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      placeholder={discountType === "percent" ? "Contoh: 20" : "Contoh: 25000"}
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-foreground transition pr-8"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-muted-foreground font-bold">
                      {discountType === "percent" ? "%" : "Rp"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Minimal Belanja & Maksimal Kuota */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">
                    Min. Belanja (Rp)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={minOrderIdr}
                    onChange={(e) => setMinOrderIdr(e.target.value)}
                    placeholder="0 = Tanpa min"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-foreground transition"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">
                    Kuota Penggunaan
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value)}
                    placeholder="Kosongkan jika bebas"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-foreground transition"
                  />
                </div>
              </div>

              {/* Tanggal Kadaluarsa */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">
                  Tanggal Berakhir (Opsional)
                </label>
                <input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs outline-none focus:border-foreground transition"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-full bg-foreground text-background px-5 py-2 text-xs font-bold shadow-xs hover:opacity-90 disabled:opacity-50 transition"
                >
                  {loading ? "Menyimpan..." : "Simpan Kupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
