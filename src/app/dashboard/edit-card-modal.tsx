"use client";

import { useState } from "react";
import type { BentoItem, BentoSize } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/confirm";
import {
  Link2,
  Heading,
  ShoppingBag,
  FileText,
  Video,
  MapPin,
  Clock,
  Package,
  Trash2,
  Check,
  Loader2,
  Image as ImageIcon,
  Calendar as CalendarIcon,
  Coffee,
} from "lucide-react";
import {
  InstagramIcon,
  YoutubeIcon,
  GithubIcon,
  TwitterIcon,
  DiscordIcon,
  TikTokIcon,
  WhatsappIcon,
  TelegramIcon,
  LinkedinIcon,
  SpotifyIcon,
} from "@/components/social-icons";

function CardIcon({ type, className = "h-4 w-4" }: { type: BentoItem["type"]; className?: string }) {
  if (type === "header") return <Heading className={className} />;
  if (type === "link") return <Link2 className={className} />;
  if (type === "product") return <ShoppingBag className={className} />;
  if (type === "note") return <FileText className={className} />;
  if (type === "video") return <Video className={className} />;
  if (type === "music") return <SpotifyIcon className={className} />;
  if (type === "map") return <MapPin className={className} />;
  if (type === "countdown") return <Clock className={className} />;
  if (type === "image") return <ImageIcon className={className} />;
  if (type === "github") return <GithubIcon className={className} />;
  if (type === "calendar") return <CalendarIcon className={className} />;
  if (type === "sawer") return <Coffee className={className} />;
  return <Package className={className} />;
}

export function EditCardModal({
  item,
  isOpen,
  onClose,
  onSave,
  onRemove,
}: {
  item: BentoItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (bentoId: string, data: Record<string, unknown>) => Promise<void>;
  onRemove?: (bentoId: string) => Promise<void>;
}) {
  if (!isOpen || !item) return null;
  return (
    <EditCardModalForm
      key={item.id}
      item={item}
      onClose={onClose}
      onSave={onSave}
      onRemove={onRemove}
    />
  );
}

function EditCardModalForm({
  item,
  onClose,
  onSave,
  onRemove,
}: {
  item: BentoItem;
  onClose: () => void;
  onSave: (bentoId: string, data: Record<string, unknown>) => Promise<void>;
  onRemove?: (bentoId: string) => Promise<void>;
}) {
  const [title, setTitle] = useState(() => ("title" in item && item.title ? item.title : ""));
  const [subtitle, setSubtitle] = useState(() => (item.type === "header" ? item.subtitle || "" : ""));
  const [href, setHref] = useState(() => ("href" in item && item.href ? item.href : ""));
  const [text, setText] = useState(() => (item.type === "note" ? item.text || "" : ""));
  const [url, setUrl] = useState(() => ("url" in item && item.url ? item.url : ""));
  const [label, setLabel] = useState(() => (item.type === "map" ? item.label || "" : ""));
  const [address, setAddress] = useState(() => (item.type === "map" ? item.address || "" : ""));
  const [caption, setCaption] = useState(() => (item.type === "image" ? item.caption || "" : ""));
  const [username, setUsername] = useState(() => (item.type === "github" ? item.username || "" : ""));
  const [description, setDescription] = useState(() => (item.type === "calendar" ? item.description || "" : ""));
  const [sawerMessage, setSawerMessage] = useState(() => (item.type === "sawer" ? item.message || "" : ""));
  const [unitName, setUnitName] = useState(() => (item.type === "sawer" ? item.unitName || "Kopi" : "Kopi"));
  const [unitPrice, setUnitPrice] = useState<number | "">(() => (item.type === "sawer" ? (item.unitPrice ?? 15000) : 15000));
  const [targetAmount, setTargetAmount] = useState<number | "">(() => (item.type === "sawer" ? (item.targetAmount ?? "") : ""));
  const [targetDate, setTargetDate] = useState(() => {
    if (item.type === "countdown" && item.targetDate) {
      try {
        const d = new Date(item.targetDate);
        const pad = (n: number) => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      } catch {
        return "";
      }
    }
    return "";
  });
  const [emoji, setEmoji] = useState(() => (item.type === "countdown" ? item.emoji || "⏳" : "⏳"));
  const [size, setSize] = useState<BentoSize>(() => {
    if ("size" in item && item.size) return item.size;
    if (item.type === "header") return "4x1";
    if (item.type === "video" || item.type === "sawer") return "2x2";
    return "2x1";
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [removing, setRemoving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!item) return;
    setError("");
    setLoading(true);

    try {
      const payload: Record<string, unknown> = { size };

      if (item.type === "header") {
        if (!title.trim()) throw new Error("Judul header wajib diisi");
        payload.title = title.trim();
        payload.subtitle = subtitle.trim();
      } else if (item.type === "link") {
        if (!title.trim()) throw new Error("Judul link wajib diisi");
        if (!href.trim() || !/^https?:\/\//.test(href.trim())) {
          throw new Error("URL link wajib diawali https:// atau http://");
        }
        payload.title = title.trim();
        payload.href = href.trim();
      } else if (item.type === "note") {
        if (!text.trim()) throw new Error("Isi teks catatan tidak boleh kosong");
        payload.title = title.trim();
        payload.text = text.trim();
      } else if (item.type === "video") {
        if (!url.trim() || !/^https?:\/\//.test(url.trim())) {
          throw new Error("URL YouTube wajib diawali https://");
        }
        payload.title = title.trim();
        payload.url = url.trim();
      } else if (item.type === "music") {
        if (!url.trim() || !/^https?:\/\//.test(url.trim())) {
          throw new Error("URL Spotify wajib diawali https://");
        }
        payload.title = title.trim();
        payload.url = url.trim();
      } else if (item.type === "map") {
        if (!address.trim()) throw new Error("Alamat lokasi tidak boleh kosong");
        payload.label = label.trim() || address.trim();
        payload.address = address.trim();
      } else if (item.type === "countdown") {
        if (!title.trim()) throw new Error("Judul countdown wajib diisi");
        if (!targetDate) throw new Error("Tanggal target wajib dipilih");
        payload.title = title.trim();
        payload.targetDate = new Date(targetDate).toISOString();
        payload.emoji = emoji || "⏳";
      } else if (item.type === "image") {
        if (!url.trim()) throw new Error("URL gambar wajib diisi");
        payload.url = url.trim();
        payload.caption = caption.trim() || undefined;
        payload.href = href.trim() || undefined;
      } else if (item.type === "github") {
        if (!username.trim()) throw new Error("Username GitHub wajib diisi");
        payload.username = username.trim().replace(/^@/, "");
      } else if (item.type === "calendar") {
        if (!title.trim()) throw new Error("Judul sesi wajib diisi");
        if (!url.trim() || !/^https?:\/\//.test(url.trim())) {
          throw new Error("URL Cal.com/Calendly wajib diawali https://");
        }
        payload.title = title.trim();
        payload.url = url.trim();
        payload.description = description.trim() || undefined;
      } else if (item.type === "sawer") {
        if (!title.trim()) throw new Error("Judul kartu sawer wajib diisi");
        payload.title = title.trim();
        payload.message = sawerMessage.trim() || undefined;
        payload.unitName = unitName.trim() || "Kopi";
        payload.unitPrice = unitPrice ? Number(unitPrice) : 15000;
        payload.targetAmount = targetAmount ? Number(targetAmount) : undefined;
      }

      await onSave(item.id, payload);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan perubahan");
    } finally {
      setLoading(false);
    }
  }

  const isHeader = item.type === "header";
  const isProduct = item.type === "product";

  // Dialog shadcn menangani Escape, overlay-klik, dan scroll-lock secara native.
  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md rounded-3xl border-border bg-card p-0 shadow-2xl sm:rounded-3xl max-h-[92vh] sm:max-h-[88vh] overflow-hidden flex flex-col">
        <DialogHeader className="border-b border-border/60 px-4 sm:px-6 py-3.5 sm:py-4 text-left shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-2xl bg-muted text-foreground">
              <CardIcon type={item.type} className="h-4 w-4 sm:h-5 sm:w-5" />
            </span>
            <div className="min-w-0">
              <DialogTitle className="font-display text-sm sm:text-base font-bold text-foreground truncate">
                Edit Kartu Bento
              </DialogTitle>
              <DialogDescription className="text-[11px] text-muted-foreground uppercase font-semibold tracking-wider truncate">
                Tipe: {item.type}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4 overscroll-contain">
            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

          {/* EDIT FORM: HEADER */}
          {item.type === "header" && (
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">
                  Judul Grup / Header <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: 🌐 Media Sosial & Komunitas"
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm outline-none focus:border-foreground transition"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">
                  Sub-judul / Keterangan (Opsional)
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Contoh: Ikuti update harian dan portofolio kami"
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm outline-none focus:border-foreground transition"
                />
              </div>
            </div>
          )}

          {/* EDIT FORM: LINK */}
          {item.type === "link" && (
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">
                  Judul / Label Link <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Instagram"
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm outline-none focus:border-foreground transition"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">
                  URL Tujuan <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={href}
                  onChange={(e) => setHref(e.target.value)}
                  placeholder="https://instagram.com/username"
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm font-mono outline-none focus:border-foreground transition"
                />
              </div>

              {/* Quick Preset Buttons */}
              <div>
                <p className="mb-1.5 text-[11px] font-semibold text-muted-foreground">
                  Ganti ke Format Preset Cepat:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: "Instagram", icon: InstagramIcon, url: "https://instagram.com/" },
                    { label: "YouTube", icon: YoutubeIcon, url: "https://youtube.com/@" },
                    { label: "GitHub", icon: GithubIcon, url: "https://github.com/" },
                    { label: "Discord", icon: DiscordIcon, url: "https://discord.gg/" },
                    { label: "X / Twitter", icon: TwitterIcon, url: "https://x.com/" },
                    { label: "TikTok", icon: TikTokIcon, url: "https://tiktok.com/@" },
                    { label: "WhatsApp", icon: WhatsappIcon, url: "https://wa.me/628" },
                    { label: "Telegram", icon: TelegramIcon, url: "https://t.me/" },
                    { label: "LinkedIn", icon: LinkedinIcon, url: "https://linkedin.com/in/" },
                    { label: "Spotify", icon: SpotifyIcon, url: "https://open.spotify.com/artist/" },
                  ].map((preset) => {
                    const PresetIcon = preset.icon;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          setTitle(preset.label);
                          if (!href || href === "https://") setHref(preset.url);
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-border bg-muted/40 px-2 py-1 text-[11px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      >
                        <PresetIcon className="h-3 w-3" />
                        <span>{preset.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* EDIT FORM: NOTE */}
          {item.type === "note" && (
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">
                  Judul Catatan (Opsional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Jam Operasional & Kontak"
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm outline-none focus:border-foreground transition"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">
                  Isi Catatan <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Tulis pengumuman, jam buka, atau memo di sini..."
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm outline-none focus:border-foreground transition resize-none leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* EDIT FORM: VIDEO */}
          {item.type === "video" && (
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">
                  Judul Video (Opsional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Tutorial Terbaru"
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm outline-none focus:border-foreground transition"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">
                  URL YouTube <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm font-mono outline-none focus:border-foreground transition"
                />
              </div>
            </div>
          )}

          {/* EDIT FORM: MUSIC */}
          {item.type === "music" && (
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">
                  Judul Playlist / Lagu (Opsional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Lofi Coding Beats"
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm outline-none focus:border-foreground transition"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">
                  URL Spotify <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://open.spotify.com/playlist/..."
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm font-mono outline-none focus:border-foreground transition"
                />
              </div>
            </div>
          )}

          {/* EDIT FORM: MAP */}
          {item.type === "map" && (
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">
                  Label Tempat
                </label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Contoh: Studio & Kafe"
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm outline-none focus:border-foreground transition"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">
                  Alamat / Lokasi Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Contoh: Senopati No. 45, Kebayoran Baru, Jakarta Selatan"
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm outline-none focus:border-foreground transition"
                />
              </div>
            </div>
          )}

          {/* EDIT FORM: COUNTDOWN */}
          {item.type === "countdown" && (
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">
                  Judul Event / Promo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Flash Sale Ramadhan 50%"
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm outline-none focus:border-foreground transition"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="mb-1 block text-xs font-semibold text-foreground">
                    Target Waktu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-foreground transition"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">
                    Ikon Emoji
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={emoji}
                    onChange={(e) => setEmoji(e.target.value)}
                    placeholder="⚡"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-center text-sm outline-none focus:border-foreground transition"
                  />
                </div>
              </div>
            </div>
          )}

          {/* EDIT FORM: IMAGE */}
          {item.type === "image" && (
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">
                  URL Gambar <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://... atau /uploads/..."
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm font-mono outline-none focus:border-foreground transition"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">
                  Keterangan / Caption (Opsional)
                </label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Contoh: Showcase Artwork Komunitas"
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm outline-none focus:border-foreground transition"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">
                  URL Tujuan Klik (Opsional)
                </label>
                <input
                  type="url"
                  value={href}
                  onChange={(e) => setHref(e.target.value)}
                  placeholder="https://... (ketika gambar diklik)"
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm font-mono outline-none focus:border-foreground transition"
                />
              </div>
            </div>
          )}

          {/* EDIT FORM: GITHUB */}
          {item.type === "github" && (
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">
                  Username GitHub <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center rounded-xl border border-border bg-background px-3.5 py-2 text-sm">
                  <span className="text-muted-foreground mr-1">github.com/</span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="username"
                    className="w-full bg-transparent font-mono outline-none"
                  />
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Avatar, bio, jumlah repositori, dan followers akan dimuat secara live dari GitHub.
                </p>
              </div>
            </div>
          )}

          {/* EDIT FORM: CALENDAR */}
          {item.type === "calendar" && (
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">
                  Judul Sesi Pertemuan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Konsultasi 1-on-1 (30 Menit)"
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm outline-none focus:border-foreground transition"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">
                  Link Cal.com / Calendly <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://cal.com/username atau https://calendly.com/username"
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm font-mono outline-none focus:border-foreground transition"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">
                  Deskripsi / Keterangan Singkat (Opsional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Contoh: Diskusi teknis architecture & portfolio review"
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm outline-none focus:border-foreground transition"
                />
              </div>
            </div>
          )}

          {/* EDIT FORM: SAWER / DONASI */}
          {item.type === "sawer" && (
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">
                  Judul Kartu <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Traktir Kopi ☕"
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm outline-none focus:border-foreground transition"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">
                  Pesan Ajakan / Deskripsi (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={sawerMessage}
                  onChange={(e) => setSawerMessage(e.target.value)}
                  placeholder="Contoh: Dukung karya dan konten saya dengan mentraktir secangkir kopi hangat!"
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm outline-none focus:border-foreground transition"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">
                    Nama Satuan Traktiran
                  </label>
                  <input
                    type="text"
                    value={unitName}
                    onChange={(e) => setUnitName(e.target.value)}
                    placeholder="Kopi"
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm outline-none focus:border-foreground transition"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">
                    Harga Satuan (Rp)
                  </label>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="15000"
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm outline-none focus:border-foreground transition"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">
                  Target Donasi (Rp) (Opsional)
                </label>
                <input
                  type="number"
                  min="1000"
                  step="5000"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="Contoh: 1000000 (kosongkan jika tanpa target)"
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm outline-none focus:border-foreground transition"
                />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Jika diisi, kartu akan menampilkan bar persentase pencapaian dana secara live.
                </p>
              </div>
            </div>
          )}

          {/* EDIT FORM: PRODUCT NOTICE */}
          {item.type === "product" && (
            <div className="rounded-2xl border border-border/80 bg-muted/20 p-4 text-xs space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <ShoppingBag className="h-4 w-4" />
                </span>
                <p className="font-semibold text-foreground">
                  Kartu Produk Terhubung ke Toko
                </p>
              </div>
              <p className="text-muted-foreground leading-relaxed text-[11px]">
                Detail foto, harga promo, stok, dan file digital produk ini disinkronkan otomatis dari database toko profil Anda.
              </p>
            </div>
          )}

          {/* UKURAN BENTO SIZE SELECTOR (Untuk tipe selain produk) */}
          {!isProduct && (
            <div className="border-t border-border/50 pt-3">
              <label className="mb-1.5 block text-xs font-semibold text-foreground">
                Ukuran Kartu Bento
              </label>
              <div className={isHeader ? "grid grid-cols-2 gap-2" : "grid grid-cols-4 gap-2"}>
                {(isHeader
                  ? [
                      { id: "4x1", label: "4×1", desc: "1 Baris Penuh", iconClass: "w-8 h-2.5" },
                      { id: "4x2", label: "4×2", desc: "2 Baris Penuh", iconClass: "w-8 h-5" },
                    ]
                  : [
                      { id: "1x1", label: "1×1", desc: "Kotak Kecil", iconClass: "w-3.5 h-3.5" },
                      { id: "2x1", label: "2×1", desc: "Standar", iconClass: "w-6 h-3" },
                      { id: "2x2", label: "2×2", desc: "Sedang", iconClass: "w-5 h-5" },
                      { id: "4x2", label: "4×2", desc: "Hero Luas", iconClass: "w-8 h-4" },
                    ]
                ).map((sz) => {
                  const isSelected = size === sz.id;
                  return (
                    <button
                      key={sz.id}
                      type="button"
                      onClick={() => setSize(sz.id as BentoSize)}
                      className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-2 text-center transition-all ${
                        isSelected
                          ? "border-foreground bg-foreground text-background font-bold shadow-xs"
                          : "border-border bg-card text-muted-foreground hover:border-foreground/30 hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <div
                        className={`rounded-xs border ${
                          isSelected
                            ? "border-background bg-background/30"
                            : "border-muted-foreground/40 bg-muted"
                        } ${sz.iconClass}`}
                      />
                      <span className="font-mono text-xs leading-none">{sz.label}</span>
                      <span className="text-[9px] opacity-75 leading-none">{sz.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          </div>

          {/* Sticky Footer Actions */}
          <div className="shrink-0 border-t border-border/60 px-4 sm:px-6 py-3.5 bg-card flex items-center justify-between gap-2">
            {onRemove ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                title="Hapus kartu dari kanvas"
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">Hapus Kartu</span>
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
                disabled={loading}
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
        title="Hapus kartu?"
        description="Kartu ini akan dihapus dari kanvas profil."
        confirmLabel="Ya, hapus"
        danger
        busy={removing}
        onConfirm={async () => {
          if (!onRemove) return;
          setRemoving(true);
          try {
            await onRemove(item.id);
            onClose();
          } finally {
            setRemoving(false);
          }
        }}
      />
    </Dialog>
  );
}
