"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Download,
  Search,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ArrowRight,
  Loader2,
  PackageCheck,
  ShieldCheck,
} from "lucide-react";
import { formatIDR } from "@/lib/types";

interface PurchasedItem {
  orderId: string;
  buyerName: string;
  buyerContact: string;
  productName: string;
  productDescription: string;
  productImage: string | null;
  hasFile: boolean;
  creatorName: string;
  creatorSlug: string;
  totalIdr: number;
  paidAt: string;
  downloadCount: number;
  downloadUrl: string;
}

export default function AksesPage() {
  const [contact, setContact] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [orders, setOrders] = useState<PurchasedItem[]>([]);
  const [error, setError] = useState("");

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const query = contact.trim();
    if (!query) {
      setError("Silakan masukkan email atau nomor WhatsApp Anda.");
      return;
    }

    setLoading(true);
    setError("");
    setSearched(false);

    try {
      const res = await fetch("/api/buyer/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact: query }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mencari pesanan");
      setOrders(data.orders || []);
      setSearched(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-primary/20">
      {/* Top Navbar */}
      <header className="border-b border-border/80 bg-card/60 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Link href="/" className="font-display text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            <span>OpenLynk</span>
            <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-blue-600 dark:text-blue-400">
              Portal Pembeli
            </span>
          </Link>

          <div className="flex items-center gap-3 text-xs">
            <Link
              href="/masuk"
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Masuk Kreator
            </Link>
            <Link
              href="/daftar"
              className="rounded-full bg-primary px-3.5 py-1.5 font-semibold text-primary-foreground hover:opacity-90 transition-opacity shadow-2xs"
            >
              Buat Bio Anda
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:py-16 flex-1">
        {/* Hero Section */}
        <div className="text-center space-y-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-1 shadow-xs">
            <Download className="h-6 w-6" />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
            Portal Akses Produk Digital
          </h1>
          <p className="mx-auto max-w-md text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Kehilangan email atau pesan WhatsApp? Masukkan kontak yang Anda gunakan saat checkout untuk mengunduh ulang seluruh produk digital yang pernah Anda beli.
          </p>
        </div>

        {/* Search Card */}
        <div className="mt-8 rounded-3xl border border-border/80 bg-card p-4 sm:p-6 shadow-sm">
          <form onSubmit={handleSearch} className="space-y-3">
            <label className="block text-xs font-semibold text-foreground">
              Email atau Nomor WhatsApp Pembelian
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="contoh: budi@gmail.com atau 081234567890"
                  className="w-full rounded-2xl border border-border bg-background pl-10 pr-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-hidden transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="shrink-0 inline-flex items-center justify-center gap-2 rounded-2xl bg-foreground text-background px-6 py-2.5 text-xs font-bold hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all shadow-xs cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Mencari...</span>
                  </>
                ) : (
                  <>
                    <span>Cari Pesanan Saya</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-2xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Results Section */}
        {searched && (
          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
                <PackageCheck className="h-4 w-4 text-emerald-500" />
                <span>Hasil Pencarian: {orders.length} Produk Ditemukan</span>
              </h2>
              <span className="text-[11px] text-muted-foreground font-mono">
                {contact}
              </span>
            </div>

            {orders.length === 0 ? (
              <div className="rounded-3xl border border-border/80 bg-card p-8 text-center space-y-2">
                <p className="text-sm font-semibold text-foreground">
                  Tidak ada pesanan lunas yang ditemukan
                </p>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  Pastikan email atau nomor WhatsApp yang Anda masukkan sama persis dengan yang Anda daftarkan saat melakukan pemesanan di OpenLynk.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((item) => (
                  <div
                    key={item.orderId}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-border/80 bg-card p-4 sm:p-5 hover:border-border transition-all shadow-xs"
                  >
                    <div className="flex items-start gap-3.5">
                      {item.productImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="h-16 w-16 rounded-2xl object-cover border border-border/60 shrink-0"
                        />
                      ) : (
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-muted text-muted-foreground font-bold text-lg">
                          📦
                        </div>
                      )}

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Lunas
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            ID #{item.orderId.slice(0, 10)}
                          </span>
                        </div>
                        <h3 className="font-semibold text-sm text-foreground">
                          {item.productName}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Kreator:</span>
                          <Link
                            href={`/${item.creatorSlug}`}
                            target="_blank"
                            className="font-medium text-foreground hover:underline inline-flex items-center gap-1"
                          >
                            <span>{item.creatorName}</span>
                            <ExternalLink className="h-3 w-3 text-muted-foreground" />
                          </Link>
                          <span>•</span>
                          <span>{formatIDR(item.totalIdr)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:items-end gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/60">
                      {item.hasFile ? (
                        <a
                          href={item.downloadUrl}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary text-primary-foreground px-5 py-2.5 text-xs font-bold hover:opacity-90 active:scale-95 transition-all shadow-xs"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>Unduh Berkas</span>
                        </a>
                      ) : (
                        <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                          Menunggu Berkas dari Kreator
                        </span>
                      )}

                      <span className="text-[10px] text-muted-foreground">
                        {item.downloadCount > 0
                          ? `Sudah diunduh ${item.downloadCount} kali`
                          : "Belum pernah diunduh"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Security & Guarantee Note */}
        <div className="mt-12 rounded-3xl border border-border/60 bg-muted/20 p-5 flex items-start gap-3.5 text-xs text-muted-foreground">
          <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-foreground">Keamanan & Privasi Unduhan Digital</p>
            <p className="leading-relaxed">
              Tautan unduhan dihasilkan secara dinamis menggunakan tanda tangan enkripsi berkas privat ImageKit Cloud yang hanya dapat diakses oleh pemilik transaksi terverifikasi.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} OpenLynk. Platform Toko & Bio Kreator Digital.</p>
      </footer>
    </div>
  );
}
