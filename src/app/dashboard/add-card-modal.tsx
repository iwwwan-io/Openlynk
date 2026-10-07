"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { BentoSize, Product } from "@/lib/types";
import {
  Link2,
  Heading,
  FileText,
  Video,
  Music,
  MapPin,
  Clock,
  ShoppingBag,
  Plus,
  Image as ImageIcon,
  Calendar as CalendarIcon,
  Upload,
  Loader2,
  Coffee,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  InstagramIcon,
  YoutubeIcon,
  GithubIcon,
  DiscordIcon,
  TwitterIcon,
  TikTokIcon,
  TelegramIcon,
  WhatsappIcon,
  LinkedinIcon,
  SpotifyIcon,
} from "@/components/social-icons";

export type SocialPreset = {
  id: string;
  name: string;
  color: string;
  placeholder: string;
  defaultTitle: string;
  icon: (cls: string) => React.ReactNode;
};

export const SOCIAL_PRESETS: SocialPreset[] = [
  {
    id: "instagram",
    name: "Instagram",
    color: "#E1306C",
    placeholder: "https://instagram.com/username",
    defaultTitle: "Instagram",
    icon: (cls) => <InstagramIcon className={cls} />,
  },
  {
    id: "youtube",
    name: "YouTube",
    color: "#FF0000",
    placeholder: "https://youtube.com/@channel",
    defaultTitle: "YouTube",
    icon: (cls) => <YoutubeIcon className={cls} />,
  },
  {
    id: "github",
    name: "GitHub",
    color: "#24292F",
    placeholder: "https://github.com/username",
    defaultTitle: "GitHub",
    icon: (cls) => <GithubIcon className={cls} />,
  },
  {
    id: "discord",
    name: "Discord",
    color: "#5865F2",
    placeholder: "https://discord.gg/invite",
    defaultTitle: "Discord",
    icon: (cls) => <DiscordIcon className={cls} />,
  },
  {
    id: "twitter",
    name: "X / Twitter",
    color: "#000000",
    placeholder: "https://x.com/username",
    defaultTitle: "X / Twitter",
    icon: (cls) => <TwitterIcon className={cls} />,
  },
  {
    id: "tiktok",
    name: "TikTok",
    color: "#000000",
    placeholder: "https://tiktok.com/@username",
    defaultTitle: "TikTok",
    icon: (cls) => <TikTokIcon className={cls} />,
  },
  {
    id: "telegram",
    name: "Telegram",
    color: "#229ED9",
    placeholder: "https://t.me/username",
    defaultTitle: "Telegram",
    icon: (cls) => <TelegramIcon className={cls} />,
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    color: "#25D366",
    placeholder: "https://wa.me/6281234567890",
    defaultTitle: "WhatsApp",
    icon: (cls) => <WhatsappIcon className={cls} />,
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    color: "#0A66C2",
    placeholder: "https://linkedin.com/in/username",
    defaultTitle: "LinkedIn",
    icon: (cls) => <LinkedinIcon className={cls} />,
  },
  {
    id: "spotify",
    name: "Spotify",
    color: "#1ED760",
    placeholder: "https://open.spotify.com/artist/id",
    defaultTitle: "Spotify",
    icon: (cls) => <SpotifyIcon className={cls} />,
  },
];

type Category =
  | "link"
  | "header"
  | "note"
  | "video"
  | "music"
  | "map"
  | "countdown"
  | "image"
  | "github"
  | "calendar"
  | "sawer"
  | "product";

export function AddCardModal({
  open,
  onClose,
  onAdd,
  availableProducts = [],
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (action: string, data: Record<string, unknown>) => Promise<void>;
  availableProducts?: Product[];
}) {
  const [tab, setTab] = useState<Category>("link");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [address, setAddress] = useState("");
  const [emoji, setEmoji] = useState("⚡");
  const [targetDate, setTargetDate] = useState("");
  const [caption, setCaption] = useState("");
  const [href, setHref] = useState("");
  const [username, setUsername] = useState("");
  const [description, setDescription] = useState("");
  const [unitName, setUnitName] = useState("Kopi");
  const [unitPrice, setUnitPrice] = useState<number | "">(15000);
  const [targetAmount, setTargetAmount] = useState<number | "">("");
  const [size, setSize] = useState<BentoSize>("1x1");
  const [selectedProductId, setSelectedProductId] = useState("");

  if (!open) return null;

  function selectPreset(preset: SocialPreset) {
    setTitle(preset.defaultTitle);
    setUrl(preset.placeholder);
    setSize("1x1");
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const token = typeof window !== "undefined" ? (localStorage.getItem("openlynk_admin") ?? "") : "";
      const res = await fetch("/api/uploads", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal upload gambar");
      setUrl(data.url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal upload gambar");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (tab === "link") {
        await onAdd("add-link", { title: title.trim(), href: url.trim(), size });
      } else if (tab === "header") {
        await onAdd("add-header", { title: title.trim(), subtitle: text.trim() });
      } else if (tab === "note") {
        await onAdd("add-note", { title: title.trim(), text: text.trim(), size });
      } else if (tab === "video") {
        await onAdd("add-video", { title: title.trim(), url: url.trim(), size });
      } else if (tab === "music") {
        await onAdd("add-music", { title: title.trim(), url: url.trim(), size });
      } else if (tab === "map") {
        await onAdd("add-map", { label: title.trim(), address: address.trim(), size });
      } else if (tab === "countdown") {
        await onAdd("add-countdown", { title: title.trim(), emoji, targetDate, size });
      } else if (tab === "image") {
        await onAdd("add-image", { url: url.trim(), caption: caption.trim() || undefined, href: href.trim() || undefined, size });
      } else if (tab === "github") {
        await onAdd("add-github", { username: username.trim().replace(/^@/, ""), size });
      } else if (tab === "calendar") {
        await onAdd("add-calendar", { title: title.trim(), url: url.trim(), description: description.trim() || undefined, size });
      } else if (tab === "sawer") {
        await onAdd("add-sawer", {
          title: title.trim() || "Traktir Kopi ☕",
          message: text.trim() || undefined,
          unitName: unitName.trim() || "Kopi",
          unitPrice: unitPrice ? Number(unitPrice) : 15000,
          targetAmount: targetAmount ? Number(targetAmount) : undefined,
          size,
        });
      } else if (tab === "product") {
        if (!selectedProductId) return;
        await onAdd("add-product", { productId: selectedProductId });
      }
      onClose();
      // Reset form
      setTitle("");
      setUrl("");
      setText("");
      setAddress("");
      setTargetDate("");
      setCaption("");
      setHref("");
      setUsername("");
      setDescription("");
      setSize("1x1");
    } catch {
      // error handled in caller
    } finally {
      setLoading(false);
    }
  }

  const inputCls =
    "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-base sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-zinc-900 focus:outline-none dark:focus:border-zinc-100 transition-colors";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg rounded-3xl border-border bg-card p-0 shadow-2xl sm:rounded-3xl max-h-[92vh] overflow-hidden flex flex-col">
        {/* Header */}
        <DialogHeader className="border-b border-border/60 px-5 sm:px-6 py-3.5 sm:py-4 text-left">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-bold text-sm">
              <Plus className="h-4 w-4" />
            </span>
            <div>
              <DialogTitle className="font-display text-base sm:text-lg font-bold text-foreground">Tambah Kartu Bento</DialogTitle>
              <DialogDescription className="text-[11px] sm:text-xs text-muted-foreground">Pilih jenis kartu untuk disematkan</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Category Tabs */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar border-b border-border/50 bg-muted/30 px-5 sm:px-6 py-2.5 text-xs">
          {[
            { id: "link", label: "Link & Sosmed", icon: Link2 },
            { id: "header", label: "Header / Grup", icon: Heading },
            { id: "image", label: "Gambar", icon: ImageIcon },
            { id: "github", label: "GitHub", icon: GithubIcon },
            { id: "calendar", label: "Jadwal", icon: CalendarIcon },
            { id: "note", label: "Catatan", icon: FileText },
            { id: "video", label: "YouTube", icon: Video },
            { id: "music", label: "Spotify", icon: Music },
            { id: "map", label: "Peta", icon: MapPin },
            { id: "countdown", label: "Countdown", icon: Clock },
            { id: "sawer", label: "Sawer / Kopi", icon: Coffee },
            { id: "product", label: "Produk", icon: ShoppingBag },
          ].map((c) => {
            const Icon = c.icon;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setTab(c.id as Category);
                  if (c.id === "link") setSize("1x1");
                  else if (c.id === "video" || c.id === "map" || c.id === "image" || c.id === "sawer") {
                    setSize("2x2");
                    if (c.id === "sawer") {
                      if (!title) setTitle("Traktir Kopi ☕");
                      if (!text) setText("Dukung karya dan konten saya dengan mentraktir secangkir kopi.");
                    }
                  } else if (c.id === "note" || c.id === "music" || c.id === "countdown" || c.id === "github" || c.id === "calendar") setSize("2x1");
                }}
                className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 font-medium transition-all ${
                  tab === c.id
                    ? "bg-zinc-900 text-white shadow-xs dark:bg-white dark:text-zinc-900"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {tab === "link" && (
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Preset Media Sosial Populer
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {SOCIAL_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => selectPreset(p)}
                      className="group flex flex-col items-center gap-1.5 rounded-2xl border border-border/60 bg-muted/20 p-2.5 text-center transition-all hover:border-border hover:bg-muted/60 hover:scale-105"
                    >
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-xl shadow-2xs"
                        style={{ backgroundColor: `${p.color}15`, color: p.color }}
                      >
                        {p.icon("h-5 w-5")}
                      </div>
                      <span className="truncate text-[11px] font-medium text-foreground">{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">Judul Link / Akun</label>
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Misal: Instagram, Portfolio, Tokopedia"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">URL Tujuan</label>
                <input
                  required
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                  className={inputCls}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">Ukuran Kartu Bento</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "1x1", label: "1x1 Kompak (Tile Persegi)" },
                    { id: "2x1", label: "2x1 Banner (Lebar Sedang)" },
                    { id: "2x2", label: "2x2 Showcase (Besar)" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSize(s.id as BentoSize)}
                      className={`rounded-xl border p-2 text-center text-xs font-medium transition-all ${
                        size === s.id
                          ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900 shadow-xs"
                          : "border-border/80 bg-background text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "header" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 p-4 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">💡 Sekat Pembatas Bagian:</span> Otomatis membentang penuh di desktop (4 kolom) & mobile (2 kolom) untuk mengelompokkan link sosmed, toko, catatan, dll.
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">Judul Grup / Sekat</label>
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Misal: 🌐 Media Sosial, 🛍️ Toko & Produk, 🎬 Video"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">Keterangan / Sub-judul (Opsional)</label>
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Misal: Ikuti update harian dan diskusi teknologi"
                  className={inputCls}
                />
              </div>
            </div>
          )}

          {tab === "note" && (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">Judul Catatan (Opsional)</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Misal: Pengumuman, Tentang Saya, Update Q4"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">Isi Catatan / Pesan</label>
                <textarea
                  required
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Tulis pesan pengumuman, bio panjang, atau quote inspiratif..."
                  rows={4}
                  className={`${inputCls} resize-none`}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">Ukuran Kartu</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "2x1", label: "2x1 Sedang" },
                    { id: "2x2", label: "2x2 Luas (Rekomendasi untuk teks panjang)" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSize(s.id as BentoSize)}
                      className={`rounded-xl border p-2 text-center text-xs font-medium transition-all ${
                        size === s.id
                          ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900 shadow-xs"
                          : "border-border/80 bg-background text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "video" && (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">Judul Video (Opsional)</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Misal: Tutorial Coding Terbaru, Vlog Jakarta"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">URL Video YouTube</label>
                <input
                  required
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... atau https://youtu.be/..."
                  className={inputCls}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">Ukuran Player</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "2x2", label: "2x2 Kotak Standar" },
                    { id: "4x2", label: "4x2 Bioskop Lebar" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSize(s.id as BentoSize)}
                      className={`rounded-xl border p-2 text-center text-xs font-medium transition-all ${
                        size === s.id
                          ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900 shadow-xs"
                          : "border-border/80 bg-background text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "music" && (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">Judul Musik / Playlist (Opsional)</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Misal: Lofi Chill Coding, Album Favorit"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">URL Spotify</label>
                <input
                  required
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://open.spotify.com/track/... atau playlist/..."
                  className={inputCls}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">Ukuran Player</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "2x1", label: "2x1 Mini Player" },
                    { id: "2x2", label: "2x2 Full Cover Player" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSize(s.id as BentoSize)}
                      className={`rounded-xl border p-2 text-center text-xs font-medium transition-all ${
                        size === s.id
                          ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900 shadow-xs"
                          : "border-border/80 bg-background text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "map" && (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">Nama Lokasi / Studio</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Misal: Studio Senopati, Toko Offline"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">Alamat Lengkap / Kota</label>
                <input
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Misal: Senopati No. 45, Kebayoran Baru, Jakarta Selatan"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">Ukuran Peta</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "2x2", label: "2x2 Persegi Standar" },
                    { id: "4x2", label: "4x2 Panorama Lebar" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSize(s.id as BentoSize)}
                      className={`rounded-xl border p-2 text-center text-xs font-medium transition-all ${
                        size === s.id
                          ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900 shadow-xs"
                          : "border-border/80 bg-background text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "countdown" && (
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-20">
                  <label className="mb-1 block text-xs font-medium text-foreground">Emoji</label>
                  <input
                    value={emoji}
                    onChange={(e) => setEmoji(e.target.value)}
                    placeholder="⚡"
                    className={`${inputCls} text-center text-lg`}
                  />
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-medium text-foreground">Judul Countdown</label>
                  <input
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Misal: Flash Sale Ramadhan 50%, Launching Ebook"
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">Waktu Target Berakhir</label>
                <input
                  required
                  type="datetime-local"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">Ukuran Kartu</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "2x1", label: "2x1 Kompak" },
                    { id: "2x2", label: "2x2 Menonjol" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSize(s.id as BentoSize)}
                      className={`rounded-xl border p-2 text-center text-xs font-medium transition-all ${
                        size === s.id
                          ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900 shadow-xs"
                          : "border-border/80 bg-background text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "image" && (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">Upload atau Masukkan URL Gambar</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      required
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/... atau upload file"
                      className={inputCls}
                    />
                    <label className="flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-border bg-muted/60 px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      {uploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      <span>{uploading ? "Upload..." : "Pilih File"}</span>
                    </label>
                  </div>
                  {url && (
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="Pratinjau" className="h-full w-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">Keterangan / Caption (Opsional)</label>
                <input
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Misal: Official Poster / Showcase Merchandise"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">URL Tujuan Klik (Opsional)</label>
                <input
                  type="url"
                  value={href}
                  onChange={(e) => setHref(e.target.value)}
                  placeholder="https://... (jika gambar diklik)"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">Ukuran Kartu</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "2x1", label: "2x1 Banner" },
                    { id: "2x2", label: "2x2 Kotak" },
                    { id: "4x2", label: "4x2 Besar" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSize(s.id as BentoSize)}
                      className={`rounded-xl border p-2 text-center text-xs font-medium transition-all ${
                        size === s.id
                          ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900 shadow-xs"
                          : "border-border/80 bg-background text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "github" && (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">Username GitHub</label>
                <div className="flex items-center rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm">
                  <span className="text-muted-foreground mr-1">github.com/</span>
                  <input
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="rianpratama"
                    className="w-full bg-transparent font-mono outline-none"
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  Statistik live: avatar profil, bio, jumlah repositori publik, dan followers akan otomatis ditampilkan di kartu.
                </p>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">Ukuran Kartu</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "1x1", label: "1x1 Mini" },
                    { id: "2x1", label: "2x1 Standar" },
                    { id: "2x2", label: "2x2 Detail" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSize(s.id as BentoSize)}
                      className={`rounded-xl border p-2 text-center text-xs font-medium transition-all ${
                        size === s.id
                          ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900 shadow-xs"
                          : "border-border/80 bg-background text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "calendar" && (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">Judul Sesi</label>
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Misal: Konsultasi 1-on-1 (30 Menit), Podcast Interview"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">Link Cal.com / Calendly</label>
                <input
                  required
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://cal.com/username atau https://calendly.com/username"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">Deskripsi Sesi (Opsional)</label>
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Misal: Sesi tatap muka via Google Meet untuk audit kode atau karir"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">Ukuran Kartu</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "2x1", label: "2x1 Kompak" },
                    { id: "2x2", label: "2x2 Lengkap" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSize(s.id as BentoSize)}
                      className={`rounded-xl border p-2 text-center text-xs font-medium transition-all ${
                        size === s.id
                          ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900 shadow-xs"
                          : "border-border/80 bg-background text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "sawer" && (
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-foreground">Preset Cepat</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    {
                      label: "☕ Traktir Kopi",
                      t: "Traktir Kopi ☕",
                      m: "Dukung karya dan konten saya dengan secangkir kopi hangat!",
                      u: "Kopi",
                      p: 15000,
                      target: "",
                      s: "2x2" as BentoSize,
                    },
                    {
                      label: "❤️ Tip & Donasi",
                      t: "Dukungan & Donasi ❤️",
                      m: "Terima kasih banyak atas apresiasi dan dukungan Anda.",
                      u: "Dukungan",
                      p: 10000,
                      target: "",
                      s: "2x2" as BentoSize,
                    },
                    {
                      label: "🧋 Beliin Boba",
                      t: "Beliin Boba Segar 🧋",
                      m: "Traktir boba manis biar makin semangat bikin konten baru!",
                      u: "Gelas Boba",
                      p: 25000,
                      target: "",
                      s: "2x1" as BentoSize,
                    },
                    {
                      label: "🎯 Target Proyek",
                      t: "Patungan Proyek Baru 🚀",
                      m: "Bantu capai target dana untuk upgrade alat & konten selanjutnya.",
                      u: "Slot",
                      p: 50000,
                      target: 1000000,
                      s: "4x2" as BentoSize,
                    },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setTitle(preset.t);
                        setText(preset.m);
                        setUnitName(preset.u);
                        setUnitPrice(preset.p);
                        setTargetAmount(preset.target === "" ? "" : Number(preset.target));
                        setSize(preset.s);
                      }}
                      className="rounded-xl border border-border/80 bg-background/50 hover:bg-muted/60 p-2.5 text-left text-xs transition-colors"
                    >
                      <p className="font-semibold text-foreground">{preset.label}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Rp {preset.p.toLocaleString("id-ID")}{preset.target ? ` · Target 1jt` : ""}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">Judul Kartu</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Misal: Traktir Kopi ☕"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">Pesan Ajakan / Deskripsi</label>
                <textarea
                  rows={2}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Misal: Secangkir kopi hangat bikin saya tambah semangat berkarya!"
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">Nama Satuan</label>
                  <input
                    type="text"
                    value={unitName}
                    onChange={(e) => setUnitName(e.target.value)}
                    placeholder="Contoh: Kopi / Porsi"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-foreground">Harga Satuan (Rp)</label>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="15000"
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">
                  Target Donasi (Rp) <span className="text-muted-foreground font-normal">(Opsional)</span>
                </label>
                <input
                  type="number"
                  min="1000"
                  step="5000"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="Contoh: 1000000 (kosongkan jika tanpa target)"
                  className={inputCls}
                />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Jika diisi, kartu akan menampilkan progress bar target donasi secara real-time.
                </p>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">Ukuran Kartu</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: "1x1", label: "1x1 Mini" },
                    { id: "2x1", label: "2x1 Kompak" },
                    { id: "2x2", label: "2x2 Standar" },
                    { id: "4x2", label: "4x2 Banner" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSize(s.id as BentoSize)}
                      className={`rounded-xl border p-2 text-center text-xs font-medium transition-all ${
                        size === s.id
                          ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900 shadow-xs"
                          : "border-border/80 bg-background text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "product" && (
            <div className="space-y-4">
              {availableProducts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  Semua produk sudah terpasang di grid bento, atau belum ada produk yang dibuat. Buka tab Toko untuk menambah produk baru.
                </div>
              ) : (
                <div>
                  <label className="mb-2 block text-xs font-medium text-foreground">Pilih Produk untuk Disematkan</label>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {availableProducts.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedProductId(p.id)}
                        className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition-all ${
                          selectedProductId === p.id
                            ? "border-zinc-900 bg-muted/60 dark:border-white"
                            : "border-border/60 hover:bg-muted/30"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold">
                            <ShoppingBag className="h-4 w-4" />
                          </span>
                          <div>
                            <p className="font-semibold text-sm text-foreground">{p.name}</p>
                            <p className="text-xs text-muted-foreground">Rp {p.priceIdr.toLocaleString("id-ID")}</p>
                          </div>
                        </div>
                        <span className="text-xs font-medium text-muted-foreground uppercase">{p.kind}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/50">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-5 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || (tab === "product" && !selectedProductId)}
              className="rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:opacity-90 active:scale-95 disabled:pointer-events-none disabled:opacity-50 dark:bg-white dark:text-zinc-900"
            >
              {loading ? "Menambahkan…" : "+ Tambahkan ke Grid"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
