"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Responsive, useContainerWidth } from "react-grid-layout";
import type { Layout } from "react-grid-layout";
import { layoutOf } from "@/lib/grid";
import type { BentoItem, BentoSize, Product } from "@/lib/types";
import {
  Heading,
  ShoppingBag,
  FileText,
  Video,
  MapPin,
  Clock,
  Package,
  Plus,
  Monitor,
  Smartphone,
  GripVertical,
  Sparkles,
  Edit3,
  ExternalLink,
  Image as ImageIcon,
  Calendar as CalendarIcon,
  Coffee,
  Zap,
  ArrowRight,
} from "lucide-react";
import {
  renderSocialIcon,
  GithubIcon,
  SpotifyIcon,
} from "@/components/social-icons";
import { EditCardModal } from "./edit-card-modal";
import "react-grid-layout/css/styles.css";

function bentoLabel(b: BentoItem): string {
  if (b.type === "header") return b.title || "Grup Header";
  if (b.type === "link") return b.title;
  if (b.type === "product") return "Produk";
  if (b.type === "note") return b.title || b.text.slice(0, 30);
  if (b.type === "video") return b.title || "Video";
  if (b.type === "music") return b.title || "Spotify";
  if (b.type === "map") return b.label || b.address;
  if (b.type === "countdown") return b.title || "Countdown";
  if (b.type === "image") return b.caption || "Gambar";
  if (b.type === "github") return `@${b.username}` || "GitHub";
  if (b.type === "calendar") return b.title || "Jadwal";
  if (b.type === "sawer") return b.title || "Sawer / Kopi";
  return "Item";
}

function BentoIconComponent({ b, className = "h-3.5 w-3.5" }: { b: BentoItem; className?: string }) {
  if (b.type === "header") return <Heading className={className} />;
  if (b.type === "link") {
    return renderSocialIcon(b.href || "", className);
  }
  if (b.type === "product") return <ShoppingBag className={className} />;
  if (b.type === "note") return <FileText className={className} />;
  if (b.type === "video") return <Video className={className} />;
  if (b.type === "music") return <SpotifyIcon className={className} />;
  if (b.type === "map") return <MapPin className={className} />;
  if (b.type === "countdown") return <Clock className={className} />;
  if (b.type === "image") return <ImageIcon className={className} />;
  if (b.type === "github") return <GithubIcon className={className} />;
  if (b.type === "calendar") return <CalendarIcon className={className} />;
  if (b.type === "sawer") return <Coffee className={className} />;
  return <Package className={className} />;
}

function bentoBadgeColor(type: BentoItem["type"]): string {
  if (type === "header") return "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300";
  if (type === "link") return "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300";
  if (type === "product") return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300";
  if (type === "note") return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300";
  if (type === "video") return "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300";
  if (type === "music") return "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300";
  if (type === "map") return "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300";
  if (type === "countdown") return "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300";
  if (type === "image") return "bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300";
  if (type === "github") return "bg-zinc-800 text-white dark:bg-zinc-700 dark:text-zinc-100";
  if (type === "calendar") return "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300";
  if (type === "sawer") return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300";
  return "bg-zinc-200 text-zinc-700";
}

function BentoCardInner({
  b,
  product,
}: {
  b: BentoItem;
  product?: Product;
}) {
  if (b.type === "header") {
    return (
      <div className="flex h-full w-full flex-col justify-center px-4 py-2">
        <h3 className="font-display text-base sm:text-lg font-bold text-foreground tracking-tight">
          {b.title || "Grup Header"}
        </h3>
        {b.subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{b.subtitle}</p>
        )}
      </div>
    );
  }

  if (b.type === "image") {
    return (
      <div className="relative h-full w-full overflow-hidden rounded-xl bg-muted/40">
        {b.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={b.url} alt={b.caption || "Gambar"} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ImageIcon className="h-8 w-8 opacity-40" />
          </div>
        )}
        {b.caption && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pt-6 text-xs text-white line-clamp-1 font-medium">
            {b.caption}
          </div>
        )}
      </div>
    );
  }

  if (b.type === "product") {
    const isDigital = product?.kind === "digital";
    const soldOut = product?.kind === "fisik" && product?.stock !== null && product?.stock <= 0;

    return (
      <div className="group/prod flex h-full w-full flex-col justify-between overflow-hidden p-3 sm:p-4">
        {/* Cover Preview or Icon Header */}
        {product?.imageUrl ? (
          <div className="relative h-28 sm:h-36 w-full overflow-hidden rounded-xl bg-muted border border-border/50 shrink-0 mb-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover/prod:scale-105"
            />
          </div>
        ) : (
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
              {isDigital ? "Digital" : "Fisik"}
            </span>
          </div>
        )}

        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
              {isDigital ? "Digital" : "Fisik"}
            </span>
            <span className="font-mono text-xs font-bold text-foreground">
              {product ? `Rp ${product.priceIdr.toLocaleString("id-ID")}` : "Rp 0"}
            </span>
          </div>

          <p className="font-display text-sm font-bold text-foreground truncate group-hover/prod:text-primary transition-colors">
            {product?.name || "Produk Toko"}
          </p>
          {product?.description && (
            <p className="text-[11px] text-muted-foreground line-clamp-1">
              {product.description}
            </p>
          )}
        </div>

        {/* Mini CTA bar in grid editor */}
        <div className="mt-2 pt-2 border-t border-border/40 flex items-center justify-between text-[11px]">
          <span className="text-muted-foreground font-mono text-[10px] sm:text-xs">
            {soldOut ? "Stok Habis" : product?.stock !== null ? `Stok: ${product?.stock}` : "∞ Unlimited"}
          </span>
          <span className="font-bold text-primary flex items-center gap-0.5 text-xs">
            <span>Beli</span>
            <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    );
  }

  if (b.type === "note") {
    return (
      <div className="flex h-full w-full flex-col justify-between p-4">
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
          <FileText className="h-4 w-4" />
          <span className="font-display text-xs font-bold uppercase tracking-wider">
            {b.title || "Catatan"}
          </span>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
          {b.text || "Tulis catatan singkat di sini..."}
        </p>
      </div>
    );
  }

  if (b.type === "video") {
    return (
      <div className="relative flex h-full w-full flex-col justify-between overflow-hidden rounded-xl bg-zinc-900 p-4 text-white">
        <div className="flex items-center gap-1.5 text-xs text-red-400">
          <Video className="h-4 w-4" />
          <span className="font-semibold text-[10px] uppercase">Video Embed</span>
        </div>
        <div className="flex items-center justify-center my-auto">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm shadow-md">
            <div className="ml-0.5 h-0 w-0 border-y-[5px] border-y-transparent border-l-[9px] border-l-white" />
          </div>
        </div>
        <p className="font-display text-xs font-bold truncate">{b.title || "Video Player"}</p>
      </div>
    );
  }

  if (b.type === "music") {
    return (
      <div className="flex h-full w-full flex-col justify-between p-4">
        <div className="flex items-center justify-between">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-500/10 text-green-600 dark:text-green-400">
            <SpotifyIcon className="h-4 w-4" />
          </div>
          <span className="font-mono text-[10px] text-green-600 dark:text-green-400 font-semibold">
            Audio
          </span>
        </div>
        <div>
          <p className="font-display text-sm font-bold text-foreground line-clamp-1">
            {b.title || "Spotify Track / Album"}
          </p>
          <p className="text-[10px] text-muted-foreground truncate font-mono mt-0.5">
            {b.url || "open.spotify.com"}
          </p>
        </div>
      </div>
    );
  }

  if (b.type === "map") {
    return (
      <div className="flex h-full w-full flex-col justify-between p-4">
        <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400">
          <MapPin className="h-4 w-4" />
          <span className="font-display text-xs font-bold uppercase tracking-wider">
            {b.label || "Lokasi"}
          </span>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {b.address || "Alamat lokasi..."}
        </p>
      </div>
    );
  }

  if (b.type === "countdown") {
    return (
      <div className="flex h-full w-full flex-col justify-between p-4">
        <div className="flex items-center justify-between">
          <span className="text-2xl">{b.emoji || "⏳"}</span>
          <span className="flex items-center gap-1 font-mono text-[10px] text-orange-600 dark:text-orange-400 font-bold">
            <Clock className="h-3 w-3" /> Hitung Mundur
          </span>
        </div>
        <div>
          <p className="font-display text-sm font-bold text-foreground line-clamp-1">
            {b.title || "Countdown Event"}
          </p>
          <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
            {b.targetDate ? new Date(b.targetDate).toLocaleDateString("id-ID", { dateStyle: "medium" }) : "Atur tanggal"}
          </p>
        </div>
      </div>
    );
  }

  if (b.type === "github") {
    return (
      <div className="flex h-full w-full flex-col justify-between p-4">
        <div className="flex items-center justify-between">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-zinc-800">
            <GithubIcon className="h-4 w-4" />
          </div>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-mono font-semibold text-muted-foreground">
            GitHub
          </span>
        </div>
        <div>
          <p className="font-display text-sm font-bold text-foreground truncate">
            @{b.username || "username"}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Profil & Repositori</p>
        </div>
      </div>
    );
  }

  if (b.type === "calendar") {
    return (
      <div className="flex h-full w-full flex-col justify-between p-4">
        <div className="flex items-center justify-between">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
            <CalendarIcon className="h-4 w-4" />
          </div>
          <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-[10px] font-bold text-sky-600 dark:text-sky-400">
            Booking
          </span>
        </div>
        <div>
          <p className="font-display text-sm font-bold text-foreground line-clamp-1">
            {b.title || "Jadwal Pertemuan"}
          </p>
          <p className="text-[10px] text-muted-foreground truncate mt-0.5">
            {b.description || "Pesan sesi konsultasi"}
          </p>
        </div>
      </div>
    );
  }

  if (b.type === "sawer") {
    return (
      <div className="flex h-full w-full flex-col justify-between p-4 bg-gradient-to-br from-amber-500/10 via-card to-card">
        <div className="flex items-center justify-between">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <Coffee className="h-4 w-4" />
          </div>
          <span className="rounded-full bg-amber-500/15 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-700 dark:text-amber-300">
            Rp {(b.unitPrice ?? 15000).toLocaleString("id-ID")}
          </span>
        </div>
        <div>
          <p className="font-display text-sm font-bold text-foreground line-clamp-1">
            {b.title || "Traktir Kopi ☕"}
          </p>
          <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
            {b.message || "Beri saweran atau traktir kopi"}
          </p>
        </div>
      </div>
    );
  }

  // Fallback: Link Card
  return (
    <div className="flex h-full w-full flex-col justify-between p-4">
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-foreground">
          <BentoIconComponent b={b} className="h-4 w-4" />
        </div>
        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/60" />
      </div>
      <div>
        <p className="font-display text-sm font-bold text-foreground line-clamp-1">
          {b.title || "Tautan"}
        </p>
        {b.href && (
          <p className="text-[10px] text-muted-foreground truncate font-mono mt-0.5">
            {b.href}
          </p>
        )}
      </div>
    </div>
  );
}

export function GridEditor({
  pageId,
  bento,
  products,
  onAddClick,
  onResize,
  onRemove,
  onEdit,
}: {
  pageId: string;
  bento: BentoItem[];
  products?: Product[];
  onAddClick?: () => void;
  onResize?: (bentoId: string, size: BentoSize) => Promise<void>;
  onRemove?: (bentoId: string) => Promise<void>;
  onEdit?: (bentoId: string, data: Record<string, unknown>) => Promise<void>;
}) {
  const [saved, setSaved] = useState(true);
  const [editingItem, setEditingItem] = useState<BentoItem | null>(null);
  const [deviceView, setDeviceView] = useState<"desktop" | "mobile">("desktop");
  const [isPhysicalMobile, setIsPhysicalMobile] = useState(false);
  const [hasUserToggled, setHasUserToggled] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDraggingRef = useRef(false);
  const dragTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { width, containerRef, mounted } = useContainerWidth();

  function handleDragStart() {
    if (dragTimeoutRef.current) clearTimeout(dragTimeoutRef.current);
    isDraggingRef.current = true;
  }

  function handleDragStop() {
    if (dragTimeoutRef.current) clearTimeout(dragTimeoutRef.current);
    dragTimeoutRef.current = setTimeout(() => {
      isDraggingRef.current = false;
    }, 150);
  }

  function handleCardClick(item: BentoItem) {
    if (isDraggingRef.current) return;
    setEditingItem(item);
  }

  // Auto-deteksi ukuran layar fisik pengguna (ponsel vs desktop)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(max-width: 767px)");

    function handleMediaChange(e: MediaQueryList | MediaQueryListEvent) {
      const isMobile = e.matches;
      setIsPhysicalMobile(isMobile);
      if (isMobile) {
        setDeviceView("mobile");
      } else if (!hasUserToggled) {
        setDeviceView("desktop");
      }
    }

    handleMediaChange(media);
    media.addEventListener("change", handleMediaChange);
    return () => media.removeEventListener("change", handleMediaChange);
  }, [hasUserToggled]);

  function switchDeviceView(mode: "desktop" | "mobile") {
    setDeviceView(mode);
    setHasUserToggled(true);
  }

  const layouts = useMemo(
    () => ({ lg: layoutOf(bento, 4), sm: layoutOf(bento, 2) }),
    [bento]
  );

  function authHeaders(): HeadersInit {
    const t =
      typeof window === "undefined" ? "" : (localStorage.getItem("openlynk_admin") ?? "");
    return t
      ? { "Content-Type": "application/json", Authorization: `Bearer ${t}` }
      : { "Content-Type": "application/json" };
  }

  function onLayoutChange(_cur: Layout, all: Partial<Record<string, Layout>>) {
    const lg = all.lg;
    if (!lg) return;
    setSaved(false);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      fetch(`/api/pages/${pageId}/bento`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          action: "layout",
          layout: lg.map((l) => ({ id: l.i, x: l.x, y: l.y })),
        }),
      })
        .then(() => setSaved(true))
        .catch(() => setSaved(true));
    }, 800);
  }

  const effectiveWidth = deviceView === "mobile" ? Math.min(width, 420) : width;

  return (
    <div className="space-y-3">
      {/* Studio Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 rounded-2xl border border-border/80 bg-card p-3 sm:p-4 shadow-2xs">
        {/* Left Section: Primary Action CTA */}
        <div className="flex items-center justify-between sm:justify-start gap-3">
          {onAddClick && (
            <button
              type="button"
              onClick={onAddClick}
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all hover:bg-zinc-800 active:scale-95 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Kartu</span>
            </button>
          )}

          {/* Mobile Auto-Save Indicator */}
          <div className="sm:hidden flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                saved ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
              }`}
            />
            <span>{saved ? "Tersimpan" : "Menyimpan..."}</span>
          </div>
        </div>

        {/* Right Section: Viewport Mode Switcher & Desktop Auto-Save Indicator */}
        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
          <div className="flex items-center rounded-xl border border-border/80 bg-muted/60 p-1 text-xs shadow-2xs">
            <button
              type="button"
              onClick={() => switchDeviceView("desktop")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-all ${
                deviceView === "desktop"
                  ? "bg-card text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title={
                isPhysicalMobile
                  ? "Layar fisik mobile (mode 4 kolom mungkin overflow)"
                  : "Pratinjau Desktop (4 Kolom)"
              }
            >
              <Monitor className="h-3.5 w-3.5" />
              <span>Desktop</span>
              <span className="hidden md:inline text-[10px] text-muted-foreground font-normal">
                (4 Kolom)
              </span>
            </button>
            <button
              type="button"
              onClick={() => switchDeviceView("mobile")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-all ${
                deviceView === "mobile"
                  ? "bg-card text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Pratinjau Mobile (2 Kolom)"
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span>Mobile</span>
              <span className="hidden md:inline text-[10px] text-muted-foreground font-normal">
                (2 Kolom)
              </span>
              {isPhysicalMobile && !hasUserToggled && (
                <span className="ml-1 rounded-full bg-emerald-500/20 px-1.5 py-0.5 font-mono text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                  Auto
                </span>
              )}
            </button>
          </div>

          {/* Desktop Auto-Save Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground pl-1">
            <span
              className={`h-2 w-2 rounded-full ${
                saved ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
              }`}
            />
            <span className="font-mono text-[11px]">
              {saved ? "Otomatis tersimpan" : "Menyimpan posisi..."}
            </span>
          </div>
        </div>
      </div>

      {/* Grid Canvas */}
      <div
        ref={containerRef}
        className={`relative mx-auto rounded-3xl border border-border/70 bg-muted/10 p-3 sm:p-5 transition-all duration-300 min-h-[420px] ${
          deviceView === "mobile" ? "max-w-md shadow-xl" : "w-full"
        }`}
        style={{
          backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      >
        {bento.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Sparkles className="h-8 w-8 mb-2 text-muted-foreground/60" />
            <p className="font-display font-semibold text-foreground">Kanvas Studio Kosong</p>
            <p className="text-xs text-muted-foreground mt-1 mb-4">Tambahkan kartu bento pertama untuk profil ini</p>
            {onAddClick && (
              <button
                type="button"
                onClick={onAddClick}
                className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-5 py-2 text-xs font-semibold text-white dark:bg-white dark:text-zinc-900"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Tambah Kartu Sekarang</span>
              </button>
            )}
          </div>
        ) : (
          mounted && (
            <Responsive
              className="layout"
              layouts={layouts}
              breakpoints={{ lg: 700, sm: 0 }}
              cols={deviceView === "mobile" ? { lg: 2, sm: 2 } : { lg: 4, sm: 2 }}
              width={effectiveWidth}
              rowHeight={150}
              margin={[16, 16]}
              dragConfig={{
                handle: deviceView === "mobile" ? ".drag-handle" : undefined,
              }}
              onDragStart={handleDragStart}
              onDragStop={handleDragStop}
              onLayoutChange={onLayoutChange}
            >
              {bento.map((b) => {
                const label = bentoLabel(b);
                const isHeader = b.type === "header";
                const sizeLabel =
                  "size" in b && b.size
                    ? b.size
                    : isHeader
                    ? "4x1"
                    : b.type === "video" || b.type === "sawer"
                    ? "2x2"
                    : undefined;

                return (
                  <div
                    key={b.id}
                    onClick={() => handleCardClick(b)}
                    className={`group relative overflow-hidden rounded-2xl border transition-all duration-200 select-none shadow-xs hover:shadow-md cursor-pointer ${
                      isHeader
                        ? "border-purple-200/80 bg-purple-50/40 hover:border-purple-400 dark:border-purple-900/60 dark:bg-purple-950/20"
                        : "border-border/80 bg-card hover:border-foreground/40 hover:ring-2 hover:ring-foreground/10"
                    }`}
                    title={`Klik untuk edit "${label}", atur ukuran, atau hapus`}
                  >
                    {/* Top-Left Drag Grip, Type & Size Indicator */}
                    <div className="pointer-events-none absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                      <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
                      <span
                        className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${bentoBadgeColor(
                          b.type
                        )}`}
                      >
                        {b.type}
                      </span>
                      {sizeLabel && (
                        <span className="rounded-md bg-muted/80 px-1.5 py-0.5 text-[9px] font-mono font-medium text-muted-foreground">
                          {sizeLabel}
                        </span>
                      )}
                    </div>

                    {/* Top-Right Hover Edit Hint (Non-blocking visual affordance) */}
                    <div className="pointer-events-none absolute top-2.5 right-2.5 z-20 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="inline-flex items-center gap-1 rounded-lg bg-background/90 border border-border/60 px-2 py-0.5 text-[10px] font-medium text-foreground shadow-xs">
                        <Edit3 className="h-3 w-3 text-muted-foreground" />
                        <span>Edit</span>
                      </span>
                    </div>

                    {/* Mobile Drag Handle */}
                    {deviceView === "mobile" && (
                      <div className="pointer-events-auto absolute bottom-2 left-1/2 -translate-x-1/2 z-20">
                        <span className="drag-handle flex items-center gap-1 rounded-full bg-background/90 border border-border/70 px-2.5 py-0.5 text-[9px] font-medium text-muted-foreground shadow-xs cursor-grab active:cursor-grabbing">
                          <GripVertical className="h-2.5 w-2.5" /> Geser
                        </span>
                      </div>
                    )}

                    {/* Rich Card Content Preview */}
                    <div className="h-full w-full pt-6 pb-2">
                      <BentoCardInner
                        b={b}
                        product={b.type === "product" ? products?.find((p) => p.id === b.productId) : undefined}
                      />
                    </div>
                  </div>
                );
              })}
            </Responsive>
          )
        )}
      </div>

      {/* Easy Edit Card Modal */}
      <EditCardModal
        item={editingItem}
        isOpen={editingItem !== null}
        onClose={() => setEditingItem(null)}
        onSave={async (id, data) => {
          if (onEdit) await onEdit(id, data);
        }}
        onRemove={onRemove}
      />
    </div>
  );
}
