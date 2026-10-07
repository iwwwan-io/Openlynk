"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
import { formatIDR } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/confirm";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  ShoppingBag,
  Upload,
  Trash2,
  Check,
  Loader2,
  FileCheck,
  ImageIcon,
  ExternalLink,
} from "lucide-react";

interface EditProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (
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
  onDelete?: (id: string, name: string) => Promise<void>;
}

export function EditProductModal({
  product,
  isOpen,
  onClose,
  onSave,
  onDelete,
}: EditProductModalProps) {
  if (!isOpen || !product) return null;

  return (
    <EditProductModalForm
      key={product.id}
      product={product}
      onClose={onClose}
      onSave={onSave}
      onDelete={onDelete}
    />
  );
}

function EditProductModalForm({
  product,
  onClose,
  onSave,
  onDelete,
}: {
  product: Product;
  onClose: () => void;
  onSave: EditProductModalProps["onSave"];
  onDelete: EditProductModalProps["onDelete"];
}) {
  // Dialog shadcn menangani Escape, overlay-klik, dan scroll-lock secara native.
  const [name, setName] = useState(product.name || "");
  const [price, setPrice] = useState<number | "">(product.priceIdr || 0);
  const [desc, setDesc] = useState(product.description || "");
  const [stock, setStock] = useState<number | "">(
    product.stock !== null && product.stock !== undefined ? product.stock : ""
  );
  const [isUnlimited, setIsUnlimited] = useState(product.stock === null || product.stock === undefined);
  const [kind] = useState<"digital" | "fisik">(product.kind || "digital");
  const [imageUrl, setImageUrl] = useState(product.imageUrl || "");
  const [fileUrl, setFileUrl] = useState(product.fileUrl || "");
  const [isActive, setIsActive] = useState(product.isActive ?? true);

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [removing, setRemoving] = useState(false);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploadingImage(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/uploads", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Gagal mengunggah foto");
      setImageUrl(json.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal upload gambar");
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleDigitalFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploadingFile(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("kind", "digital");
      form.append("isPrivate", "true");
      const res = await fetch("/api/uploads", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Gagal mengunggah file");
      setFileUrl(json.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal upload file digital");
    } finally {
      setUploadingFile(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Nama produk wajib diisi");
      return;
    }
    const numericPrice = Number(price);
    if (!price || numericPrice < 1000) {
      setError("Harga produk minimal Rp 1.000");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await onSave(product.id, {
        name: name.trim(),
        priceIdr: numericPrice,
        kind,
        stock: isUnlimited ? null : stock === "" ? null : Number(stock),
        description: desc.trim(),
        imageUrl: imageUrl.trim() || undefined,
        fileUrl: fileUrl.trim() || undefined,
        isActive,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan perubahan");
    } finally {
      setLoading(false);
    }
  }

  const inputCls =
    "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-base sm:text-sm outline-none focus:border-foreground transition";

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg rounded-3xl border-border bg-card shadow-2xl sm:rounded-3xl max-h-[92vh] sm:max-h-[88vh] overflow-hidden flex flex-col">
        {/* Header (Sticky) */}
        <DialogHeader className="border-b border-border/60 px-4 sm:px-6 py-3.5 sm:py-4 text-left shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <span className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 shadow-2xs">
              <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
            </span>
            <div className="min-w-0">
              <DialogTitle className="font-display text-sm sm:text-base font-bold text-foreground truncate">
                Edit Produk Toko
              </DialogTitle>
              <DialogDescription className="text-[11px] text-muted-foreground font-mono truncate">
                ID: {product.id} · Sinkron ke profil
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Form Body (Scrollable inside modal) */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4 overscroll-contain">
            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            {/* Nama & Harga */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Nama Produk <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Ebook Pemrograman Next.js"
                  className={inputCls}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Harga (Rp) <span className="text-red-500">*</span>
                  </label>
                  {price !== "" && Number(price) > 0 && (
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
                  onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="99000"
                  className={`${inputCls} font-mono`}
                />
              </div>
            </div>

          {/* Jenis Produk (100% Digital) */}
          <div className="flex items-center justify-between rounded-2xl border border-blue-500/20 bg-blue-500/5 px-3.5 py-2.5">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-sm">
                📦
              </span>
              <div>
                <p className="text-xs font-semibold text-foreground">Produk Digital</p>
                <p className="text-[11px] text-muted-foreground">Unduhan instan via email & tautan aman bertanda tangan</p>
              </div>
            </div>
            <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-600 dark:text-blue-400">
              Otomatis
            </span>
          </div>

          {/* Stok Pengaturan */}
          <div className="rounded-2xl border border-border/80 bg-muted/20 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground">
                Ketersediaan Stok
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-muted-foreground select-none">
                <Checkbox
                  checked={isUnlimited}
                  onCheckedChange={(v) => {
                    const next = v === true;
                    setIsUnlimited(next);
                    if (next) setStock("");
                  }}
                  aria-label="Stok tanpa batas"
                />
                <span>Tanpa Batas (Unlimited)</span>
              </label>
            </div>
            {!isUnlimited && (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="Jumlah stok barang (misal: 25)"
                  className={`${inputCls} font-mono text-xs`}
                />
                <span className="text-xs text-muted-foreground whitespace-nowrap">unit</span>
              </div>
            )}
          </div>

          {/* Deskripsi Produk */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-foreground">
              Deskripsi Produk
            </label>
            <textarea
              rows={3}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Jelaskan manfaat, materi, panduan, atau spesifikasi barang ini..."
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* Foto Cover / Thumbnail Produk */}
          <div className="rounded-2xl border border-border/80 bg-muted/20 p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <ImageIcon className="h-3.5 w-3.5" />
                <span>Foto Cover Produk</span>
              </label>
              {imageUrl && (
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="text-[11px] text-red-500 hover:underline"
                >
                  Hapus Foto
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt="Thumbnail"
                  className="h-16 w-16 rounded-xl object-cover border border-border shadow-xs shrink-0"
                />
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-dashed border-border bg-card text-muted-foreground">
                  <ImageIcon className="h-6 w-6 opacity-40" />
                </div>
              )}

              <div className="flex-1 space-y-1.5">
                <label className="inline-flex items-center gap-1.5 cursor-pointer rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-2xs">
                  {uploadingImage ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Mengunggah...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-3.5 w-3.5" />
                      <span>{imageUrl ? "Ganti Foto Cover" : "Upload Foto Cover (JPG/PNG)"}</span>
                    </>
                  )}
                  <input
                    type="file"
                    className="hidden"
                    accept="image/png,image/jpeg,image/webp"
                    disabled={uploadingImage}
                    onChange={handleImageUpload}
                  />
                </label>
                <p className="text-[10px] text-muted-foreground">
                  Format PNG, JPG, atau WebP maks 5MB.
                </p>
              </div>
            </div>
          </div>

          {/* File Digital (Jika Digital) */}
          {kind === "digital" && (
            <div className="rounded-2xl border border-border/80 bg-muted/20 p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <FileCheck className="h-3.5 w-3.5 text-blue-500" />
                  <span>File Digital Pembeli</span>
                </label>
                {fileUrl && (
                  <button
                    type="button"
                    onClick={() => setFileUrl("")}
                    className="text-[11px] text-red-500 hover:underline"
                  >
                    Hapus File
                  </button>
                )}
              </div>

              {fileUrl ? (
                <div className="flex items-center justify-between rounded-xl bg-card border border-emerald-500/30 p-2.5 text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                      ✓
                    </span>
                    <span className="font-mono text-muted-foreground truncate">{fileUrl}</span>
                  </div>
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 shrink-0 text-muted-foreground hover:text-foreground p-1"
                    title="Uji Unduh File"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              ) : (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-2.5 text-xs text-amber-700 dark:text-amber-300">
                  ⚠️ Belum ada file digital. Pembeli belum bisa mengunduh file setelah bayar.
                </div>
              )}

              <div>
                <label className="inline-flex items-center gap-1.5 cursor-pointer rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-2xs">
                  {uploadingFile ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Mengunggah File...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-3.5 w-3.5" />
                      <span>{fileUrl ? "Ganti File Digital (PDF/ZIP)" : "Unggah File Digital (PDF/ZIP)"}</span>
                    </>
                  )}
                  <input
                    type="file"
                    className="hidden"
                    accept="application/pdf,application/zip"
                    disabled={uploadingFile}
                    onChange={handleDigitalFileUpload}
                  />
                </label>
              </div>
            </div>
          )}

          {/* Status Penjualan Toggle */}
          <div className="flex items-center justify-between rounded-2xl border border-border/80 bg-card p-3.5">
            <div>
              <p className="text-xs font-semibold text-foreground">Status Produk</p>
              <p className="text-[11px] text-muted-foreground">
                {isActive ? "Aktif & tampil di bio pembeli" : "Nonaktif (disembunyikan dari pembeli)"}
              </p>
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={(v) => setIsActive(v === true)}
              aria-label="Status aktif produk"
            />
          </div>

          </div>

          {/* Sticky Footer Actions */}
          <div className="shrink-0 border-t border-border/60 px-4 sm:px-6 py-3.5 bg-card flex items-center justify-between gap-2">
            {onDelete ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors"
                title="Hapus produk ini"
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">Hapus Produk</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-3 sm:px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading || uploadingImage || uploadingFile}
                className="inline-flex items-center gap-1.5 rounded-xl bg-foreground text-background px-4 py-2 text-xs font-bold shadow-xs hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>Simpan Perubahan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </DialogContent>
      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Hapus produk?"
        description={`Produk "${name}" beserta kartu produknya di bento akan dihapus.`}
        confirmLabel="Ya, hapus"
        danger
        busy={removing}
        onConfirm={async () => {
          if (!onDelete) return;
          setRemoving(true);
          try {
            await onDelete(product.id, name);
            onClose();
          } finally {
            setRemoving(false);
          }
        }}
      />
    </Dialog>
  );
}
