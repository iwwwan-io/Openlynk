"use client";

import { useState } from "react";
import type { Order, Page, Product } from "@/lib/types";
import { formatIDR } from "@/lib/types";
import {
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  Search,
  ShoppingBag,
  Package,
} from "lucide-react";
import { PageProductsManager } from "./page-products-manager";

interface StoreTabProps {
  orders: Order[];
  onFulfillOrder: (orderId: string) => Promise<void>;
  products?: Product[];
  activePage?: Page;
  onCreateProduct?: (data: {
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
  onToggleActive?: (id: string, isActive: boolean) => Promise<void>;
  onUploadFile?: (e: React.ChangeEvent<HTMLInputElement>, productId: string) => Promise<void>;
}

function statusBadge(s: string) {
  if (s === "paid") {
    return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800";
  }
  if (s === "sent") {
    return "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300 dark:border-blue-800";
  }
  if (s === "pending") {
    return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800";
  }
  if (s === "expired") {
    return "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700";
  }
  return "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-300 dark:border-red-800";
}

export function StoreTab({
  orders,
  onFulfillOrder,
  products = [],
  activePage,
  onCreateProduct,
  onUpdateProduct,
  onDeleteProduct,
  onToggleActive,
  onUploadFile,
}: StoreTabProps) {
  const [storeView, setStoreView] = useState<"orders" | "products">("orders");
  const [filter, setFilter] = useState<string>("all");
  const [query, setQuery] = useState("");

  const filteredOrders = orders.filter((o) => {
    if (filter !== "all" && o.status !== filter) return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      return (
        o.buyerName.toLowerCase().includes(q) ||
        o.buyerContact.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Metric computations
  const totalRevenue = orders
    .filter((o) => o.status === "paid" || o.status === "sent")
    .reduce((sum, o) => sum + (o.totalIdr || 0), 0);
  const paidCount = orders.filter((o) => o.status === "paid" || o.status === "sent").length;
  const pendingCount = orders.filter((o) => o.status === "pending").length;

  return (
    <div className="space-y-6">
      {/* Store Metrics Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-3xl border border-border bg-card p-4 sm:p-5 shadow-2xs">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Total Omset Lunas
          </p>
          <p className="mt-1 font-display text-xl sm:text-2xl font-extrabold text-foreground">
            {formatIDR(totalRevenue)}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Dari transaksi lunas</p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-4 sm:p-5 shadow-2xs">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Pesanan Sukses
          </p>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-display text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {paidCount}
            </span>
            <span className="text-xs text-muted-foreground font-mono">/ {orders.length}</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">Lunas & Terkirim</p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-4 sm:p-5 shadow-2xs">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Menunggu Bayar
          </p>
          <p className="mt-1 font-display text-xl sm:text-2xl font-extrabold text-amber-600 dark:text-amber-400">
            {pendingCount}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Status pending</p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-4 sm:p-5 shadow-2xs">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Katalog Produk
          </p>
          <p className="mt-1 font-display text-xl sm:text-2xl font-extrabold text-foreground">
            {products.length}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {activePage ? `Di profil /${activePage.slug}` : "Semua produk"}
          </p>
        </div>
      </div>

      {/* Main Container with Tab Switcher */}
      <div className="rounded-3xl border border-border bg-card p-4 sm:p-6 shadow-sm space-y-6">
        {/* Header & Sub-tab Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
          <div>
            <h2 className="font-display text-lg font-bold text-foreground">
              {storeView === "orders" ? "Pesanan & Transaksi" : "Katalog Produk Toko"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {storeView === "orders"
                ? `Daftar transaksi masuk dari pembeli produk di toko Anda (${orders.length} total)`
                : `Kelola semua produk digital (${products.length} produk)`}
            </p>
          </div>

          {/* Switcher: Pesanan vs Katalog Produk */}
          <div className="flex items-center gap-1 self-start sm:self-auto rounded-full border border-border bg-muted p-1 text-xs">
            <button
              type="button"
              onClick={() => setStoreView("orders")}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-medium transition-all ${
                storeView === "orders"
                  ? "bg-foreground text-background font-bold shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Pesanan ({orders.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setStoreView("products")}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-medium transition-all ${
                storeView === "products"
                  ? "bg-foreground text-background font-bold shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Package className="h-3.5 w-3.5" />
              <span>Produk ({products.length})</span>
            </button>
          </div>
        </div>

        {/* VIEW 1: ORDERS & TRANSACTIONS */}
        {storeView === "orders" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Search & Filter Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
                {[
                  { id: "all", label: "Semua", count: orders.length },
                  { id: "paid", label: "Lunas (Paid)", count: orders.filter((o) => o.status === "paid").length },
                  { id: "sent", label: "Terkirim", count: orders.filter((o) => o.status === "sent").length },
                  { id: "pending", label: "Pending", count: orders.filter((o) => o.status === "pending").length },
                  { id: "cancelled", label: "Batal", count: orders.filter((o) => o.status === "cancelled").length },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFilter(f.id)}
                    className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 font-medium transition-colors ${
                      filter === f.id
                        ? "bg-foreground text-background font-bold shadow-xs"
                        : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <span>{f.label}</span>
                    <span className="font-mono text-[10px] opacity-75">({f.count})</span>
                  </button>
                ))}
              </div>

              {/* Search Input */}
              <div className="flex items-center rounded-xl border border-border bg-background px-3 py-1.5 w-full sm:w-64 shrink-0 shadow-2xs">
                <Search className="h-3.5 w-3.5 text-muted-foreground mr-2 shrink-0" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cari pembeli atau ID..."
                  className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none"
                />
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground text-xs bg-muted/10">
                Tidak ada data pesanan yang cocok dengan kriteria pencarian.
              </div>
            ) : (
              <>
                {/* Mobile Order Cards View (shown on screens < 640px) */}
                <div className="grid grid-cols-1 gap-3 sm:hidden">
                  {filteredOrders.map((o) => (
                    <div
                      key={o.id}
                      className="rounded-2xl border border-border/80 bg-card p-4 space-y-3 shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xs text-foreground">
                          #{o.id}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${statusBadge(
                            o.status
                          )}`}
                        >
                          {o.status === "paid" && <CheckCircle2 className="h-3 w-3" />}
                          {o.status === "pending" && <Clock className="h-3 w-3" />}
                          {o.status === "sent" && <Truck className="h-3 w-3" />}
                          {o.status === "cancelled" && <XCircle className="h-3 w-3" />}
                          <span className="capitalize">{o.status}</span>
                        </span>
                      </div>

                      <div className="space-y-1 text-xs">
                        <p className="font-bold text-foreground">{o.buyerName}</p>
                        <p className="font-mono text-[11px] text-muted-foreground break-all">
                          {o.buyerContact}
                        </p>
                      </div>

                      <div className="flex items-center justify-between border-t border-border/50 pt-2.5">
                        <div>
                          <p className="text-[10px] text-muted-foreground">Total Tagihan</p>
                          <p className="font-mono font-bold text-sm text-foreground">
                            {formatIDR(o.totalIdr + o.feeIdr)}
                          </p>
                        </div>

                        {o.status === "paid" && (
                          <button
                            type="button"
                            onClick={() => onFulfillOrder(o.id)}
                            className="rounded-xl bg-foreground text-background px-3.5 py-1.5 text-xs font-bold hover:opacity-90 active:scale-95 transition-all shadow-2xs"
                          >
                            Tandai Dikirim
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Responsive Table View (hidden on screens < 640px) */}
                <div className="hidden sm:block overflow-x-auto rounded-2xl border border-border/70">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-border/60 bg-muted/30 text-muted-foreground uppercase tracking-wider text-[11px]">
                        <th className="py-3 px-3.5 font-semibold">ID Pesanan</th>
                        <th className="py-3 px-3.5 font-semibold">Pembeli</th>
                        <th className="py-3 px-3.5 font-semibold">Kontak</th>
                        <th className="py-3 px-3.5 font-semibold">Total Tagihan</th>
                        <th className="py-3 px-3.5 font-semibold">Status</th>
                        <th className="py-3 px-3.5 font-semibold text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {filteredOrders.map((o) => (
                        <tr key={o.id} className="hover:bg-muted/30 transition-colors">
                          <td className="py-3.5 px-3.5 font-mono text-[11px] text-muted-foreground">
                            #{o.id}
                          </td>
                          <td className="py-3.5 px-3.5 font-bold text-foreground">{o.buyerName}</td>
                          <td className="py-3.5 px-3.5 font-mono text-[11px] text-muted-foreground max-w-xs truncate">
                            {o.buyerContact}
                          </td>
                          <td className="py-3.5 px-3.5 font-bold font-mono">
                            {formatIDR(o.totalIdr + o.feeIdr)}
                          </td>
                          <td className="py-3.5 px-3.5">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${statusBadge(
                                o.status
                              )}`}
                            >
                              {o.status === "paid" && <CheckCircle2 className="h-3 w-3" />}
                              {o.status === "pending" && <Clock className="h-3 w-3" />}
                              {o.status === "sent" && <Truck className="h-3 w-3" />}
                              {o.status === "cancelled" && <XCircle className="h-3 w-3" />}
                              <span className="capitalize">{o.status}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-3.5 text-right">
                            {o.status === "paid" ? (
                              <button
                                type="button"
                                onClick={() => onFulfillOrder(o.id)}
                                className="rounded-full bg-foreground text-background px-3 py-1 text-[11px] font-semibold hover:opacity-90 active:scale-95 transition-all shadow-2xs"
                              >
                                Tandai Dikirim
                              </button>
                            ) : (
                              <span className="text-[11px] text-muted-foreground font-mono">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* VIEW 2: PRODUCT CATALOG MANAGEMENT */}
        {storeView === "products" && (
          <div className="animate-in fade-in duration-150">
            {activePage && onCreateProduct && onToggleActive && onUploadFile ? (
              <PageProductsManager
                page={activePage}
                products={products}
                onCreateProduct={onCreateProduct}
                onUpdateProduct={onUpdateProduct}
                onDeleteProduct={onDeleteProduct}
                onToggleActive={onToggleActive}
                onUploadFile={onUploadFile}
              />
            ) : (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground text-xs bg-muted/10">
                Pilih profil halaman di tab &quot;Halaman & Studio&quot; untuk mengelola produk secara langsung.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
