"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowRight,
  ExternalLink,
  Check,
  LayoutGrid,
  Zap,
  BarChart3,
  Music,
  Video,
  Globe,
  Play,
  QrCode,
  ShieldCheck,
  Send,
  Palette,
  TrendingUp,
  Code2,
  CheckCircle2,
  Smartphone,
} from "lucide-react";
import { NavbarShell, HomeFooter } from "@/components/site";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { formatIDR } from "@/lib/types";

// Creator Archetypes data
const creatorTypes = [
  {
    title: "Kreator & Indie Dev",
    icon: Code2,
    badge: "Tech & Coding",
    desc: "Jual ebook, template source code, Notion templates, dan sesi konsultasi 1-on-1.",
    tagline: "openlynk.id/alexpratama",
  },
  {
    title: "Desainer & Ilustrator",
    icon: Palette,
    badge: "Design Assets",
    desc: "Portofolio visual bento, penjualan UI kit Figma, icon pack, dan wallpaper 4K.",
    tagline: "openlynk.id/sarahdesign",
  },
  {
    title: "Musisi & Podcaster",
    icon: Music,
    badge: "Audio & Media",
    desc: "Player Spotify dan YouTube langsung di profil bio tanpa buka tab baru.",
    tagline: "openlynk.id/nadaindie",
  },
  {
    title: "Fotografer & Kreator Konten",
    icon: Video,
    badge: "Visual & Presets",
    desc: "Jual preset Lightroom, filter visual, video mentoring, dan link afiliasi produk.",
    tagline: "openlynk.id/lensakita",
  },
];

// Features List
const coreFeatures = [
  {
    icon: QrCode,
    title: "Checkout 1-Halaman Tanpa Redirect",
    badge: "Konversi 3x Lipat",
    description:
      "Pengunjung tidak perlu diarahkan ke website eksternal yang lambat. Bottom sheet muncul seketika di halaman bio, bayar QRIS/VA otomatis, dan file langsung terunduh saat itu juga.",
    accent: "from-emerald-500/10 to-teal-500/5",
    border: "border-emerald-500/20",
  },
  {
    icon: LayoutGrid,
    title: "Bento Grid 2D Bebas & Estetik",
    badge: "Desain Bebas",
    description:
      "Lupakan daftar link vertikal yang membosankan seperti tahun 2018. Susun kartu dalam ukuran 1x1, 2x1, 2x2, hingga 4x2 dengan sekat grup kategori (Social, Store, Media, Highlight).",
    accent: "from-blue-500/10 to-indigo-500/5",
    border: "border-blue-500/20",
  },
  {
    icon: Music,
    title: "Embed Spotify & YouTube Langsung",
    badge: "Multimedia Kaya",
    description:
      "Sematkan lagu Spotify, playlist podcast, atau video YouTube favoritmu langsung di kartu bio. Pengunjung bisa mendengarkan atau menonton tanpa harus keluar dari profilmu.",
    accent: "from-purple-500/10 to-pink-500/5",
    border: "border-purple-500/20",
  },
  {
    icon: Send,
    title: "Pengiriman Otomatis ke WhatsApp & Email",
    badge: "Otomasi Instan",
    description:
      "Setiap pembelian otomatis diverifikasi webhook Midtrans. File digital, lisensi, atau tautan privat langsung dikirimkan ke email dan nomor WhatsApp pembeli secara instan.",
    accent: "from-amber-500/10 to-orange-500/5",
    border: "border-amber-500/20",
  },
  {
    icon: BarChart3,
    title: "Analitik Trafik, CTR & Omset Real-time",
    badge: "Wawasan Data",
    description:
      "Ketahui persis kartu mana yang paling banyak diklik pengunjung, rasio konversi checkout produk, akumulasi omset harian, hingga pelacakan UTM parameter campaign.",
    accent: "from-sky-500/10 to-cyan-500/5",
    border: "border-sky-500/20",
  },
  {
    icon: ShieldCheck,
    title: "Signed Expiring Link & Anti-Bocor",
    badge: "Proteksi File",
    description:
      "File jualanmu aman di penyimpanan ImageKit & private cloud. Link unduhan dibuat dengan token kedaluwarsa berkala sehingga tidak bisa disebarluaskan sembarangan.",
    accent: "from-emerald-500/10 to-green-500/5",
    border: "border-emerald-500/20",
  },
];

// FAQs Data
const faqs = [
  {
    question: "Apakah OpenLynk benar-benar gratis untuk digunakan?",
    answer:
      "Ya, 100% gratis selamanya untuk paket Starter. Anda tidak perlu memasukkan kartu kredit untuk mendaftar. Anda langsung mendapatkan 1 profil bento lengkap, katalog produk digital tanpa batas, integrasi pembayaran QRIS, dan fitur embed Spotify & YouTube.",
  },
  {
    question: "Bagaimana cara kerja Checkout 1 Halaman tanpa redirect?",
    answer:
      "Ketika pengunjung mengetuk tombol produk di link bio Anda, lembar checkout (bottom sheet) langsung terbuka dari bawah layar tanpa memuat halaman baru. Pengunjung cukup memindai QRIS dari aplikasi e-wallet apa saja (GoPay, OVO, ShopeePay, Dana, BCA, dll). Seketika pembayaran selesai, tombol unduh file aktif di tempat. Konversi terbukti naik drastis karena pengunjung tidak drop-off akibat loading lama.",
  },
  {
    question: "Metode pembayaran apa saja yang bisa digunakan pembeli?",
    answer:
      "OpenLynk terhubung dengan Midtrans Payment Gateway resmi. Pembeli di Indonesia dapat membayar menggunakan QRIS instan dari semua bank dan e-wallet, serta Virtual Account (BCA, Mandiri, BNI, BRI, Permata). Kami juga menyediakan sistem Sandbox instan untuk menguji alur pembayaran kapan saja.",
  },
  {
    question: "Produk apa saja yang cocok dijual melalui OpenLynk?",
    answer:
      "Semua jenis produk digital: Ebook PDF, Preset Lightroom, template Notion & Canva, UI/UX Kit Figma, source code & boilerplate, video rekaman webinar, lembar kerja spreadsheet, aset audio/SFX, hingga tiket sesi mentoring privat 1-on-1.",
  },
  {
    question: "Apakah saya bisa menggunakan domain sendiri?",
    answer:
      "Bisa! Di paket Pro Kreator, Anda dapat menghubungkan custom domain personal seperti 'bio.namakamu.com' atau 'link.brandkamu.id' lengkap dengan sertifikat SSL otomatis dan tanpa watermark OpenLynk.",
  },
];

export default function Home() {
  const router = useRouter();
  const [claimSlug, setClaimSlug] = useState("");
  const [isAnnual, setIsAnnual] = useState(true);
  const [activeMockTab, setActiveMockTab] = useState<"bento" | "checkout" | "embeds" | "analytics">("bento");

  function handleClaimSubmit(e: React.FormEvent) {
    e.preventDefault();
    const clean = claimSlug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
    if (clean) {
      router.push(`/klaim?slug=${encodeURIComponent(clean)}`);
    } else {
      router.push("/klaim");
    }
  }

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-zinc-900">
      {/* Sleek Floating Navbar */}
      <NavbarShell />

      {/* Main Page Body */}
      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-24">
          {/* Subtle Ambient Radial Glow & Dot Matrix */}
          <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center overflow-hidden">
            <div className="absolute top-1/4 h-[500px] w-[600px] sm:w-[900px] rounded-full bg-gradient-to-tr from-emerald-500/15 via-blue-500/10 to-indigo-500/15 blur-[120px] dark:from-emerald-500/20 dark:via-blue-500/15 dark:to-indigo-500/20" />
            <div
              className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07]"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                backgroundSize: "24px 24px",
              }}
            />
          </div>

          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
            {/* Announcement Badge */}
            <Link
              href="/demo"
              className="group inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/80 px-3.5 py-1.5 text-xs font-medium text-foreground backdrop-blur-md shadow-xs transition-all hover:border-emerald-500/40 hover:bg-card"
            >
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">OpenLynk v2.0</span>
              <span className="text-muted-foreground">• 1-Tap QRIS Checkout & Bento Grid</span>
              <span className="text-muted-foreground group-hover:translate-x-0.5 transition-transform">
                →
              </span>
            </Link>

            {/* Hero Main Headline */}
            <h1 className="mt-6 font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.12] max-w-4xl">
              Satu Link Bento Estetik untuk{" "}
              <span className="bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-500 bg-clip-text text-transparent dark:from-white dark:via-zinc-200 dark:to-zinc-400">
                Semua Karya & Jualanmu
              </span>
            </h1>

            {/* Hero Subtitle */}
            <p className="mt-5 max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
              Tinggalkan link bio yang membosankan. Gabungkan link profil, pemutar Spotify,
              video YouTube, dan toko produk digital dengan{" "}
              <strong className="text-foreground font-semibold">
                checkout 1-halaman tanpa redirect
              </strong>
              . Terima pembayaran QRIS otomatis dalam 2 menit.
            </p>

            {/* High-Converting Slug Claim Bar */}
            <form
              onSubmit={handleClaimSubmit}
              className="mt-8 flex w-full max-w-md flex-col sm:flex-row items-center gap-2 rounded-2xl sm:rounded-full border border-border/90 bg-card/90 p-1.5 shadow-lg shadow-zinc-950/5 backdrop-blur-md focus-within:border-zinc-500 dark:focus-within:border-zinc-400 transition-all"
            >
              <div className="flex w-full sm:w-auto flex-1 items-center px-3 py-1">
                <span className="text-xs sm:text-sm font-semibold text-muted-foreground select-none">
                  openlynk.id/
                </span>
                <input
                  type="text"
                  placeholder="namamu"
                  value={claimSlug}
                  onChange={(e) => setClaimSlug(e.target.value)}
                  className="w-full bg-transparent px-1.5 py-1 text-xs sm:text-sm font-bold text-foreground outline-none placeholder:text-muted-foreground/60 placeholder:font-normal"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-zinc-900 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-zinc-800 active:scale-98 transition-all dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
              >
                <span>Klaim Sekarang</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            {/* Quick Proof Pills */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Gratis Selamanya
              </span>
              <span className="text-border">•</span>
              <span className="inline-flex items-center gap-1.5 font-medium">
                <Zap className="h-4 w-4 text-amber-500" />
                QRIS & Midtrans Otomatis
              </span>
              <span className="text-border">•</span>
              <span className="inline-flex items-center gap-1.5 font-medium">
                <Smartphone className="h-4 w-4 text-blue-500" />
                Checkout Tanpa Redirect
              </span>
            </div>
          </div>

          {/* INTERACTIVE SHOWCASE DEVICE MOCKUP */}
          <div id="showcase" className="mt-14 sm:mt-20 mx-auto max-w-4xl px-4">
            {/* Interactive Showcase Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
              <button
                type="button"
                onClick={() => setActiveMockTab("bento")}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                  activeMockTab === "bento"
                    ? "bg-zinc-900 text-white shadow-xs dark:bg-white dark:text-zinc-900"
                    : "border border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                1. Tampilan Profil Bento
              </button>
              <button
                type="button"
                onClick={() => setActiveMockTab("checkout")}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                  activeMockTab === "checkout"
                    ? "bg-zinc-900 text-white shadow-xs dark:bg-white dark:text-zinc-900"
                    : "border border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                2. Checkout 1-Halaman (Drawer)
              </button>
              <button
                type="button"
                onClick={() => setActiveMockTab("embeds")}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                  activeMockTab === "embeds"
                    ? "bg-zinc-900 text-white shadow-xs dark:bg-white dark:text-zinc-900"
                    : "border border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                3. Spotify & Video Embeds
              </button>
              <button
                type="button"
                onClick={() => setActiveMockTab("analytics")}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                  activeMockTab === "analytics"
                    ? "bg-zinc-900 text-white shadow-xs dark:bg-white dark:text-zinc-900"
                    : "border border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                4. Analitik & Omset
              </button>
            </div>

            {/* Device Container Frame */}
            <div className="relative rounded-3xl border border-border/80 bg-gradient-to-b from-card via-card to-muted/30 p-4 sm:p-6 shadow-2xl shadow-zinc-950/10 backdrop-blur-md">
              {/* Window Header */}
              <div className="flex items-center justify-between pb-4 border-b border-border/60">
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500/80" />
                  <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                </div>
                <div className="flex items-center gap-2 rounded-full border border-border bg-background/80 px-3.5 py-1 text-[11px] font-semibold text-muted-foreground">
                  <Globe className="h-3 w-3 text-emerald-500" />
                  <span>openlynk.id/alexpratama</span>
                </div>
                <Link
                  href="/demo"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground hover:text-emerald-500 transition-colors"
                >
                  <span className="hidden sm:inline">Coba Live Demo</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Dynamic Mockup Body Based on Tab */}
              <div className="pt-6 pb-2 min-h-[420px] flex flex-col justify-between">
                {activeMockTab === "bento" && (
                  <div>
                    {/* Profile Header */}
                    <div className="flex flex-col items-center text-center">
                      <div className="relative">
                        <div className="h-18 w-18 sm:h-20 sm:w-20 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-500 p-0.5 shadow-md">
                          <div className="flex h-full w-full items-center justify-center rounded-full bg-zinc-900 font-display text-2xl font-bold text-white">
                            AP
                          </div>
                        </div>
                        <span className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white shadow-xs">
                          <Check className="h-3.5 w-3.5 stroke-[3]" />
                        </span>
                      </div>
                      <h3 className="mt-3 font-display text-xl font-bold">Alex Pratama</h3>
                      <p className="text-xs text-muted-foreground max-w-sm mt-0.5">
                        Tech Creator & Indie Hacker 🚀 Berbagi insight bento design, coding, & tips cuan produk digital.
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                          <Video className="h-3 w-3 text-red-500" /> 120K Subscribers
                        </span>
                        <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                          <Music className="h-3 w-3 text-emerald-500" /> Creator Talks
                        </span>
                      </div>
                    </div>

                    {/* Mini Bento Grid */}
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Product Card */}
                      <div className="sm:col-span-2 rounded-2xl border border-emerald-500/30 bg-emerald-50/50 p-4 shadow-sm dark:bg-emerald-950/20">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                PRODUK UNGGULAN
                              </span>
                              <span className="text-[10px] text-muted-foreground">Digital PDF</span>
                            </div>
                            <h4 className="mt-1.5 font-display text-sm font-bold text-foreground">
                              Ebook Master Guide Bento Grid 2026
                            </h4>
                            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                              Panduan lengkap menata link-in-bio konversi tinggi + 20 template Figma.
                            </p>
                            <div className="mt-3 flex items-center gap-3">
                              <span className="font-display text-base font-bold text-foreground">
                                {formatIDR(79000)}
                              </span>
                              <button
                                type="button"
                                onClick={() => setActiveMockTab("checkout")}
                                className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow-xs hover:bg-emerald-500 transition-colors"
                              >
                                <Zap className="h-3 w-3" />
                                Beli Instan (1-Halaman)
                              </button>
                            </div>
                          </div>
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 font-bold text-xs border border-emerald-500/20">
                            EBOOK
                          </div>
                        </div>
                      </div>

                      {/* Spotify Card */}
                      <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                            <Music className="h-3.5 w-3.5" /> Spotify
                          </span>
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                        </div>
                        <div className="my-2">
                          <p className="text-xs font-bold text-foreground line-clamp-1">
                            Creator Talk #42: Rahasia Cuan Bio
                          </p>
                          <p className="text-[11px] text-muted-foreground">Putar langsung di bio</p>
                        </div>
                        <div className="flex items-center gap-2 rounded-lg bg-muted p-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white">
                            <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="h-1.5 w-full rounded-full bg-border" />
                            <div className="h-1.5 w-2/3 rounded-full bg-emerald-500" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeMockTab === "checkout" && (
                  <div className="flex flex-col items-center justify-center py-4">
                    {/* Drawer Simulation Container */}
                    <div className="w-full max-w-md rounded-2xl border-2 border-emerald-500/40 bg-card p-5 shadow-xl relative">
                      <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-border" />
                      <div className="flex items-center justify-between border-b border-border/60 pb-3">
                        <div>
                          <Badge variant="outline" className="text-emerald-600 border-emerald-500/30">
                            ⚡ Quick Checkout (Tanpa Redirect)
                          </Badge>
                          <h4 className="mt-1 font-display text-sm font-bold">
                            Ebook Master Guide Bento Grid 2026
                          </h4>
                        </div>
                        <span className="font-display text-base font-extrabold text-foreground">
                          {formatIDR(79000)}
                        </span>
                      </div>

                      {/* QRIS Graphic Mockup */}
                      <div className="my-4 flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 p-4 text-center">
                        <div className="h-28 w-28 rounded-lg bg-white p-2 shadow-sm flex items-center justify-center border">
                          <div className="grid grid-cols-5 gap-1 w-full h-full p-1 bg-zinc-950 rounded">
                            <div className="bg-white col-span-2 row-span-2 rounded-xs" />
                            <div className="bg-white col-span-1" />
                            <div className="bg-white col-span-2 row-span-2 rounded-xs" />
                            <div className="bg-white col-span-1" />
                            <div className="bg-white col-span-1" />
                            <div className="bg-white col-span-5" />
                          </div>
                        </div>
                        <p className="mt-2 text-xs font-semibold text-foreground">
                          Scan QRIS dengan GoPay, OVO, BCA, atau Livin Mandiri
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Verifikasi instan Midtrans • Langsung unduh file
                        </p>
                      </div>

                      <div className="rounded-lg bg-emerald-500/10 p-2.5 text-center text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                        ✓ File otomatis terkirim ke WhatsApp & email pembeli
                      </div>
                    </div>
                  </div>
                )}

                {activeMockTab === "embeds" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
                    {/* Spotify Deep Embed */}
                    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Music className="h-5 w-5 text-emerald-500" />
                          <span className="font-display text-sm font-bold">Spotify Player Bio</span>
                        </div>
                        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                          NATIVE EMBED
                        </span>
                      </div>
                      <div className="my-4 flex items-center gap-3 rounded-xl bg-muted/60 p-3">
                        <div className="h-12 w-12 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold text-xs">
                          ALBUM
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-foreground">Membangun Produk Digital di 2026</p>
                          <p className="text-[11px] text-muted-foreground">Alex Pratama & Rekan</p>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                          <Play className="h-4 w-4 fill-current ml-0.5" />
                        </div>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Pengunjung dapat mendengarkan lagu atau podcast tanpa perlu beralih ke Spotify app.
                      </p>
                    </div>

                    {/* YouTube Video Deep Embed */}
                    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Video className="h-5 w-5 text-red-500" />
                          <span className="font-display text-sm font-bold">YouTube Video Bio</span>
                        </div>
                        <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-600">
                          AUTOPLAY HD
                        </span>
                      </div>
                      <div className="my-4 relative rounded-xl bg-zinc-900 aspect-video flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white shadow-md">
                          <Play className="h-5 w-5 fill-current ml-0.5" />
                        </div>
                        <span className="absolute bottom-2 left-3 text-xs font-semibold text-white">
                          Tutorial Setup OpenLynk 3 Menit
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Putar video YouTube langsung di dalam kartu bento responsif.
                      </p>
                    </div>
                  </div>
                )}

                {activeMockTab === "analytics" && (
                  <div className="space-y-4 py-2">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="rounded-xl border border-border bg-card p-3 shadow-xs">
                        <span className="text-[11px] font-medium text-muted-foreground">Total Pengunjung</span>
                        <p className="font-display text-xl font-extrabold text-foreground mt-0.5">24.580</p>
                        <span className="text-[10px] font-bold text-emerald-600">↑ +18.4% bulan ini</span>
                      </div>
                      <div className="rounded-xl border border-border bg-card p-3 shadow-xs">
                        <span className="text-[11px] font-medium text-muted-foreground">Klik Link Bio</span>
                        <p className="font-display text-xl font-extrabold text-foreground mt-0.5">8.940</p>
                        <span className="text-[10px] font-bold text-emerald-600">CTR 36.4%</span>
                      </div>
                      <div className="rounded-xl border border-border bg-card p-3 shadow-xs">
                        <span className="text-[11px] font-medium text-muted-foreground">Order Selesai</span>
                        <p className="font-display text-xl font-extrabold text-foreground mt-0.5">142</p>
                        <span className="text-[10px] font-bold text-emerald-600">Konversi 4.2%</span>
                      </div>
                      <div className="rounded-xl border border-border bg-card p-3 shadow-xs">
                        <span className="text-[11px] font-medium text-muted-foreground">Omset Penjualan</span>
                        <p className="font-display text-xl font-extrabold text-emerald-600 mt-0.5">
                          {formatIDR(11218000)}
                        </p>
                        <span className="text-[10px] font-bold text-muted-foreground">QRIS & VA Bank</span>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
                          <TrendingUp className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground">Analitik Real-time & Ekspor CSV</p>
                          <p className="text-[11px] text-muted-foreground">
                            Pantau tautan mana yang paling menghasilkan profit tanpa butuh Google Analytics rumit.
                          </p>
                        </div>
                      </div>
                      <Link
                        href="/demo"
                        className="rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 transition-colors dark:bg-white dark:text-zinc-900"
                      >
                        Lihat Data Lengkap
                      </Link>
                    </div>
                  </div>
                )}

                {/* Bottom Callout Bar inside Mockup */}
                <div className="mt-4 rounded-xl border border-zinc-900/10 bg-zinc-900 text-white p-3 sm:p-4 flex items-center justify-between gap-3 shadow-md dark:bg-zinc-800">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-zinc-950 font-bold">
                      <QrCode className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold">Cobalah Pengalaman Checkout Nyata</p>
                      <p className="text-[11px] text-zinc-300">
                        Buka demo dan rasakan betapa ringannya transaksi tanpa redirect.
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/demo"
                    className="shrink-0 rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-zinc-950 hover:bg-zinc-100 transition-colors"
                  >
                    Buka Live Demo
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TRUST & METRICS BAR */}
        <section className="border-y border-border/60 bg-muted/20 py-10">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 text-center">
              <div>
                <p className="font-display text-3xl font-extrabold text-foreground sm:text-4xl">
                  &lt; 2 Menit
                </p>
                <p className="mt-1 text-xs sm:text-sm font-medium text-muted-foreground">
                  Setup Cepat Siap Online
                </p>
              </div>
              <div>
                <p className="font-display text-3xl font-extrabold text-emerald-600 sm:text-4xl">
                  3x Lipat
                </p>
                <p className="mt-1 text-xs sm:text-sm font-medium text-muted-foreground">
                  Konversi Tanpa Redirect
                </p>
              </div>
              <div>
                <p className="font-display text-3xl font-extrabold text-foreground sm:text-4xl">
                  Rp 0
                </p>
                <p className="mt-1 text-xs sm:text-sm font-medium text-muted-foreground">
                  Biaya Bulanan Paket Starter
                </p>
              </div>
              <div>
                <p className="font-display text-3xl font-extrabold text-foreground sm:text-4xl">
                  100%
                </p>
                <p className="mt-1 text-xs sm:text-sm font-medium text-muted-foreground">
                  QRIS Otomatis & Midtrans
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CREATOR ARCHETYPES SECTION */}
        <section className="py-20 sm:py-24">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto">
              <Badge variant="secondary">
                DIRANCANG UNTUK SIAPA SAJA
              </Badge>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Satu Platform untuk Berbagai Jenis Kreator
              </h2>
              <p className="mt-3 text-muted-foreground text-sm sm:text-base">
                Apapun keahlian atau produk digital yang Anda tawarkan, OpenLynk menyesuaikan dengan gaya unik Anda.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {creatorTypes.map((c) => {
                const Icon = c.icon;
                return (
                  <div
                    key={c.title}
                    className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs transition-all hover:-translate-y-1 hover:shadow-md hover:border-zinc-400 dark:hover:border-zinc-600 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
                          <Icon className="h-5 w-5" />
                        </div>
                        <Badge variant="outline" className="text-[10px]">
                          {c.badge}
                        </Badge>
                      </div>
                      <h3 className="mt-4 font-display text-base font-bold text-foreground">
                        {c.title}
                      </h3>
                      <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                        {c.desc}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-border/60">
                      <span className="font-mono text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        {c.tagline}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* BENTO FEATURE HIGHLIGHTS */}
        <section id="fitur" className="py-20 bg-muted/20 border-y border-border/60">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto">
              <Badge variant="secondary">
                FITUR LENGKAP V2.0
              </Badge>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Semua Kebutuhan Toko & Bio Kreator
              </h2>
              <p className="mt-3 text-muted-foreground text-sm sm:text-base">
                OpenLynk dibuat khusus agar pengalaman pengunjung sangat cepat, nyaman, dan menghasilkan penjualan maksimal.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {coreFeatures.map((feat) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={feat.title}
                    className={`rounded-2xl border ${feat.border} bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md flex flex-col justify-between`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xs">
                          <Icon className="h-5 w-5" />
                        </div>
                        <Badge variant="secondary" className="text-[10px]">
                          {feat.badge}
                        </Badge>
                      </div>
                      <h3 className="mt-4 font-display text-lg font-bold text-foreground">
                        {feat.title}
                      </h3>
                      <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {feat.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* COMPARISON MATRIX (OPENLYNK VS TRADITIONAL) */}
        <section id="perbandingan" className="py-20 sm:py-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <div className="text-center max-w-xl mx-auto mb-12">
              <Badge variant="secondary">
                PERBANDINGAN
              </Badge>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Mengapa Kreator Pindah ke OpenLynk?
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Bandingkan langsung kemudahan OpenLynk v2.0 dengan link-in-bio konvensional.
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="grid grid-cols-3 border-b border-border bg-muted/50 p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <div className="col-span-1">Fitur & Pengalaman</div>
                <div className="text-center font-extrabold text-foreground">OpenLynk v2.0</div>
                <div className="text-center text-muted-foreground">Linktree / Konvensional</div>
              </div>

              <div className="divide-y divide-border/60 text-xs sm:text-sm">
                <div className="grid grid-cols-3 p-4 items-center">
                  <span className="font-semibold text-foreground">Format Layout Profil</span>
                  <span className="text-center font-bold text-emerald-600 dark:text-emerald-400">
                    Bento Grid 2D Interaktif
                  </span>
                  <span className="text-center text-muted-foreground">Daftar Tombol Vertikal Kaku</span>
                </div>

                <div className="grid grid-cols-3 p-4 items-center">
                  <span className="font-semibold text-foreground">Alur Checkout Toko</span>
                  <span className="text-center font-bold text-emerald-600 dark:text-emerald-400">
                    1-Halaman (Bottom Sheet QRIS)
                  </span>
                  <span className="text-center text-muted-foreground">Redirect Halaman Eksternal</span>
                </div>

                <div className="grid grid-cols-3 p-4 items-center">
                  <span className="font-semibold text-foreground">Pembayaran Indonesia</span>
                  <span className="text-center font-bold text-emerald-600 dark:text-emerald-400">
                    QRIS Instan & VA Seluruh Bank
                  </span>
                  <span className="text-center text-muted-foreground">PayPal / Kartu Kredit Rumit</span>
                </div>

                <div className="grid grid-cols-3 p-4 items-center">
                  <span className="font-semibold text-foreground">Pengiriman File Digital</span>
                  <span className="text-center font-bold text-emerald-600 dark:text-emerald-400">
                    Otomatis ke WhatsApp & Email
                  </span>
                  <span className="text-center text-muted-foreground">Kirim manual satu per satu</span>
                </div>

                <div className="grid grid-cols-3 p-4 items-center">
                  <span className="font-semibold text-foreground">Embed Spotify & YouTube</span>
                  <span className="text-center font-bold text-emerald-600 dark:text-emerald-400">
                    Putar langsung di Bio
                  </span>
                  <span className="text-center text-muted-foreground">Hanya link teks biasa</span>
                </div>

                <div className="grid grid-cols-3 p-4 items-center">
                  <span className="font-semibold text-foreground">Biaya Awal</span>
                  <span className="text-center font-bold text-emerald-600 dark:text-emerald-400">
                    Rp 0 (Starter Selamanya)
                  </span>
                  <span className="text-center text-muted-foreground">Biaya bulanan Rp 150rb+/bln</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3-STEP ONBOARDING */}
        <section className="py-20 bg-muted/20 border-t border-border/60">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Mulai dalam 3 Langkah Mudah
            </h2>
            <p className="mt-3 text-muted-foreground text-sm sm:text-base max-w-lg mx-auto">
              Halaman bento siap tayang dan jualan Anda langsung aktif dalam waktu kurang dari 3 menit.
            </p>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm relative">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-white font-display text-sm font-bold dark:bg-white dark:text-zinc-900">
                  1
                </span>
                <h3 className="mt-4 font-display text-lg font-bold">Klaim Username Unik</h3>
                <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Amankan alamat link personal Anda seperti <code className="text-foreground font-semibold">openlynk.id/namamu</code> sebelum diambil orang lain.
                </p>
              </div>

              <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm relative">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-white font-display text-sm font-bold dark:bg-white dark:text-zinc-900">
                  2
                </span>
                <h3 className="mt-4 font-display text-lg font-bold">Tata Bento & Pasang Produk</h3>
                <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Tambahkan kartu sosial, pemutar Spotify, video YouTube, dan upload produk digitalmu dengan pengiriman file otomatis.
                </p>
              </div>

              <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm relative">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-white font-display text-sm font-bold dark:bg-white dark:text-zinc-900">
                  3
                </span>
                <h3 className="mt-4 font-display text-lg font-bold">Bagikan Bio & Terima Cuan</h3>
                <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Pasang link di bio Instagram atau TikTok. Pengunjung dapat langsung bayar QRIS tanpa pernah meninggalkan profil Anda.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING SECTION */}
        <section id="harga" className="py-20 sm:py-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto">
              <Badge variant="secondary">
                HARGA TRANSPARAN
              </Badge>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Mulai Gratis, Upgrade Kapan Saja
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Tidak ada biaya tersembunyi. Mulai gratis tanpa butuh kartu kredit.
              </p>

              {/* Billing Cycle Toggle */}
              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-card p-1 shadow-xs">
                <button
                  type="button"
                  onClick={() => setIsAnnual(false)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                    !isAnnual
                      ? "bg-zinc-900 text-white shadow-xs dark:bg-white dark:text-zinc-900"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Bulanan
                </button>
                <button
                  type="button"
                  onClick={() => setIsAnnual(true)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    isAnnual
                      ? "bg-zinc-900 text-white shadow-xs dark:bg-white dark:text-zinc-900"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>Tahunan</span>
                  <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[10px] text-emerald-600 font-bold dark:text-emerald-400">
                    HEMAT 20%
                  </span>
                </button>
              </div>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              {/* Starter Plan */}
              <div className="rounded-3xl border border-border/80 bg-card p-8 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="font-display text-xl font-bold text-foreground">Starter</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Untuk kreator pemula yang baru mulai membangun profil dan katalog produk digital.
                  </p>
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="font-display text-4xl font-extrabold text-foreground">
                      {formatIDR(0)}
                    </span>
                    <span className="text-xs text-muted-foreground">/selamanya</span>
                  </div>

                  <ul className="mt-6 space-y-3 text-xs sm:text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span><strong>1 Halaman</strong> profil bento lengkap</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>Katalog produk digital <strong>tanpa batas</strong></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>Checkout 1-halaman (Bottom Sheet)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>Integrasi Midtrans QRIS & VA Bank</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>Embed Spotify, YouTube, & Countdown Timer</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>Fee transaksi 5% per penjualan berhasil</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-8">
                  <Link href="/klaim" className="block w-full">
                    <button
                      type="button"
                      className="w-full rounded-full border border-border bg-background py-3 text-xs sm:text-sm font-semibold text-foreground shadow-xs hover:bg-muted transition-all"
                    >
                      Mulai Gratis Sekarang
                    </button>
                  </Link>
                </div>
              </div>

              {/* Pro Plan */}
              <div className="rounded-3xl border-2 border-zinc-900 bg-card p-8 shadow-xl flex flex-col justify-between relative dark:border-white">
                <div className="absolute -top-3.5 right-6 rounded-full bg-zinc-900 px-3 py-1 text-[11px] font-bold text-white shadow-xs dark:bg-white dark:text-zinc-900">
                  PALING POPULER
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-foreground">Pro Kreator</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Untuk kreator profesional, brand, dan toko yang menginginkan branding maksimal.
                  </p>
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="font-display text-4xl font-extrabold text-foreground">
                      {formatIDR(isAnnual ? 79000 : 99000)}
                    </span>
                    <span className="text-xs text-muted-foreground">/bulan</span>
                  </div>

                  <ul className="mt-6 space-y-3 text-xs sm:text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span><strong>Halaman tanpa batas</strong> profil bento</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span><strong>Custom Domain</strong> (bio.namamu.com)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span><strong>Tanpa Watermark</strong> branding OpenLynk</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>Fee transaksi lebih hemat <strong>(hanya 3%)</strong></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>Analitik lengkap, ekspor CSV & UTM tracker</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>Bantuan prioritas via WhatsApp 24/7</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-8">
                  <Link href="/klaim" className="block w-full">
                    <button
                      type="button"
                      className="w-full rounded-full bg-zinc-900 py-3 text-xs sm:text-sm font-semibold text-white shadow-md hover:bg-zinc-800 transition-all dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
                    >
                      Tingkatkan ke Pro
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section id="faq" className="py-20 bg-muted/20 border-t border-border/60">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <div className="text-center mb-10">
              <Badge variant="secondary">
                TANYA JAWAB
              </Badge>
              <h2 className="mt-3 font-display text-2xl sm:text-3xl font-bold">
                Pertanyaan yang Sering Diajukan
              </h2>
            </div>

            <Accordion defaultValue={["faq-0"]} className="space-y-3">
              {faqs.map((faq, idx) => (
                <AccordionItem
                  key={faq.question}
                  value={`faq-${idx}`}
                  className="rounded-2xl border border-border/80 bg-card px-5 shadow-xs"
                >
                  <AccordionTrigger className="py-5 text-left font-display text-sm sm:text-base font-semibold text-foreground hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="pb-5 pt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* BOTTOM HIGH-IMPACT CTA */}
        <section className="py-20 text-center relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
            <div className="h-72 w-96 rounded-full bg-emerald-500/10 blur-[100px] dark:bg-emerald-500/15" />
          </div>

          <div className="mx-auto max-w-4xl px-4">
            <Badge variant="outline" className="text-emerald-600 border-emerald-500/30 mb-3">
              ✨ Mulai Hari Ini
            </Badge>
            <h2 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
              Siap Ubah Link Bio Menjadi Mesin Penjualan?
            </h2>
            <p className="mt-4 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
              Bangun halaman profil bento estetikmu sekarang. Gratis, 2 menit selesai, dan langsung siap terima pembayaran QRIS otomatis.
            </p>

            <form
              onSubmit={handleClaimSubmit}
              className="mt-8 mx-auto flex w-full max-w-md flex-col sm:flex-row items-center gap-2 rounded-2xl sm:rounded-full border border-border/90 bg-card/90 p-1.5 shadow-lg backdrop-blur-md focus-within:border-zinc-500 dark:focus-within:border-zinc-400 transition-all"
            >
              <div className="flex w-full sm:w-auto flex-1 items-center px-3 py-1">
                <span className="text-xs sm:text-sm font-semibold text-muted-foreground select-none">
                  openlynk.id/
                </span>
                <input
                  type="text"
                  placeholder="namamu"
                  value={claimSlug}
                  onChange={(e) => setClaimSlug(e.target.value)}
                  className="w-full bg-transparent px-1.5 py-1 text-xs sm:text-sm font-bold text-foreground outline-none placeholder:text-muted-foreground/60 placeholder:font-normal"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-zinc-900 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-zinc-800 active:scale-98 transition-all dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
              >
                <span>Klaim Sekarang</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="mt-6 flex items-center justify-center gap-4">
              <Link
                href="/demo"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                <Play className="h-3 w-3 fill-current text-emerald-500" />
                <span>Lihat Contoh Live Demo</span>
              </Link>
              <span className="text-border">•</span>
              <Link
                href="/jelajahi"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                <span>Jelajahi Kreator Lain</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <HomeFooter />
    </div>
  );
}
