"use client";

import { useState } from "react";
import type { Page } from "@/lib/types";
import {
  Plus,
  ExternalLink,
  Trash2,
  Copy,
  Check,
  Sparkles,
  LayoutGrid,
  ChevronDown,
  Layers,
  ArrowRight,
  X,
  Crown,
} from "lucide-react";
import { QrModal } from "../qr-modal";

interface PagesOverviewProps {
  pages: Page[];
  activeId: string;
  loading: boolean;
  showOverview?: boolean;
  initialShowCarousel?: boolean;
  onCarouselToggle?: (open: boolean) => void;
  onSelectPage: (id: string) => void;
  onNewPageClick: () => void;
  onDeletePage: (id: string, slug: string) => void;
  isPro?: boolean;
  onUpgradePro?: () => void;
}

export function PagesOverview({
  pages,
  activeId,
  loading,
  showOverview = false,
  onCarouselToggle,
  onSelectPage,
  onNewPageClick,
  onDeletePage,
  isPro = false,
  onUpgradePro,
}: PagesOverviewProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activePage = pages.find((p) => p.id === activeId) ?? pages[0];

  function copyPageLink(e: React.MouseEvent, page: Page) {
    e.stopPropagation();
    const url = `${window.location.origin}/${page.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(page.id);
    setTimeout(() => setCopiedId(null), 1800);
  }

  function handleSelectAndOpenStudio(pageId: string) {
    onSelectPage(pageId);
    if (showOverview) {
      onCarouselToggle?.(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-4 overflow-hidden py-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-20 w-full max-w-sm animate-pulse rounded-2xl border border-border bg-card/60"
          />
        ))}
      </div>
    );
  }

  if (pages.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-3xl border border-dashed border-border bg-card p-12 text-center shadow-xs">
        <Sparkles className="h-10 w-10 text-muted-foreground mb-3" />
        <p className="font-display text-xl font-bold">Belum ada halaman profil</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Buat halaman link-in-bio bento pertamamu sekarang
        </p>
        <button
          type="button"
          onClick={onNewPageClick}
          className="mt-4 rounded-full bg-foreground px-6 py-2.5 text-sm font-semibold text-background shadow-md transition-opacity hover:opacity-90 cursor-pointer"
        >
          + Buat Halaman Pertama
        </button>
      </div>
    );
  }

  // MODE 1: COMPACT DESKTOP STRIP (When in Studio mode)
  if (!showOverview) {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-border/80 bg-card p-2.5 sm:px-4 sm:py-2.5 shadow-2xs">
        {/* Left: Active Page Chip + Quick Switch Chips for other pages */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium shrink-0">
            <Layers className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Profil:</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
            {pages.map((p) => {
              const isSelected = p.id === (activePage?.id || activeId);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onSelectPage(p.id)}
                  className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? "bg-foreground text-background font-bold shadow-2xs"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                  title={`Beralih ke profil ${p.name}`}
                >
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: p.accentColor || "#10b981" }}
                  />
                  <span className="max-w-[120px] sm:max-w-[150px] truncate">{p.name}</span>
                  <span
                    className={`text-[10px] font-mono ${
                      isSelected ? "text-background/80" : "text-muted-foreground"
                    }`}
                  >
                    /{p.slug}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Quick Overview Expand Toggle & Create Button */}
        <div className="flex items-center justify-end gap-2 shrink-0">
          {!isPro ? (
            <span className="hidden md:inline-flex items-center gap-1 rounded-full bg-muted/80 px-2.5 py-1 text-[10px] font-mono text-muted-foreground border border-border/80">
              {pages.length}/1 Halaman (Free)
            </span>
          ) : (
            <span className="hidden md:inline-flex items-center gap-1 rounded-full bg-amber-500/10 text-amber-500 px-2.5 py-1 text-[10px] font-bold border border-amber-500/20">
              <Crown className="h-2.5 w-2.5 fill-current" />
              PRO Unlimited
            </span>
          )}

          <button
            type="button"
            onClick={onNewPageClick}
            className="inline-flex items-center gap-1 rounded-xl bg-muted/70 hover:bg-muted px-2.5 py-1.5 text-xs font-semibold text-foreground transition-colors cursor-pointer"
            title="Buat halaman profil baru"
          >
            <Plus className="h-3.5 w-3.5 text-emerald-500" />
            <span className="hidden sm:inline">Halaman Baru</span>
          </button>

          <button
            type="button"
            onClick={() => onCarouselToggle?.(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border/80 bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors shadow-2xs cursor-pointer"
            title="Buka panel kelola semua halaman profil"
          >
            <LayoutGrid className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Semua Profil ({pages.length})</span>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>
        </div>
      </div>
    );
  }

  // MODE 2: FULL RICH OVERVIEW GRID (When on /dashboard/overview or toggled)
  return (
    <div className="rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-sm space-y-6 animate-in fade-in duration-200">
      {/* Overview Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-lg sm:text-xl font-bold text-foreground">
              Semua Halaman Profil
            </h2>
            <span className="rounded-full bg-foreground text-background px-2.5 py-0.5 text-xs font-bold font-mono">
              {pages.length}
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                isPro
                  ? "bg-amber-500/20 text-amber-500 border border-amber-500/30"
                  : "bg-muted text-muted-foreground border border-border"
              }`}
            >
              {isPro ? (
                <>
                  <Crown className="h-3 w-3 fill-current" />
                  PRO (Unlimited)
                </>
              ) : (
                `Paket Free: ${pages.length}/1 Halaman`
              )}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Kelola semua link profil link-in-bio bento Anda dari satu tempat
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={onNewPageClick}
            className="inline-flex items-center gap-1.5 rounded-full bg-foreground text-background px-4 py-2 text-xs font-bold shadow-xs hover:opacity-90 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Buat Halaman Baru</span>
          </button>

          <button
            type="button"
            onClick={() => onCarouselToggle?.(false)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3.5 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            title="Kembali ke editor Studio"
          >
            <X className="h-3.5 w-3.5" />
            <span>Tutup Overview</span>
          </button>
        </div>
      </div>

      {/* Responsive Grid of Pages (3 Columns on Desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {pages.map((p) => {
          const isSelected = p.id === activeId;

          return (
            <div
              key={p.id}
              onClick={() => handleSelectAndOpenStudio(p.id)}
              className={`group/card relative flex flex-col justify-between overflow-hidden rounded-3xl border bg-card transition-all duration-200 cursor-pointer ${
                isSelected
                  ? "border-foreground ring-2 ring-foreground/20 shadow-md"
                  : "border-border/80 hover:border-foreground/40 hover:shadow-md"
              }`}
            >
              {/* Top Banner Gradient & Avatar */}
              <div
                className="relative flex h-28 items-center justify-center bg-muted/60 transition-colors"
                style={{
                  background: `linear-gradient(135deg, ${p.accentColor || "#2563eb"}30, transparent)`,
                }}
              >
                {isSelected ? (
                  <span className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-foreground text-background px-2.5 py-1 text-[10px] font-bold shadow-xs">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Sedang Diedit
                  </span>
                ) : (
                  <span className="absolute top-3 right-3 rounded-full bg-background/80 px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground backdrop-blur-xs border border-border/60">
                    Buka Studio →
                  </span>
                )}

                <div
                  className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full font-display text-lg font-bold text-white shadow-md ring-4 ring-card"
                  style={{ backgroundColor: p.accentColor || "#18181b" }}
                >
                  {p.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                  ) : (
                    p.name.charAt(0).toUpperCase()
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-display font-bold text-foreground text-base line-clamp-1 group-hover/card:text-primary transition-colors">
                    {p.name}
                  </h3>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">
                    openlynk.id/{p.slug}
                  </p>
                  {p.bio && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-2 leading-relaxed">
                      {p.bio}
                    </p>
                  )}
                </div>

                {/* Actions Toolbar */}
                <div className="flex items-center justify-between border-t border-border/50 pt-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <a
                      href={`/${p.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      title="Buka halaman publik"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>Kunjungi</span>
                    </a>

                    <button
                      type="button"
                      onClick={(e) => copyPageLink(e, p)}
                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                      title="Salin tautan profil"
                    >
                      {copiedId === p.id ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-500" />
                          <span className="text-emerald-500 font-semibold">Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Salin</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <QrModal slug={p.slug} pageName={p.name} />

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeletePage(p.id, p.slug);
                      }}
                      className="inline-flex items-center rounded-lg p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                      title="Hapus Halaman"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Card Strip */}
              <div
                className={`py-2 px-4 text-center text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  isSelected
                    ? "bg-foreground text-background"
                    : "bg-muted/40 group-hover/card:bg-muted text-muted-foreground group-hover/card:text-foreground"
                }`}
              >
                <span>{isSelected ? "Sedang Dibuka di Studio" : "Klik untuk Edit di Studio"}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          );
        })}

        {/* Create New Page Card */}
        {!isPro && pages.length >= 1 ? (
          <button
            type="button"
            onClick={onUpgradePro || onNewPageClick}
            className="flex flex-col items-center justify-center min-h-[220px] rounded-3xl border-2 border-dashed border-amber-500/40 hover:border-amber-500 bg-amber-500/5 hover:bg-amber-500/10 p-6 text-center transition-all cursor-pointer group"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-500 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-black transition-all mb-3 shadow-2xs">
              <Crown className="h-6 w-6" />
            </div>
            <p className="font-display font-bold text-foreground text-sm flex items-center gap-1.5">
              <span>Buat Halaman Profil Baru</span>
              <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-500 border border-amber-500/30">
                PRO
              </span>
            </p>
            <p className="text-xs text-muted-foreground mt-1.5 max-w-[210px] leading-relaxed">
              Batas 1 halaman paket Free telah tercapai. Upgrade ke <strong>OpenLynk PRO</strong> untuk membuat halaman tanpa batas.
            </p>
          </button>
        ) : (
          <button
            type="button"
            onClick={onNewPageClick}
            className="flex flex-col items-center justify-center min-h-[220px] rounded-3xl border-2 border-dashed border-border/80 hover:border-foreground/50 bg-muted/10 hover:bg-muted/30 p-6 text-center transition-all cursor-pointer group"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground group-hover:scale-110 group-hover:bg-foreground group-hover:text-background transition-all mb-3 shadow-2xs">
              <Plus className="h-6 w-6" />
            </div>
            <p className="font-display font-bold text-foreground text-sm">
              Buat Halaman Profil Baru
            </p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
              Tambahkan link-in-bio baru untuk produk, bisnis, atau persona lain
            </p>
          </button>
        )}
      </div>
    </div>
  );
}
