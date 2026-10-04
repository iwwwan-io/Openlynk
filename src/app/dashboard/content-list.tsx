"use client";

import { useState } from "react";
import type { BentoItem, BentoSize } from "@/lib/types";
import {
  Heading,
  ShoppingBag,
  FileText,
  Video,
  MapPin,
  Clock,
  Package,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Trash2,
  Edit3,
  Image as ImageIcon,
  Calendar as CalendarIcon,
  Coffee,
} from "lucide-react";
import { GithubIcon, SpotifyIcon, renderSocialIcon } from "@/components/social-icons";
import { EditCardModal } from "./edit-card-modal";

function getItemTitle(b: BentoItem): string {
  if (b.type === "header") return b.title || "Grup Header";
  if (b.type === "link") return b.title;
  if (b.type === "product") return "Produk Toko";
  if (b.type === "note") return b.title || b.text.slice(0, 30);
  if (b.type === "video") return b.title || "Video YouTube";
  if (b.type === "music") return b.title || "Spotify Music";
  if (b.type === "map") return b.label || b.address;
  if (b.type === "countdown") return b.title || "Countdown Timer";
  if (b.type === "image") return b.caption || "Gambar Banner";
  if (b.type === "github") return `@${b.username} (GitHub)`;
  if (b.type === "calendar") return b.title || "Jadwal Pertemuan";
  if (b.type === "sawer") return b.title || "Traktir Kopi / Sawer";
  return "Item";
}

function ItemIcon({ b, className = "h-4 w-4" }: { b: BentoItem; className?: string }) {
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

export function ContentList({
  bento,
  onReorder,
  onMove,
  onResize,
  onRemove,
  onEdit,
}: {
  bento: BentoItem[];
  onReorder: (order: string[]) => Promise<void>;
  onMove: (bentoId: string, dir: number) => Promise<void>;
  onResize: (bentoId: string, size: BentoSize) => Promise<void>;
  onRemove: (bentoId: string) => Promise<void>;
  onEdit?: (bentoId: string, data: Record<string, unknown>) => Promise<void>;
}) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<BentoItem | null>(null);

  if (bento.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
        Belum ada kartu bento di halaman ini. Klik &quot;+ Tambah Kartu&quot; untuk mulai menambahkan link, header, atau media.
      </div>
    );
  }

  const linkCount = bento.filter((x) => x.type === "link").length;
  const prodCount = bento.filter((x) => x.type === "product").length;
  const mediaCount = bento.filter((x) => ["image", "video", "music"].includes(x.type)).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div>
          <h3 className="font-display text-base font-bold text-foreground">Daftar Semua Kartu ({bento.length})</h3>
          <p className="text-xs text-muted-foreground">Seret untuk mengubah urutan tampilan atau ubah ukuran tiap kartu</p>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          <span className="rounded-lg bg-muted px-2.5 py-1 text-[11px] font-mono font-medium text-muted-foreground">
            {linkCount} Link
          </span>
          <span className="rounded-lg bg-muted px-2.5 py-1 text-[11px] font-mono font-medium text-muted-foreground">
            {prodCount} Produk
          </span>
          <span className="rounded-lg bg-muted px-2.5 py-1 text-[11px] font-mono font-medium text-muted-foreground">
            {mediaCount} Media
          </span>
        </div>
      </div>

      <ul className="space-y-2">
        {bento.map((b, idx) => {
          const title = getItemTitle(b);
          const isDragging = dragId === b.id;

          return (
            <li
              key={b.id}
              draggable
              onDragStart={() => setDragId(b.id)}
              onDragEnd={() => setDragId(null)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (!dragId || dragId === b.id) return;
                const order = bento.map((x) => x.id);
                const from = order.indexOf(dragId);
                const to = order.indexOf(b.id);
                order.splice(from, 1);
                order.splice(to, 0, dragId);
                setDragId(null);
                onReorder(order);
              }}
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card p-3.5 shadow-2xs transition-all ${
                isDragging ? "opacity-30 border-dashed" : "hover:border-border"
              }`}
            >
              {/* Item Info */}
              <div className="flex items-center gap-3 overflow-hidden">
                <span className="cursor-grab text-muted-foreground/60 hover:text-foreground transition-colors" title="Seret untuk memindahkan">
                  <GripVertical className="h-4 w-4" />
                </span>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  <ItemIcon b={b} className="h-4 w-4 text-foreground" />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-display text-sm font-semibold text-foreground">
                      {title}
                    </span>
                    <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">
                      {b.type}
                    </span>
                  </div>
                  {b.type === "link" && (
                    <p className="truncate text-xs text-muted-foreground font-mono">{b.href}</p>
                  )}
                  {b.type === "header" && b.subtitle && (
                    <p className="truncate text-xs text-muted-foreground">{b.subtitle}</p>
                  )}
                  {b.type === "note" && (
                    <p className="truncate text-xs text-muted-foreground">{b.text.slice(0, 50)}</p>
                  )}
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2 self-end sm:self-center text-xs">
                {/* Size dropdown */}
                {b.type !== "product" && b.type !== "header" && (
                  <div className="relative flex items-center rounded-lg border border-border/70 bg-card shadow-xs">
                    <select
                      value={(("size" in b ? b.size : undefined) ?? "2x1")}
                      onChange={(e) => onResize(b.id, e.target.value as BentoSize)}
                      className="h-7 appearance-none rounded-lg bg-transparent pl-2.5 pr-6 font-mono text-[11px] font-semibold text-foreground outline-none cursor-pointer"
                      title="Ubah ukuran kartu"
                    >
                      <option value="1x1">1×1</option>
                      <option value="2x1">2×1</option>
                      <option value="2x2">2×2</option>
                      <option value="4x2">4×2</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-1.5 h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                )}

                {/* Move buttons */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => onMove(b.id, -1)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/60 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    title="Naikkan"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === bento.length - 1}
                    onClick={() => onMove(b.id, 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/60 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    title="Turunkan"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Edit button */}
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => setEditingItem(b)}
                    className="flex h-7 items-center gap-1 rounded-lg border border-border/80 px-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                    title="Edit isi kartu"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                )}

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Hapus kartu "${title}"?`)) {
                      onRemove(b.id);
                    }
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-950 dark:text-red-400 dark:hover:bg-red-950/50 transition-colors"
                  title="Hapus kartu"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

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
