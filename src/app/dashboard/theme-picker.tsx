"use client";

import { useState } from "react";
import { type ThemeName, themeVars } from "@/lib/themes";
import type { SocialLinks, SocialPlatform } from "@/lib/types";
import { normalizeSocialUrl } from "@/lib/types";
import {
  InstagramIcon,
  TikTokIcon,
  YoutubeIcon,
  TwitterIcon,
  WhatsappIcon,
  TelegramIcon,
  GithubIcon,
  LinkedinIcon,
  SpotifyIcon,
  GlobeIcon,
  getSocialColor,
  getSocialIcon,
} from "@/components/social-icons";
import { Upload, Loader2, Image as ImageIcon, X } from "lucide-react";

const ACCENT_PRESETS = [
  { name: "Blue", hex: "#2563eb" },
  { name: "Emerald", hex: "#10b981" },
  { name: "Purple", hex: "#8b5cf6" },
  { name: "Rose", hex: "#f43f5e" },
  { name: "Amber", hex: "#f59e0b" },
  { name: "Cyan", hex: "#06b6d4" },
  { name: "Zinc", hex: "#18181b" },
];

export type ThemePresetItem = {
  id: ThemeName;
  label: string;
  desc: string;
  previewBg: string;
  previewCard: string;
  previewText: string;
  previewBorder?: string;
  accent: string;
};

const LIGHT_THEMES: ThemePresetItem[] = [
  {
    id: "default",
    label: "Minimal Chalk",
    desc: "Off-white bersih & modern stone",
    previewBg: "#fafaf9",
    previewCard: "#ffffff",
    previewText: "#1c1917",
    previewBorder: "#e7e5e4",
    accent: "#18181b",
  },
  {
    id: "slate",
    label: "Nordic Slate",
    desc: "Cool paper & clean navy tech",
    previewBg: "#f8fafc",
    previewCard: "#ffffff",
    previewText: "#0f172a",
    previewBorder: "#e2e8f0",
    accent: "#2563eb",
  },
  {
    id: "stone",
    label: "Warm Sand",
    desc: "Natural linen oat & warm aesthetic",
    previewBg: "#faf7f2",
    previewCard: "#fffdfa",
    previewText: "#292524",
    previewBorder: "#e7e0d4",
    accent: "#78350f",
  },
  {
    id: "latte",
    label: "Butter Latte",
    desc: "Warm cream & cafe luxury",
    previewBg: "#fcf8f2",
    previewCard: "#ffffff",
    previewText: "#3d2c1e",
    previewBorder: "#eee3d3",
    accent: "#b45309",
  },
  {
    id: "forest",
    label: "Matcha Mint",
    desc: "Botanical sage & clean white",
    previewBg: "#f2f8f4",
    previewCard: "#ffffff",
    previewText: "#052e16",
    previewBorder: "#cee6d3",
    accent: "#10b981",
  },
  {
    id: "ocean",
    label: "Sky Breeze",
    desc: "Fresh cyan & airy morning",
    previewBg: "#f0f7fa",
    previewCard: "#ffffff",
    previewText: "#083344",
    previewBorder: "#cde4ed",
    accent: "#0284c7",
  },
  {
    id: "rose",
    label: "Pastel Rose",
    desc: "Blossom pink & wine elegance",
    previewBg: "#fdf3f5",
    previewCard: "#ffffff",
    previewText: "#4c0519",
    previewBorder: "#f7cbd5",
    accent: "#f43f5e",
  },
  {
    id: "sunset",
    label: "Peach Sunset",
    desc: "Golden apricot & cozy warmth",
    previewBg: "#fef6ee",
    previewCard: "#ffffff",
    previewText: "#431407",
    previewBorder: "#f8dac5",
    accent: "#ea580c",
  },
  {
    id: "lavender",
    label: "Soft Lavender",
    desc: "Pastel lilac & creative violet",
    previewBg: "#f6f3fc",
    previewCard: "#ffffff",
    previewText: "#2e1065",
    previewBorder: "#dcd0f4",
    accent: "#9333ea",
  },
  {
    id: "noir",
    label: "Modern Mono",
    desc: "Stark white & editorial noir",
    previewBg: "#ffffff",
    previewCard: "#f7f7f8",
    previewText: "#000000",
    previewBorder: "#e4e4e7",
    accent: "#000000",
  },
  {
    id: "cyber",
    label: "Mint Cyber",
    desc: "Fresh emerald & electric clean",
    previewBg: "#f0fdf4",
    previewCard: "#ffffff",
    previewText: "#022c22",
    previewBorder: "#bbf7d0",
    accent: "#10b981",
  },
];

const DARK_THEMES: ThemePresetItem[] = [
  {
    id: "noir",
    label: "OLED Pure Noir",
    desc: "True pitch black & high contrast",
    previewBg: "#000000",
    previewCard: "#111111",
    previewText: "#ffffff",
    previewBorder: "#242424",
    accent: "#ffffff",
  },
  {
    id: "midnight",
    label: "Midnight Cyber",
    desc: "Deep cosmic navy & electric indigo",
    previewBg: "#080a14",
    previewCard: "#101426",
    previewText: "#e6e7fb",
    previewBorder: "#1e2442",
    accent: "#818cf8",
  },
  {
    id: "ocean",
    label: "Abyss Deep Ocean",
    desc: "Bioluminescent sea & cyan glow",
    previewBg: "#06131a",
    previewCard: "#0b202c",
    previewText: "#d9f0f5",
    previewBorder: "#133547",
    accent: "#22d3ee",
  },
  {
    id: "slate",
    label: "Obsidian Slate",
    desc: "Matte graphite & cold ice pro",
    previewBg: "#0a0f1d",
    previewCard: "#131b2e",
    previewText: "#f1f5f9",
    previewBorder: "#1e293b",
    accent: "#38bdf8",
  },
  {
    id: "forest",
    label: "Emerald Evergreen",
    desc: "Mystic dark pine & mint highlight",
    previewBg: "#05160d",
    previewCard: "#0c2417",
    previewText: "#dcf2e3",
    previewBorder: "#163d27",
    accent: "#34d399",
  },
  {
    id: "rose",
    label: "Vampire Crimson",
    desc: "Velvet maroon & luxury ruby",
    previewBg: "#18050c",
    previewCard: "#260a14",
    previewText: "#fbdce4",
    previewBorder: "#421324",
    accent: "#fb7185",
  },
  {
    id: "lavender",
    label: "Cyber Amethyst",
    desc: "Ultraviolet nebula & neon synth",
    previewBg: "#0f071f",
    previewCard: "#190e33",
    previewText: "#e7defc",
    previewBorder: "#2d1b54",
    accent: "#c084fc",
  },
  {
    id: "sunset",
    label: "Volcanic Amber",
    desc: "Ember charcoal & bronze glow",
    previewBg: "#180c05",
    previewCard: "#26150a",
    previewText: "#fdeede",
    previewBorder: "#422413",
    accent: "#fb923c",
  },
  {
    id: "default",
    label: "Titanium Carbon",
    desc: "Brushed carbon & sleek metallic",
    previewBg: "#141414",
    previewCard: "#202020",
    previewText: "#fafaf9",
    previewBorder: "#383838",
    accent: "#e4e4e7",
  },
  {
    id: "stone",
    label: "Espresso Dark",
    desc: "Roasted coffee & warm almond",
    previewBg: "#171311",
    previewCard: "#241e1b",
    previewText: "#f5efe6",
    previewBorder: "#3d342f",
    accent: "#d4a373",
  },
  {
    id: "cyber",
    label: "Neon Matrix",
    desc: "Cyberpunk black & acid green",
    previewBg: "#050811",
    previewCard: "#0b1122",
    previewText: "#e2f952",
    previewBorder: "#182649",
    accent: "#00f0ff",
  },
  {
    id: "latte",
    label: "Mocha Roasted",
    desc: "Caramel dark & golden amber",
    previewBg: "#1c140d",
    previewCard: "#2b2016",
    previewText: "#faefe3",
    previewBorder: "#423224",
    accent: "#f59e0b",
  },
];

const SOCIAL_FIELDS: {
  key: SocialPlatform;
  label: string;
  placeholder: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { key: "instagram", label: "Instagram", placeholder: "@username atau URL", icon: InstagramIcon },
  { key: "tiktok", label: "TikTok", placeholder: "@username atau URL", icon: TikTokIcon },
  { key: "youtube", label: "YouTube", placeholder: "@channel atau URL", icon: YoutubeIcon },
  { key: "whatsapp", label: "WhatsApp", placeholder: "08123456789 atau wa.me", icon: WhatsappIcon },
  { key: "twitter", label: "X / Twitter", placeholder: "@handle atau URL", icon: TwitterIcon },
  { key: "telegram", label: "Telegram", placeholder: "@username atau t.me", icon: TelegramIcon },
  { key: "github", label: "GitHub", placeholder: "username atau URL", icon: GithubIcon },
  { key: "linkedin", label: "LinkedIn", placeholder: "in/username atau URL", icon: LinkedinIcon },
  { key: "spotify", label: "Spotify", placeholder: "username atau URL artis", icon: SpotifyIcon },
  { key: "website", label: "Website Pribadi", placeholder: "https://domainanda.com", icon: GlobeIcon },
];

export function ThemePicker({
  name,
  bio,
  image,
  bannerImage,
  socials,
  theme,
  accentColor,
  darkMode,
  onSave,
}: {
  name: string;
  bio?: string;
  image?: string;
  bannerImage?: string;
  socials?: SocialLinks;
  theme: string;
  accentColor: string;
  darkMode: boolean;
  onSave: (data: {
    name: string;
    bio: string;
    image?: string;
    bannerImage?: string;
    socials?: SocialLinks;
    theme: string;
    accentColor: string;
    darkMode: boolean;
  }) => Promise<void>;
}) {
  const [eName, setEName] = useState(name);
  const [eBio, setEBio] = useState(bio ?? "");
  const [eImage, setEImage] = useState(image ?? "");
  const [eBanner, setEBanner] = useState(bannerImage ?? "");
  const [eSocials, setESocials] = useState<SocialLinks>(socials ?? {});
  const [eTheme, setETheme] = useState(theme || "default");
  const [eAccent, setEAccent] = useState(accentColor || "#2563eb");
  const [eDark, setEDark] = useState(darkMode ?? false);
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  // Upload states
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  async function handleFileUpload(file: File): Promise<string | null> {
    const form = new FormData();
    form.append("file", file);
    const token = typeof window !== "undefined" ? localStorage.getItem("openlynk_admin") ?? "" : "";
    const res = await fetch("/api/uploads", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: form,
    });
    const json = await res.json();
    if (!res.ok) {
      alert(json.error ?? "Gagal upload gambar");
      return null;
    }
    return json.url;
  }

  async function onAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploadingAvatar(true);
    try {
      const url = await handleFileUpload(f);
      if (url) setEImage(url);
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function onBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploadingBanner(true);
    try {
      const url = await handleFileUpload(f);
      if (url) setEBanner(url);
    } finally {
      setUploadingBanner(false);
    }
  }

  function updateSocial(key: SocialPlatform, val: string) {
    setESocials((prev) => {
      const copy = { ...prev };
      if (!val.trim()) {
        delete copy[key];
      } else {
        copy[key] = val.trim();
      }
      return copy;
    });
  }

  async function handleSave() {
    setSaving(true);
    try {
      await onSave({
        name: eName,
        bio: eBio,
        image: eImage || undefined,
        bannerImage: eBanner || undefined,
        socials: Object.keys(eSocials).length > 0 ? eSocials : undefined,
        theme: eTheme,
        accentColor: eAccent,
        darkMode: eDark,
      });
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  const inputCls =
    "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-base sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-zinc-900 focus:outline-hidden dark:focus:border-zinc-100 transition-colors";

  // Pre-calculate active social links for live preview
  const activeSocialList = Object.entries(eSocials)
    .filter(([, val]) => Boolean(val && val.trim()))
    .map(([key, val]) => {
      const url = normalizeSocialUrl(key as SocialPlatform, val!);
      return {
        key: key as SocialPlatform,
        url,
        color: getSocialColor(url),
        Icon: getSocialIcon(url),
      };
    });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* LEFT COLUMN: EDITING PANELS */}
      <div className="lg:col-span-7 xl:col-span-7 space-y-6">
      {/* 1. Profile & Banner Section */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-xs space-y-6">
        <div>
          <h3 className="font-display text-base font-bold text-foreground">Profil & Cover Banner</h3>
          <p className="text-xs text-muted-foreground">
            Sesuaikan foto cover dan avatar yang tampil di bagian paling atas profil Anda
          </p>
        </div>

        {/* Banner Cover Box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground">Cover Banner Profil</span>
            {eBanner && (
              <button
                type="button"
                onClick={() => setEBanner("")}
                className="text-[11px] text-red-500 hover:underline inline-flex items-center gap-1"
              >
                <X className="h-3 w-3" /> Hapus Banner
              </button>
            )}
          </div>

          <div className="relative h-28 sm:h-36 w-full overflow-hidden rounded-2xl border border-border/80 bg-muted/40 flex items-center justify-center">
            {eBanner ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={eBanner} alt="Banner Preview" className="h-full w-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-1 text-muted-foreground text-xs">
                <ImageIcon className="h-6 w-6 opacity-40" />
                <span>Belum ada banner (opsional)</span>
              </div>
            )}
            {uploadingBanner && (
              <div className="absolute inset-0 bg-background/70 backdrop-blur-2xs flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-foreground" />
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
            <input
              value={eBanner}
              onChange={(e) => setEBanner(e.target.value)}
              placeholder="Atau tempel URL gambar banner (https://...)"
              className={`${inputCls} flex-1 text-xs`}
            />
            <label className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-muted/60 hover:bg-muted px-3.5 py-2 text-xs font-semibold text-foreground cursor-pointer transition-colors">
              <Upload className="h-3.5 w-3.5" />
              <span>{uploadingBanner ? "Mengunggah..." : "Upload Banner"}</span>
              <input
                type="file"
                accept="image/*"
                onChange={onBannerChange}
                disabled={uploadingBanner}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Avatar & Main Info */}
        <div className="flex flex-col sm:flex-row gap-5 items-start pt-2 border-t border-border/50">
          {/* Avatar Preview */}
          <div className="flex flex-col items-center gap-2">
            <div
              className="h-20 w-20 overflow-hidden rounded-full border-2 border-border shadow-md ring-4 ring-muted flex items-center justify-center font-display text-2xl font-bold text-white relative"
              style={{ backgroundColor: eAccent }}
            >
              {eImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={eImage} alt={eName} className="h-full w-full object-cover" />
              ) : (
                eName.slice(0, 1).toUpperCase()
              )}
              {uploadingAvatar && (
                <div className="absolute inset-0 bg-background/70 backdrop-blur-2xs flex items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin text-foreground" />
                </div>
              )}
            </div>
            <label className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground cursor-pointer">
              <Upload className="h-3 w-3" />
              <span>Upload Foto</span>
              <input
                type="file"
                accept="image/*"
                onChange={onAvatarChange}
                disabled={uploadingAvatar}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex-1 space-y-3 w-full">
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">Nama Tampilan</label>
              <input
                value={eName}
                onChange={(e) => setEName(e.target.value)}
                placeholder="Misal: Rian Pratama"
                className={inputCls}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">Bio / Deskripsi Singkat</label>
              <textarea
                value={eBio}
                onChange={(e) => setEBio(e.target.value)}
                placeholder="Ceritakan tentang diri Anda, profesi, atau karya..."
                rows={2}
                className={`${inputCls} resize-none`}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">URL Foto Profil (Avatar)</label>
              <input
                value={eImage}
                onChange={(e) => setEImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className={inputCls}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Social Media Links Section */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-display text-base font-bold text-foreground">Tautan Media Sosial</h3>
            <p className="text-xs text-muted-foreground">
              Tampilkan deretan ikon media sosial resmi langsung di bawah bio halaman publik
            </p>
          </div>
          {activeSocialList.length > 0 && (
            <div className="flex items-center gap-1.5 rounded-full border border-border/70 bg-muted/30 px-3 py-1 text-xs">
              <span className="text-muted-foreground">Aktif:</span>
              <div className="flex items-center gap-1">
                {activeSocialList.map(({ key, Icon, color }) => (
                  <span
                    key={key}
                    style={{ color }}
                    title={key}
                    className="flex h-4 w-4 items-center justify-center"
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Social Fields Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SOCIAL_FIELDS.map(({ key, label, placeholder, icon: Icon }) => {
            const val = eSocials[key] ?? "";
            const isFilled = Boolean(val.trim());
            return (
              <div
                key={key}
                className={`flex items-center rounded-xl border p-1.5 transition-all ${
                  isFilled
                    ? "border-foreground/40 bg-card shadow-2xs"
                    : "border-border/70 bg-muted/20"
                }`}
              >
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-card text-foreground"
                  style={{ color: isFilled ? getSocialColor(val) : undefined }}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="ml-2 flex-1 min-w-0 pr-1">
                  <span className="block text-[10px] font-semibold text-muted-foreground">
                    {label}
                  </span>
                  <input
                    value={val}
                    onChange={(e) => updateSocial(key, e.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground/60 outline-hidden"
                  />
                </div>
                {isFilled && (
                  <button
                    type="button"
                    onClick={() => updateSocial(key, "")}
                    className="p-1 text-muted-foreground hover:text-foreground"
                    title="Kosongkan"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Themes Selection */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-base font-bold text-foreground">
                {eDark ? "Preset Tema Gelap (Dark Mode)" : "Preset Tema Terang (Light Mode)"}
              </h3>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                  eDark
                    ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                    : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                }`}
              >
                {eDark ? "🌙 Mode Gelap Aktif" : "☀️ Mode Terang Aktif"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {eDark
                ? "Pilihan palet gelap OLED, Midnight, dan Obsidian yang ramah mata & kontras tinggi"
                : "Pilihan palet terang bersih, estetik, dan elegan bergaya modern"}
            </p>
          </div>

          <div className="flex items-center gap-2.5 bg-muted/40 border border-border/70 px-3 py-1.5 rounded-xl self-start sm:self-auto">
            <span className="text-xs font-semibold text-foreground">
              {eDark ? "Mode Gelap" : "Mode Terang"}
            </span>
            <button
              type="button"
              onClick={() => {
                const nextDark = !eDark;
                setEDark(nextDark);
                if (nextDark && !DARK_THEMES.some((t) => t.id === eTheme)) {
                  setETheme("noir");
                  setEAccent("#ffffff");
                } else if (!nextDark && !LIGHT_THEMES.some((t) => t.id === eTheme)) {
                  setETheme("default");
                  setEAccent("#18181b");
                }
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                eDark ? "bg-zinc-900 dark:bg-white" : "bg-zinc-300"
              }`}
              title="Ganti Mode Gelap / Terang"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-zinc-900 transition-transform ${
                  eDark ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {(eDark ? DARK_THEMES : LIGHT_THEMES).map((preset) => {
            const active = eTheme === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setETheme(preset.id);
                  if (preset.accent) setEAccent(preset.accent);
                }}
                className={`group flex flex-col overflow-hidden rounded-2xl border text-left transition-all hover:scale-102 ${
                  active
                    ? "border-primary ring-2 ring-primary shadow-md"
                    : "border-border/70 hover:border-border"
                }`}
              >
                {/* Visual Preview Box */}
                <div
                  className="flex h-16 w-full items-center justify-center p-2.5 transition-colors"
                  style={{ backgroundColor: preset.previewBg }}
                >
                  <div
                    className="flex h-10 w-full items-center justify-between rounded-xl px-2.5 shadow-2xs border"
                    style={{
                      backgroundColor: preset.previewCard,
                      borderColor: preset.previewBorder || "transparent",
                    }}
                  >
                    <span
                      className="h-2 w-10 rounded-full"
                      style={{ backgroundColor: preset.previewText, opacity: 0.85 }}
                    />
                    <span
                      className="h-3.5 w-3.5 rounded-full shadow-xs"
                      style={{ backgroundColor: active ? eAccent : preset.accent }}
                    />
                  </div>
                </div>

                <div className="p-2.5 bg-card flex flex-col justify-between flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="truncate text-xs font-semibold text-foreground">
                      {preset.label}
                    </span>
                    {active && <span className="text-xs font-bold text-primary shrink-0">✓</span>}
                  </div>
                  <span className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                    {preset.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Accent Color Palette */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-xs">
        <h3 className="font-display text-base font-bold text-foreground">Warna Aksen Brand</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Digunakan pada tombol utama, badge produk, dan sorotan profil
        </p>

        <div className="flex flex-wrap items-center gap-3">
          {ACCENT_PRESETS.map((a) => (
            <button
              key={a.hex}
              type="button"
              onClick={() => setEAccent(a.hex)}
              className={`flex h-10 w-10 items-center justify-center rounded-2xl border transition-all hover:scale-110 ${
                eAccent.toLowerCase() === a.hex.toLowerCase()
                  ? "ring-2 ring-offset-2 ring-zinc-900 dark:ring-white scale-105 border-transparent"
                  : "border-border/60"
              }`}
              style={{ backgroundColor: a.hex }}
              title={a.name}
            >
              {eAccent.toLowerCase() === a.hex.toLowerCase() && (
                <span className="text-white text-xs font-bold drop-shadow-xs">✓</span>
              )}
            </button>
          ))}

          <div className="ml-2 flex items-center gap-2 rounded-xl border border-border/70 bg-muted/40 px-3 py-1.5">
            <input
              type="color"
              value={eAccent}
              onChange={(e) => setEAccent(e.target.value)}
              className="h-7 w-7 cursor-pointer rounded-lg border-0 bg-transparent p-0"
              title="Pilih warna kustom"
            />
            <span className="font-mono text-xs text-muted-foreground uppercase">{eAccent}</span>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-between pt-2">
        <div>
          {savedNotice && (
            <span className="animate-fade-in text-sm font-medium text-emerald-600 dark:text-emerald-400">
              ✓ Perubahan tampilan tersimpan!
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-full bg-zinc-900 px-7 py-3 text-sm font-semibold text-white shadow-md transition-all hover:opacity-90 active:scale-95 disabled:pointer-events-none disabled:opacity-50 dark:bg-white dark:text-zinc-900 cursor-pointer"
        >
          {saving ? "Menyimpan…" : "Simpan Tampilan"}
        </button>
      </div>
      </div>

      {/* RIGHT COLUMN ON DESKTOP: LIVE INTERACTIVE PHONE MOCKUP */}
      <div className="hidden lg:flex lg:col-span-5 xl:col-span-5 flex-col items-center sticky top-20">
        <div className="w-full max-w-[340px] flex items-center justify-between px-2 mb-2.5 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-foreground">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Pratinjau Langsung (WYSIWYG)</span>
          </div>
          <span className="text-[10px] font-mono rounded-md bg-muted px-2 py-0.5 text-muted-foreground">
            {eDark ? "🌙 Gelap" : "☀️ Terang"}
          </span>
        </div>

        {/* Smartphone Device Mockup Frame */}
        <div className="w-full max-w-[340px] rounded-[44px] border-[6px] border-zinc-800 dark:border-zinc-700 bg-zinc-950 p-2 shadow-2xl ring-1 ring-black/10">
          {/* Inner Screen */}
          <div
            className="relative rounded-[36px] overflow-hidden overflow-y-auto max-h-[620px] scrollbar-none transition-colors duration-300"
            style={{
              ...themeVars(eTheme as ThemeName, eDark),
              backgroundColor: "var(--background)",
              color: "var(--foreground)",
            }}
          >
            {/* Dynamic Notch / Island */}
            <div className="sticky top-0 z-30 pt-2 pb-1 bg-inherit flex justify-center">
              <div className="h-3.5 w-20 rounded-full bg-zinc-900/90 dark:bg-black/90 shadow-2xs" />
            </div>

            {/* Cover Banner Preview */}
            <div className="relative h-24 w-full overflow-hidden bg-muted/40">
              {eBanner ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={eBanner} alt="Banner" className="h-full w-full object-cover" />
              ) : (
                <div
                  className="h-full w-full"
                  style={{
                    background: `linear-gradient(135deg, ${eAccent}35, transparent)`,
                  }}
                />
              )}
            </div>

            {/* Profile Avatar & Info */}
            <div className="px-4 pt-0 pb-3 text-center -mt-8 relative z-10 space-y-1.5">
              <div
                className="mx-auto flex h-16 w-16 items-center justify-center overflow-hidden rounded-full font-display text-xl font-bold text-white shadow-md ring-4 ring-[var(--background)]"
                style={{
                  backgroundColor: eAccent,
                }}
              >
                {eImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={eImage} alt={eName} className="h-full w-full object-cover" />
                ) : (
                  (eName || "A").slice(0, 1).toUpperCase()
                )}
              </div>

              <div>
                <h4 className="font-display text-sm font-bold truncate">
                  {eName || "Nama Profil Anda"}
                </h4>
                {eBio && (
                  <p className="text-[10px] opacity-75 line-clamp-2 mt-0.5 max-w-[240px] mx-auto leading-relaxed">
                    {eBio}
                  </p>
                )}
              </div>

              {/* Social Icons Bar in Mockup */}
              {activeSocialList.length > 0 && (
                <div className="flex items-center justify-center gap-1.5 pt-1 flex-wrap">
                  {activeSocialList.map(({ key, Icon, color }) => (
                    <span
                      key={key}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--card)] border border-[var(--border)] shadow-2xs text-[11px]"
                      style={{ color }}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Live Bento Cards Preview in Mockup */}
            <div className="px-3.5 pb-6 space-y-2">
              <div className="text-[9px] font-bold uppercase tracking-wider opacity-60 text-center mb-1">
                Contoh Kartu Bento Profil
              </div>

              <div className="grid grid-cols-2 gap-2 text-left">
                {/* Sample Card 1: Featured Link */}
                <div className="col-span-2 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-3 shadow-2xs flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="h-7 w-7 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ backgroundColor: eAccent }}
                    >
                      ★
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">Tautan Unggulan</p>
                      <p className="text-[10px] opacity-60 truncate">openlynk.id</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold opacity-75">↗</span>
                </div>

                {/* Sample Card 2: Toko Produk */}
                <div className="col-span-1 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-3 shadow-2xs space-y-1.5">
                  <span className="rounded-md bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 text-[9px] font-bold">
                    PRODUK
                  </span>
                  <p className="text-xs font-bold truncate">Ebook & Template</p>
                  <p className="font-mono text-[10px] font-bold" style={{ color: eAccent }}>
                    Rp 99.000
                  </p>
                </div>

                {/* Sample Card 3: Traktir Kopi */}
                <div className="col-span-1 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-3 shadow-2xs space-y-1.5">
                  <span className="rounded-md bg-amber-500/10 text-amber-500 px-1.5 py-0.5 text-[9px] font-bold">
                    SAWER
                  </span>
                  <p className="text-xs font-bold truncate">Traktir Kopi ☕</p>
                  <p className="font-mono text-[10px] font-semibold opacity-75">
                    Dukungan Kreator
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
