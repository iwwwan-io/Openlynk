"use client";

import { useState } from "react";
import type { Coupon } from "@/lib/types";
import { formatIDR } from "@/lib/types";
import {
  Tag,
  Plus,
  Trash2,
  Copy,
  Check,
  Calendar,
  Layers,
  Sparkles,
  Search,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CouponsTabProps {
  pageId?: string;
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
        <div className="rounded-3xl border border-border/80 bg-card p-4 sm:p-5 shadow-sm transition-all hover:border-foreground/20">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Total Kupon</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Tag className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 font-display text-2xl font-extrabold text-foreground tracking-tight">{coupons.length}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{activeCount} kupon sedang aktif</p>
        </div>

        <div className="rounded-3xl border border-border/80 bg-card p-4 sm:p-5 shadow-sm transition-all hover:border-foreground/20">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Kupon Terpakai</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 font-display text-2xl font-extrabold text-foreground tracking-tight">{totalUses} kali</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Total voucher di-checkout pembeli</p>
        </div>

        <div className="rounded-3xl border border-border/80 bg-card p-4 sm:p-5 shadow-sm transition-all hover:border-foreground/20">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Preset Cepat</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setCode("DISKON10");
                setDiscountType("percent");
                setDiscountValue("10");
                setShowAddModal(true);
              }}
              className="rounded-xl border border-border bg-muted/60 hover:bg-muted px-2.5 py-1 text-xs font-semibold text-foreground transition-colors cursor-pointer"
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
              className="rounded-xl border border-border bg-muted/60 hover:bg-muted px-2.5 py-1 text-xs font-semibold text-foreground transition-colors cursor-pointer"
            >
              Potongan 25k
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Buat otomatis 1-klik</p>
        </div>
      </div>

      {/* Search Bar */}
      {coupons.length > 0 && (
        <div className="flex items-center rounded-2xl border border-border/80 bg-background px-3.5 py-2 w-full sm:w-72 shadow-2xs">
          <Search className="h-3.5 w-3.5 text-muted-foreground mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Cari kode kupon..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none"
          />
        </div>
      )}

      {/* Coupons List */}
      <div className="rounded-3xl border border-border/80 bg-card overflow-hidden shadow-sm">
        {filteredCoupons.length === 0 ? (
          <div className="py-16 px-4 text-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/80 text-muted-foreground mx-auto">
              <Tag className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-foreground">
                {coupons.length === 0 ? "Belum Ada Kupon Promo" : "Tidak Ada Kupon yang Cocok"}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
                {coupons.length === 0
                  ? "Buat kupon diskon untuk memancing pembelian pertama dari pengunjung profil Anda."
                  : "Coba ganti kata kunci pencarian Anda."}
              </p>
            </div>
            {coupons.length === 0 && (
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-1.5 rounded-full bg-foreground text-background px-5 py-2.5 text-xs font-bold shadow-md hover:opacity-90 active:scale-95 transition-all cursor-pointer"
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
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-start gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-sm border border-emerald-500/20 shadow-2xs">
                    {c.discountType === "percent" ? "%" : "Rp"}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm sm:text-base font-extrabold tracking-wider text-foreground">
                        {c.code}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(c)}
                        className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                        title="Salin Kode Kupon"
                      >
                        {copiedId === c.id ? (
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                          c.isActive
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                            : "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20"
                        }`}
                      >
                        {c.isActive ? "Aktif" : "Non-aktif"}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        Diskon: {c.discountType === "percent" ? `${c.discountValue}%` : formatIDR(c.discountValue)}
                      </span>
                      <span>•</span>
                      {c.minOrderIdr ? (
                        <span>Min. Belanja: {formatIDR(c.minOrderIdr)}</span>
                      ) : (
                        <span>Tanpa min. belanja</span>
                      )}
                      <span>•</span>
                      <span>
                        Terpakai: <strong className="text-foreground">{c.usedCount}</strong>
                        {c.maxUses ? ` / ${c.maxUses} kuota` : " (tanpa batas kuota)"}
                      </span>
                      {c.expiresAt && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                            <Calendar className="h-3 w-3" /> Exp: {new Date(c.expiresAt).toLocaleDateString("id-ID")}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => onToggleActive(c.id, !c.isActive)}
                    className="rounded-xl border border-border/80 bg-background px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer shadow-2xs"
                  >
                    {c.isActive ? "Non-aktifkan" : "Aktifkan"}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteCoupon(c.id)}
                    className="rounded-xl border border-border/80 bg-background p-2 text-muted-foreground hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-500 transition-colors cursor-pointer shadow-2xs"
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
      <Dialog open={showAddModal} onOpenChange={(v) => !v && setShowAddModal(false)}>
        <DialogContent className="max-w-md rounded-3xl border-border bg-card p-6 shadow-2xl sm:rounded-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b border-border/60 pb-3 text-left">
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-emerald-500" />
              <div>
                <DialogTitle className="font-display text-base font-bold text-foreground">Buat Kupon Promo Baru</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Atur kode, diskon, dan batas kupon
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

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
        </DialogContent>
      </Dialog>
    </div>
  );
}
