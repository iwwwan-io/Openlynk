"use client";

import { useState, useRef, useEffect } from "react";
import type { Page } from "@/lib/types";
import {
  Plus,
  ExternalLink,
  Edit3,
  Trash2,
  Copy,
  Check,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { QrModal } from "../qr-modal";

interface PagesOverviewProps {
  pages: Page[];
  activeId: string;
  loading: boolean;
  initialShowCarousel?: boolean;
  onCarouselToggle?: (open: boolean) => void;
  onSelectPage: (id: string) => void;
  onNewPageClick: () => void;
  onDeletePage: (id: string, slug: string) => void;
}

export function PagesOverview({
  pages,
  activeId,
  loading,
  initialShowCarousel,
  onCarouselToggle,
  onSelectPage,
  onNewPageClick,
  onDeletePage,
}: PagesOverviewProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const activeIndex = pages.findIndex((p) => p.id === activeId);
  const currentIndex = activeIndex >= 0 ? activeIndex : 0;

  function copyPageLink(e: React.MouseEvent, page: Page) {
    e.stopPropagation();
    const url = `${window.location.origin}/${page.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(page.id);
    setTimeout(() => setCopiedId(null), 1800);
  }

  function scrollToPage(pageId: string) {
    onSelectPage(pageId);
    const cardEl = cardRefs.current[pageId];
    if (cardEl && scrollContainerRef.current) {
      cardEl.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }

  function handlePrev() {
    if (currentIndex > 0) {
      scrollToPage(pages[currentIndex - 1].id);
    }
  }

  function handleNext() {
    if (currentIndex < pages.length - 1) {
      scrollToPage(pages[currentIndex + 1].id);
    }
  }

  useEffect(() => {
    if (activeId && cardRefs.current[activeId]) {
      cardRefs.current[activeId]?.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [activeId]);

  return (
    <div className="space-y-3">
      {loading ? (
        <div className="flex items-center justify-center gap-6 overflow-hidden py-8">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-64 w-[320px] shrink-0 animate-pulse rounded-3xl border border-border bg-card/60"
            />
          ))}
        </div>
      ) : pages.length === 0 ? (
        <div className="flex flex-col items-center rounded-3xl border border-dashed border-border bg-card p-12 text-center">
          <Sparkles className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="font-display text-xl font-bold">Belum ada halaman profil</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Buat halaman link-in-bio bento pertamamu sekarang
          </p>
          <button
            type="button"
            onClick={onNewPageClick}
            className="mt-4 rounded-full bg-foreground px-6 py-2.5 text-sm font-semibold text-background shadow-md transition-opacity hover:opacity-90"
          >
            + Buat Halaman Pertama
          </button>
        </div>
      ) : (
        /* Carousel Track Container (Selalu Tampil) */
        <div className="relative group/carousel rounded-3xl border border-border/80 bg-muted/10 p-4 transition-all animate-in fade-in duration-200">
          {/* Navigation Arrow: Prev */}
          {pages.length > 1 && (
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="absolute left-0 sm:left-2 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-border/80 bg-background/90 text-foreground shadow-md backdrop-blur-md transition-all hover:bg-muted disabled:opacity-20 disabled:pointer-events-none active:scale-95"
              title="Halaman Sebelumnya"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}

          {/* Navigation Arrow: Next */}
          {pages.length > 1 && (
            <button
              type="button"
              onClick={handleNext}
              disabled={currentIndex === pages.length - 1}
              className="absolute right-0 sm:right-2 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-border/80 bg-background/90 text-foreground shadow-md backdrop-blur-md transition-all hover:bg-muted disabled:opacity-20 disabled:pointer-events-none active:scale-95"
              title="Halaman Berikutnya"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}

          {/* Scrollable Track (Sejajar & Slide Focus Carousel) */}
          <div
            ref={scrollContainerRef}
            className="flex items-center gap-4 sm:gap-8 overflow-x-auto snap-x snap-mandatory scrollbar-none py-6 px-6 sm:px-14 transition-all justify-start sm:justify-center"
          >
            {pages.map((p) => {
              const isSelected = activeId === p.id;
              return (
                <div
                  key={p.id}
                  ref={(el) => {
                    cardRefs.current[p.id] = el;
                  }}
                  onClick={() => scrollToPage(p.id)}
                  className={`w-[290px] sm:w-[350px] shrink-0 snap-center group/card relative cursor-pointer overflow-hidden rounded-3xl border bg-card transition-all duration-300 ${
                    isSelected
                      ? "scale-100 sm:scale-105 border-zinc-900 ring-2 ring-zinc-900 shadow-xl z-10 dark:border-white dark:ring-white"
                      : "scale-95 opacity-65 hover:opacity-95 hover:scale-[0.98] border-border/70 hover:border-border shadow-xs"
                  }`}
                >
                  {/* Banner & Avatar */}
                  <div
                    className="relative flex h-24 items-center justify-center bg-muted/60 transition-colors"
                    style={{
                      background: `linear-gradient(135deg, ${p.accentColor || "#2563eb"}25, transparent)`,
                    }}
                  >
                    {isSelected ? (
                      <span className="absolute top-2.5 right-2.5 flex items-center gap-1.5 rounded-full bg-zinc-900 px-3 py-1 text-[10px] font-bold text-white shadow-md dark:bg-white dark:text-zinc-900">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Sedang Diedit
                      </span>
                    ) : (
                      <span className="absolute top-2.5 right-2.5 rounded-full bg-background/80 px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground backdrop-blur-xs border border-border/60">
                        Klik untuk Edit
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

                  {/* Profile Info */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-display font-bold text-foreground text-sm line-clamp-1">
                        {p.name}
                      </h3>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">
                        openlynk.id/{p.slug}
                      </p>
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
                          title="Buka Halaman Publik"
                        >
                          <ExternalLink className="h-3 w-3" />
                          <span className="hidden sm:inline">Kunjungi</span>
                        </a>
                        <button
                          type="button"
                          onClick={(e) => copyPageLink(e, p)}
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                          title="Salin Link Profil"
                        >
                          {copiedId === p.id ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-500" />
                              <span className="text-emerald-500 font-semibold">Tersalin</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span className="hidden sm:inline">Salin</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            scrollToPage(p.id);
                            document
                              .getElementById("editor-section")
                              ?.scrollIntoView({ behavior: "smooth" });
                          }}
                          className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 font-semibold transition-colors ${
                            isSelected
                              ? "bg-foreground text-background"
                              : "text-foreground hover:bg-muted"
                          }`}
                          title="Buka Editor Studio"
                        >
                          <Edit3 className="h-3 w-3" />
                          <span>Studio</span>
                        </button>

                        <QrModal slug={p.slug} pageName={p.name} />

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeletePage(p.id, p.slug);
                          }}
                          className="inline-flex items-center rounded-lg p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                          title="Hapus Halaman"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Active Strip */}
                  {isSelected ? (
                    <div className="bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 py-1.5 px-3 text-center text-[10px] font-semibold flex items-center justify-center gap-1.5 tracking-wide">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      <span>Halaman Aktif Sedang Diedit di Bawah ↓</span>
                    </div>
                  ) : (
                    <div className="bg-muted/40 group-hover/card:bg-muted py-1.5 px-3 text-center text-[10px] font-medium text-muted-foreground transition-colors">
                      <span>Klik untuk jadikan halaman aktif</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Carousel Pagination & Indicator */}
          {pages.length > 1 && (
            <div className="mt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              {/* Slide Dots */}
              <div className="flex items-center gap-2">
                {pages.map((p) => {
                  const isSelected = activeId === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => scrollToPage(p.id)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        isSelected
                          ? "w-7 bg-zinc-900 dark:bg-white"
                          : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60"
                      }`}
                      title={`Pilih halaman ${p.name}`}
                    />
                  );
                })}
              </div>

              {/* Active Page Info Pill */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium">
                  Halaman {currentIndex + 1} dari {pages.length}:
                </span>
                <span className="font-semibold text-foreground font-mono">
                  /{pages[currentIndex]?.slug}
                </span>
                <span className="text-[11px] rounded-full bg-emerald-500/10 px-2 py-0.5 font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Aktif di Studio ↓
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
