"use client";

import { useState } from "react";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import type { Page, Product } from "@/lib/types";
import { formatIDR } from "@/lib/types";
import {
  ShoppingBag,
  Plus,
  Loader2,
  Edit3,
  Trash2,
  FileCheck,
  Sparkles,
  Search,
  Zap,
  Package,
  AlertCircle,
  X,
  LayoutGrid,
  List,
  Eye,
} from "lucide-react";
import { EditProductModal } from "./edit-product-modal";

interface PageProductsManagerProps {
  page: Page;
  products: Product[];
  onCreateProduct: (data: {
    name: string;
    priceIdr: number;
    kind: "digital" | "fisik";
    stock: number | null;
    description: string;
    imageUrl?: string;
  }) => Promise<void>;
  onUpdateProduct?: (
    id: string,
    data: {
      name?: string;
      priceIdr?: number;
      kind?: "digital" | "fisik";
      stock?: number | null;
      description?: string;
      imageUrl?: string;
      fileUrl?: string;
      isActive?: boolean;
    }
  ) => Promise<void>;
  onDeleteProduct?: (id: string, name: string) => Promise<void>;
  onToggleActive: (id: string, isActive: boolean) => Promise<void>;
  onUploadFile: (e: React.ChangeEvent<HTMLInputElement>, productId: string) => Promise<void>;
}

export function PageProductsManager({
  page,
  products,
  onCreateProduct,
  onUpdateProduct,
  onDeleteProduct,
  onToggleActive,
  onUploadFile,
}: PageProductsManagerProps) {
  // Form State
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [kind] = useState<"digital" | "fisik">("digital");
  const [desc, setDesc] = useState("");
  const [stock, setStock] = useState("");
  const [isUnlimited, setIsUnlimited] = useState(true);
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Search & Filter & View Mode
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "active" | "with-file" | "inactive">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Edit Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const inputCls =
    "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-base sm:text-sm outline-none focus:border-foreground transition";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !price) return;
    setLoading(true);
    try {
      await onCreateProduct({
        name: name.trim(),
        priceIdr: Number(price),
        kind,
        stock: isUnlimited ? null : stock ? Number(stock) : null,
        description: desc.trim(),
        imageUrl: imageUrl.trim() || undefined,
      });
      setName("");
      setPrice("");
      setDesc("");
      setStock("");
      setImageUrl("");
      setIsUnlimited(true);
      setShowAddForm(false);
    } finally {
      setLoading(false);
    }
  }

  // Filter calculations
  const activeCount = products.filter((p) => p.isActive).length;
  const digitalWithFileCount = products.filter((p) => p.fileUrl).length;
  const needsFileCount = products.filter((p) => !p.fileUrl).length;

  const filteredProducts = products.filter((p) => {
    if (filterTab === "active" && !p.isActive) return false;
    if (filterTab === "inactive" && p.isActive) return false;
    if (filterTab === "with-file" && !p.fileUrl) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchDesc = p.description ? p.description.toLowerCase().includes(q) : false;
      return matchName || matchDesc;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display text-lg sm:text-xl font-bold text-foreground">
              Katalog Produk Toko
            </h3>
            <span className="rounded-full bg-foreground text-background px-2.5 py-0.5 text-xs font-bold font-mono">
              {products.length}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Kelola produk digital yang dijual dan terkirim otomatis di profil{" "}
            <span className="font-mono text-foreground font-semibold">/{page.slug}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Grid vs List View Switcher */}
          <div className="flex items-center rounded-xl border border-border bg-muted/60 p-1 text-xs">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "grid"
                  ? "bg-card text-foreground shadow-2xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Tampilan Grid Kartu"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "list"
                  ? "bg-card text-foreground shadow-2xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Tampilan List Baris"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowAddForm((s) => !s)}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground text-background px-4 sm:px-5 py-2.5 text-xs font-bold shadow-sm hover:opacity-90 active:scale-95 transition-all"
          >
            {showAddForm ? (
              <>
                <X className="h-4 w-4" />
                <span>Tutup Form</span>
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                <span>Tambah Produk</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-border/80 bg-card p-3.5 shadow-2xs">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Total Produk
          </p>
          <p className="mt-1 font-display text-2xl font-extrabold text-foreground">{products.length}</p>
          <p className="text-[10px] text-muted-foreground">Katalog toko /{page.slug}</p>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-3.5 shadow-2xs">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Produk Aktif
          </p>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-display text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {activeCount}
            </span>
            <span className="text-xs text-muted-foreground font-mono">/ {products.length}</span>
          </div>
          <p className="text-[10px] text-muted-foreground">Tampil di link profil</p>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-3.5 shadow-2xs">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Berkas Terpasang
          </p>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-display text-2xl font-extrabold text-blue-600 dark:text-blue-400">
              {digitalWithFileCount}
            </span>
            <span className="text-xs text-muted-foreground font-mono">/ {products.length}</span>
          </div>
          <p className="text-[10px] text-muted-foreground">Siap download otomatis</p>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-3.5 shadow-2xs">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Perlu Berkas
          </p>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-display text-2xl font-extrabold text-amber-600 dark:text-amber-400">
              {needsFileCount}
            </span>
            <span className="text-xs text-muted-foreground font-mono">/ {products.length}</span>
          </div>
          <p className="text-[10px] text-muted-foreground">Belum ada file/link</p>
        </div>
      </div>

      {/* Add Product Form Drawer */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-border/80 bg-muted/20 p-4 sm:p-6 space-y-4 animate-in fade-in duration-200 shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-emerald-500" />
              <span>Tambah Produk Baru ke Toko</span>
            </span>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Batal
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="mb-1 block text-xs font-semibold text-foreground">
                Nama Produk <span className="text-red-500">*</span>
              </label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Ebook Next.js 16, Template Notion, Preset Lightroom"
                className={inputCls}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-foreground">
                  Harga (Rp) <span className="text-red-500">*</span>
                </label>
                {price && Number(price) > 0 && (
                  <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {formatIDR(Number(price))}
                  </span>
                )}
              </div>
              <input
                required
                type="number"
                min="1000"
                step="1000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="99000"
                className={`${inputCls} font-mono`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="mb-1 block text-xs font-semibold text-foreground">
                Format Produk
              </label>
              <div className="flex h-10 items-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/5 px-3 text-xs text-blue-600 dark:text-blue-400 font-medium">
                <span>📦 Produk Digital (Unduhan Otomatis)</span>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-foreground">
                  Stok Produk
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-muted-foreground select-none">
                  <Checkbox
                    checked={isUnlimited}
                    onCheckedChange={(v) => {
                      const next = v === true;
                      setIsUnlimited(next);
                      if (next) setStock("");
                    }}
                    aria-label="Stok unlimited"
                  />
                  <span>Unlimited</span>
                </label>
              </div>
              {!isUnlimited ? (
                <input
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="Jumlah stok barang"
                  className={inputCls}
                />
              ) : (
                <div className="rounded-xl border border-border bg-background/50 px-3.5 py-2.5 text-xs text-muted-foreground font-mono">
                  ∞ Tanpa Batas Stok
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-foreground">
              URL Gambar / Mockup Cover Produk
            </label>
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/cover-produk.png"
                className={inputCls}
              />
              {imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="h-10 w-10 shrink-0 rounded-xl object-cover border border-border"
                  onError={() => {}}
                />
              )}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-foreground">
              Deskripsi Produk
            </label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Jelaskan fitur, materi, atau spesifikasi produk..."
              rows={3}
              className={`${inputCls} resize-none`}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="rounded-xl px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:bg-muted"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-foreground text-background px-5 py-2.5 text-xs font-bold shadow-xs hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4" />
                  <span>Simpan Produk</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Search and Filters Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
          {[
            { id: "all", label: "Semua", count: products.length },
            { id: "active", label: "Aktif", count: activeCount },
            { id: "with-file", label: "Ada Berkas Unduhan", count: digitalWithFileCount },
            { id: "inactive", label: "Nonaktif", count: products.length - activeCount },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterTab(tab.id as typeof filterTab)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                filterTab === tab.id
                  ? "bg-foreground text-background font-bold shadow-2xs"
                  : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span>{tab.label}</span>
              <span className="font-mono text-[10px] opacity-75">({tab.count})</span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="flex items-center rounded-xl border border-border bg-background px-3 py-1.5 w-full sm:w-64 shrink-0 shadow-2xs">
          <Search className="h-3.5 w-3.5 text-muted-foreground mr-2 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari produk di toko..."
            className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-muted-foreground hover:text-foreground p-0.5"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Products Presentation */}
      {products.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-12 text-center text-muted-foreground space-y-3 bg-muted/10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <ShoppingBag className="h-7 w-7" />
          </div>
          <div>
            <h4 className="font-display font-bold text-foreground text-base">Belum Ada Produk</h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Mulai hasilkan cuan dengan menjual ebook, materi digital, jasa, atau merchandise di profil /{page.slug}.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-foreground text-background px-4 py-2 text-xs font-bold shadow-sm hover:opacity-90 active:scale-95 transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Tambah Produk Pertama</span>
          </button>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground space-y-2 bg-muted/10">
          <p className="text-xs font-medium text-foreground">Tidak ada produk yang cocok dengan pencarian & filter.</p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setFilterTab("all");
            }}
            className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
          >
            Reset filter dan pencarian
          </button>
        </div>
      ) : viewMode === "grid" ? (
        /* ================= GRID VIEW ================= */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((pr) => (
            <div
              key={pr.id}
              className={`group relative flex flex-col rounded-3xl border bg-card text-card-foreground shadow-2xs hover:shadow-md transition-all duration-200 overflow-hidden ${
                pr.isActive ? "border-border/80 hover:border-foreground/30" : "border-border/50 opacity-85"
              }`}
            >
              {/* Product Cover Banner */}
              <div
                onClick={() => setEditingProduct(pr)}
                className="relative h-40 sm:h-48 w-full overflow-hidden bg-muted cursor-pointer border-b border-border/50"
              >
                {pr.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={pr.imageUrl}
                    alt={pr.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted/50 to-muted/20">
                    <ShoppingBag className="h-10 w-10 text-muted-foreground/40" />
                  </div>
                )}

                {/* Top Overlay Badges */}
                <div className="absolute top-3 left-3">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold text-white shadow-md backdrop-blur-md ${
                      pr.kind === "digital" ? "bg-emerald-600/90" : "bg-blue-600/90"
                    }`}
                  >
                    {pr.kind === "digital" ? <Zap className="h-3 w-3" /> : <Package className="h-3 w-3" />}
                    <span className="capitalize">{pr.kind}</span>
                  </span>
                </div>

                <div className="absolute top-3 right-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold shadow-md backdrop-blur-md ${
                      pr.isActive
                        ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/40"
                        : "bg-zinc-950/80 text-zinc-400 border border-zinc-700/50"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        pr.isActive ? "bg-emerald-400 animate-pulse" : "bg-zinc-500"
                      }`}
                    />
                    <span>{pr.isActive ? "Aktif" : "Nonaktif"}</span>
                  </span>
                </div>

                {/* Floating Bottom Price Tag */}
                <div className="absolute bottom-3 left-3">
                  <span className="inline-flex items-center rounded-full bg-background/95 backdrop-blur-md border border-border/80 px-3 py-1 font-display font-extrabold text-sm text-foreground shadow-md">
                    {formatIDR(pr.priceIdr)}
                  </span>
                </div>
              </div>

              {/* Card Body Details */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <h4
                    onClick={() => setEditingProduct(pr)}
                    className="font-display text-base font-bold text-foreground leading-snug line-clamp-2 hover:text-primary transition-colors cursor-pointer"
                    title={pr.name}
                  >
                    {pr.name}
                  </h4>

                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed min-h-[2rem]">
                    {pr.description || "Tidak ada deskripsi produk."}
                  </p>
                </div>

                {/* Meta Row: Stock & Digital File Indicator */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="inline-flex items-center gap-1 rounded-lg bg-muted/60 border border-border/60 px-2 py-0.5 text-[11px] font-mono text-muted-foreground">
                    <Package className="h-3 w-3" />
                    <span>{pr.stock !== null ? `Stok: ${pr.stock}` : "∞ Unlimited"}</span>
                  </span>

                  {pr.kind === "digital" && (
                    pr.fileUrl ? (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                        <FileCheck className="h-3 w-3" />
                        <span>File Siap</span>
                      </span>
                    ) : (
                      <label className="inline-flex items-center gap-1 rounded-lg bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[11px] font-medium text-amber-600 dark:text-amber-400 cursor-pointer hover:bg-amber-500/20 transition-colors">
                        <AlertCircle className="h-3 w-3" />
                        <span>+ Upload File</span>
                        <input
                          type="file"
                          className="hidden"
                          accept="application/pdf,application/zip"
                          onChange={(e) => onUploadFile(e, pr.id)}
                        />
                      </label>
                    )
                  )}
                </div>

                {/* Action Bar */}
                <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                  {/* Status Toggle Switch */}
                  <label
                    className="flex items-center gap-2 cursor-pointer select-none shrink-0"
                    title={pr.isActive ? "Klik untuk menonaktifkan" : "Klik untuk mengaktifkan"}
                  >
                    <div
                      onClick={() => onToggleActive(pr.id, !pr.isActive)}
                      className={`relative inline-flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out ${
                        pr.isActive ? "bg-emerald-500" : "bg-muted-foreground/30"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                          pr.isActive ? "translate-x-5" : "translate-x-1"
                        }`}
                      />
                    </div>
                    <span className="text-[11px] font-medium text-muted-foreground hidden sm:inline">
                      {pr.isActive ? "Aktif" : "Mati"}
                    </span>
                  </label>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1.5 flex-1 justify-end">
                    {/* View Live */}
                    <Link
                      href={`/${page.slug}/products/${pr.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-9 w-9 inline-flex items-center justify-center rounded-xl border border-border/80 bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shadow-2xs shrink-0"
                      title="Lihat Halaman Live Pembeli"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>

                    {/* Edit Button */}
                    <button
                      type="button"
                      onClick={() => setEditingProduct(pr)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-bold text-foreground hover:bg-foreground hover:text-background transition-all shadow-2xs active:scale-95"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>Edit</span>
                    </button>

                    {/* Delete */}
                    {onDeleteProduct && (
                      <button
                        type="button"
                        onClick={() => onDeleteProduct(pr.id, pr.name)}
                        className="h-9 w-9 inline-flex items-center justify-center rounded-xl text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors shrink-0"
                        title="Hapus Produk"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ================= LIST VIEW ================= */
        <div className="grid grid-cols-1 gap-3.5">
          {filteredProducts.map((pr) => (
            <div
              key={pr.id}
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border bg-card p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all ${
                pr.isActive ? "border-border/80 hover:border-foreground/30" : "border-border/50 opacity-85"
              }`}
            >
              {/* Product Info & Thumbnail */}
              <div className="flex items-start sm:items-center gap-4 min-w-0">
                <div
                  onClick={() => setEditingProduct(pr)}
                  className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 rounded-2xl overflow-hidden bg-muted border border-border/80 cursor-pointer group"
                >
                  {pr.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={pr.imageUrl}
                      alt={pr.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted/50 to-muted/20">
                      <ShoppingBag className="h-7 w-7 text-muted-foreground/40" />
                    </div>
                  )}
                  <div className="absolute top-1 left-1">
                    <span
                      className={`inline-flex rounded-full p-1 text-[10px] text-white shadow ${
                        pr.kind === "digital" ? "bg-emerald-600" : "bg-blue-600"
                      }`}
                    >
                      {pr.kind === "digital" ? <Zap className="h-2 w-2" /> : <Package className="h-2 w-2" />}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4
                      onClick={() => setEditingProduct(pr)}
                      className="font-display text-sm sm:text-base font-bold text-foreground truncate max-w-xs sm:max-w-md hover:text-primary transition-colors cursor-pointer"
                    >
                      {pr.name}
                    </h4>

                    {/* Active/Inactive Badge */}
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        pr.isActive
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${pr.isActive ? "bg-emerald-500 animate-pulse" : "bg-zinc-400"}`} />
                      {pr.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="font-display font-extrabold text-foreground text-sm">
                      {formatIDR(pr.priceIdr)}
                    </span>
                    <span>·</span>
                    <span className="font-mono">{pr.stock !== null ? `Stok: ${pr.stock}` : "∞ Unlimited"}</span>

                    {pr.kind === "digital" && (
                      <>
                        <span>·</span>
                        {pr.fileUrl ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium text-[11px]">
                            <FileCheck className="h-3 w-3" />
                            <span>File Terpasang</span>
                          </span>
                        ) : (
                          <label className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium text-[11px] cursor-pointer hover:underline">
                            <AlertCircle className="h-3 w-3" />
                            <span>Upload File</span>
                            <input
                              type="file"
                              className="hidden"
                              accept="application/pdf,application/zip"
                              onChange={(e) => onUploadFile(e, pr.id)}
                            />
                          </label>
                        )}
                      </>
                    )}
                  </div>

                  {pr.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {pr.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions Toolbar */}
              <div className="flex items-center gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-border/50 justify-between sm:justify-end w-full sm:w-auto shrink-0">
                {/* Status Toggle Switch */}
                <label
                  className="flex items-center gap-2 cursor-pointer select-none"
                  title={pr.isActive ? "Nonaktifkan produk" : "Aktifkan produk"}
                >
                  <div
                    onClick={() => onToggleActive(pr.id, !pr.isActive)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out ${
                      pr.isActive ? "bg-emerald-500" : "bg-muted-foreground/30"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                        pr.isActive ? "translate-x-4.5" : "translate-x-0.5"
                      }`}
                    />
                  </div>
                </label>

                {/* Edit Button */}
                <button
                  type="button"
                  onClick={() => setEditingProduct(pr)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-1.5 text-xs font-bold text-foreground hover:bg-foreground hover:text-background transition-all shadow-2xs active:scale-95"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </button>

                {/* Live Link */}
                <Link
                  href={`/${page.slug}/products/${pr.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shadow-2xs"
                  title="Lihat live"
                >
                  <Eye className="h-3.5 w-3.5" />
                </Link>

                {/* Delete Button */}
                {onDeleteProduct && (
                  <button
                    type="button"
                    onClick={() => onDeleteProduct(pr.id, pr.name)}
                    className="p-1.5 rounded-xl text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                    title="Hapus produk"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Product Modal */}
      <EditProductModal
        product={editingProduct}
        isOpen={editingProduct !== null}
        onClose={() => setEditingProduct(null)}
        onSave={async (id, data) => {
          if (onUpdateProduct) {
            await onUpdateProduct(id, data);
          }
        }}
        onDelete={onDeleteProduct}
      />
    </div>
  );
}
