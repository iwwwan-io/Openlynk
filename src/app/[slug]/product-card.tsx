"use client";

import Link from "next/link";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { formatIDR, type Product } from "@/lib/types";

export function ProductCard({
  p,
  slug = "demo",
  accent = "#2563eb",
}: {
  p: Product;
  slug?: string;
  accent?: string;
}) {
  const soldOut = p.kind === "fisik" && p.stock !== null && p.stock <= 0;
  const productUrl = `/${slug}/products/${p.id}`;

  const originalPrice =
    p.originalPriceIdr && p.originalPriceIdr > p.priceIdr
      ? p.originalPriceIdr
      : p.priceIdr >= 100000
      ? Math.round((p.priceIdr * 1.4) / 10000) * 10000 - 1000
      : p.priceIdr >= 50000
      ? Math.round((p.priceIdr * 1.5) / 10000) * 10000 - 1000
      : Math.round((p.priceIdr * 1.6) / 5000) * 5000 - 1000;

  return (
    <Link
      href={productUrl}
      className={`group relative flex h-full w-full flex-col justify-between overflow-hidden rounded-3xl border bg-card p-3.5 sm:p-4 text-card-foreground shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
        soldOut
          ? "border-border/60 opacity-80"
          : "border-border/80 hover:border-foreground/30"
      }`}
    >
      {/* 1. Image Produk Bersih Tanpa Tulisan */}
      <div className="relative w-full h-36 sm:h-48 shrink-0 overflow-hidden rounded-2xl bg-muted border border-border/50">
        {p.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.imageUrl}
            alt={p.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted/60 via-muted/30 to-card">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-card border border-border text-foreground shadow-2xs">
              <ShoppingBag className="h-6 w-6 text-muted-foreground" />
            </div>
          </div>
        )}
      </div>

      {/* Konten di Bawah Image */}
      <div className="flex flex-col justify-between flex-1 min-w-0 pt-2.5 sm:pt-3 space-y-2">
        <div className="space-y-1.5">
          {/* 2. Tulisan Produk Digital & Di Sebelahnya Harga Asli + Harga Diskon */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
              {p.kind === "digital" ? "Produk Digital" : "Produk Fisik"}
            </span>
            <span className="text-xs sm:text-sm text-muted-foreground line-through decoration-muted-foreground/70 font-medium">
              {formatIDR(originalPrice)}
            </span>
            <span className="font-display font-extrabold text-sm sm:text-base text-foreground">
              {formatIDR(p.priceIdr)}
            </span>
          </div>

          {/* 3. Title Produk & Deskripsi */}
          <h4 className="font-display text-sm sm:text-base font-bold leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-1 sm:line-clamp-2">
            {p.name}
          </h4>
          {p.description && (
            <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed">
              {p.description}
            </p>
          )}
        </div>

        {/* 4. Tombol Beli */}
        <div className="pt-1 mt-auto">
          {soldOut ? (
            <div className="w-full rounded-xl bg-muted py-2 px-4 text-center text-xs font-bold text-muted-foreground">
              Stok Habis
            </div>
          ) : (
            <div
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl py-2 sm:py-2.5 px-4 text-xs sm:text-sm font-bold text-white shadow-xs transition-all duration-200 group-hover:opacity-95 active:scale-95"
              style={{ backgroundColor: accent }}
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Beli Sekarang</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
