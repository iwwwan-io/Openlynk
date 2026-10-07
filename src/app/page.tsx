"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Sparkles,
  ArrowRight,
  ExternalLink,
  Check,
  ShoppingBag,
  LayoutGrid,
  Zap,
  BarChart3,
  Music,
  Video,
  Timer,
  CreditCard,
  Globe,
  Layers,
  Play,
  QrCode,
  Tag,
} from "lucide-react";
import { NavbarShell, HomeFooter } from "@/components/site";
import { GradientButton } from "@/components/primitives";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { formatIDR } from "@/lib/types";

const features = [
  {
    icon: LayoutGrid,
    title: "Bento Grid Fleksibel 2D",
    badge: "Desain Bebas",
    description:
      "Tinggalkan daftar link vertikal yang membosankan. Susun kartu dalam ukuran 1x1, 2x1, 2x2, hingga 4x2 dengan sekat grup kategori (Social, Store, Media).",
  },
  {
    icon: ShoppingBag,
    title: "Checkout 1 Halaman Tanpa Redirect",
    badge: "Konversi Tinggi",
    description:
      "Pembeli tidak dialihkan ke halaman lain. Bottom sheet muncul di tempat, bayar QRIS atau VA bank otomatis, dan langsung unduh file di halaman yang sama.",
  },
  {
    icon: Music,
    title: "Embed Spotify & YouTube Langsung",
    badge: "Multimedia Bio",
    description:
      "Sematkan episode podcast atau playlist Spotify favoritmu. Putar video YouTube langsung di bio tanpa membuka aplikasi lain.",
  },
  {
    icon: CreditCard,
    title: "100% Produk Digital & Lisensi",
    badge: "Otomatisasi Penuh",
    description:
      "Jual ebook, preset, source code, aset desain, hingga konsultasi digital. Dilengkapi proteksi signed expiring download URL dan integrasi WhatsApp.",
  },
  {
    icon: Layers,
    title: "Studio Visual Easy Click-to-Edit",
    badge: "1-Klik Ubah",
    description:
      "Cukup klik kartu apa saja di layar preview editor dashboard untuk mengubah judul, link, harga, gambar, atau ukuran secara instan.",
  },
  {
    icon: BarChart3,
    title: "Analitik Trafik & Omset Real-time",
    badge: "Wawasan Lengkap",
    description:
      "Pantau total views pengunjung, statistik klik per link, rasio konversi (CTR), akumulasi omset penjualan, dan subscriber newsletter.",
  },
];

const faqs = [
  {
    question: "Apakah OpenLynk benar-benar bisa digunakan secara gratis?",
    answer:
      "Ya, 100% gratis! Paket Starter bebas biaya langganan bulanan selamanya tanpa butuh kartu kredit. Anda bisa membuat 1 halaman bento, memasang produk digital tanpa batas, dan langsung menerima pembayaran QRIS.",
  },
  {
    question: "Bagaimana cara kerja Checkout 1 Halaman tanpa redirect?",
    answer:
      "Saat pengunjung mengklik tombol produk di bio Anda, drawer detail dan checkout langsung muncul dari bawah (bottom sheet) di halaman yang sama. Pengunjung membayar lewat QRIS atau Virtual Account Midtrans, dan seketika tombol unduh file terbuka tanpa pernah meninggalkan profil Anda. Ini terbukti menaikkan konversi hingga 3x lipat dibanding checkout multi-halaman tradisional.",
  },
  {
    question: "Metode pembayaran apa saja yang didukung untuk pembeli?",
    answer:
      "OpenLynk terintegrasi dengan Midtrans yang mendukung QRIS (bisa di-scan oleh GoPay, OVO, ShopeePay, Dana, LinkAja, BCA, Livin Mandiri, BRI, dll) serta Virtual Account seluruh bank ternama di Indonesia. Terdapat juga mode Sandbox instan untuk simulasi pembayaran.",
  },
  {
    question: "Produk apa saja yang bisa saya jual di OpenLynk?",
    answer:
      "Anda dapat menjual aneka produk digital (Ebook PDF, preset Lightroom, template Notion & Canva, file audio/musik, software, lembar kerja, link privat) yang terkirim otomatis secara instan via email dan tautan unduhan aman setelah pembayaran terkonfirmasi.",
  },
  {
    question: "Apakah saya perlu mengerti teknis atau bahasa pemrograman?",
    answer:
      "Sama sekali tidak. OpenLynk dirancang sangat ramah pengguna dengan antarmuka studio visual. Cukup klaim slug, ketik nama atau tautan, dan halaman bento profesional Anda siap dibagikan ke Instagram, TikTok, atau X.",
  },
];

export default function Home() {
  const router = useRouter();
  const [claimSlug, setClaimSlug] = useState("");
  const [isAnnual, setIsAnnual] = useState(false);

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
      {/* Navbar */}
      <NavbarShell>
        <div className="hidden items-center gap-x-1 text-sm font-medium text-muted-foreground md:flex">
          <a
            href="#fitur"
            className="inline-flex min-h-[44px] items-center rounded-lg px-3 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          >
            Fitur
          </a>
          <a
            href="#showcase"
            className="inline-flex min-h-[44px] items-center rounded-lg px-3 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          >
            Showcase
          </a>
          <a
            href="#harga"
            className="inline-flex min-h-[44px] items-center rounded-lg px-3 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          >
            Harga
          </a>
          <a
            href="#faq"
            className="inline-flex min-h-[44px] items-center rounded-lg px-3 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          >
            FAQ
          </a>
          <Link
            href="/jelajahi"
            className="inline-flex min-h-[44px] items-center rounded-lg px-3 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          >
            Jelajahi
          </Link>
        </div>
        <Link
          href="/demo"
          aria-label="Lihat live demo OpenLynk"
          className="hidden min-h-[44px] items-center gap-1.5 rounded-full border border-border px-4 text-xs font-semibold text-muted-foreground transition-all hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground sm:inline-flex"
        >
          <Play className="h-3 w-3 fill-current" aria-hidden />
          Live Demo
        </Link>
        <Link
          href="/masuk"
          className="hidden min-h-[44px] items-center rounded-full px-4 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground sm:inline-flex"
        >
          Masuk
        </Link>
        <Link href="/klaim" aria-label="Klaim halaman OpenLynk gratis">
          <GradientButton className="!min-h-[44px] !px-5 !py-2.5 !text-sm">
            Mulai Gratis
          </GradientButton>
        </Link>
      </NavbarShell>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-24">
          {/* Subtle Ambient Background Gradients */}
          <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 -translate-x-1/2 transform-gpu blur-3xl sm:-top-80">
            <div
              className="aspect-[1155/678] w-[68rem] bg-gradient-to-tr from-emerald-500/20 via-zinc-400/20 to-sky-500/20 opacity-40 dark:opacity-20"
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
            />
          </div>

          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
            {/* Top Pill Announcement */}
            <Link
              href="/demo"
              className="group animate-fade-in inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/80 px-3.5 py-1.5 text-xs font-medium text-foreground backdrop-blur-md shadow-xs transition-all hover:border-foreground/30 hover:bg-card"
            >
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>OpenLynk 2.0 • Link-in-Bio & Toko Bento Kreator</span>
              <span className="text-muted-foreground group-hover:translate-x-0.5 transition-transform">
                →
              </span>
            </Link>

            {/* Main Headline */}
            <h1 className="animate-fade-up mt-6 font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.15] max-w-4xl">
              Satu Link Bento Estetik untuk{" "}
              <span className="bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-500 bg-clip-text text-transparent dark:from-white dark:via-zinc-300 dark:to-zinc-500">
                Semua Karya & Jualanmu
              </span>
            </h1>

            {/* Subtitle */}
            <p className="animate-fade-up mt-5 max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
              Tinggalkan link bio yang monoton. Gabungkan link profil, pemutar Spotify, video YouTube,
              dan toko produk digital dengan <strong>checkout 1-halaman tanpa redirect</strong>.
              Terima pembayaran QRIS otomatis dalam 2 menit.
            </p>

            {/* Quick Claim Input Bar */}
            <form
              onSubmit={handleClaimSubmit}
              className="animate-fade-up mt-8 flex w-full max-w-md flex-col sm:flex-row items-center gap-2 rounded-2xl sm:rounded-full border border-border/80 bg-card p-1.5 shadow-md shadow-zinc-950/5 focus-within:border-zinc-400 dark:focus-within:border-zinc-600 transition-all"
            >
              <div className="flex w-full sm:w-auto flex-1 items-center px-3 py-1">
                <span className="text-xs sm:text-sm font-medium text-muted-foreground select-none">
                  openlynk.id/
                </span>
                <input
                  type="text"
                  placeholder="namamu"
                  value={claimSlug}
                  onChange={(e) => setClaimSlug(e.target.value)}
                  className="w-full bg-transparent px-1.5 py-1 text-xs sm:text-sm font-semibold text-foreground outline-none placeholder:text-muted-foreground/60"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-full bg-zinc-900 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-zinc-800 active:scale-98 transition-all dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
              >
                <span>Klaim Sekarang</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </form>

            {/* Secondary Action & Trust Badges */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
              <Link
                href="/demo"
                className="inline-flex items-center gap-1 font-semibold text-foreground hover:underline underline-offset-4"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                Lihat Demo Lengkap (Alex Pratama)
              </Link>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                Gratis Selamanya
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                QRIS & Instant Midtrans
              </span>
            </div>
          </div>

          {/* Interactive Bento Showcase Preview (Hero Device Mockup) */}
          <div id="showcase" className="mt-14 sm:mt-20 mx-auto max-w-4xl px-4">
            <div className="relative rounded-3xl border border-border/80 bg-gradient-to-b from-card to-muted/40 p-4 sm:p-8 shadow-2xl shadow-zinc-950/10 backdrop-blur-md">
              {/* Device Window Header */}
              <div className="flex items-center justify-between pb-4 border-b border-border/60">
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-400/80" />
                  <div className="h-3 w-3 rounded-full bg-amber-400/80" />
                  <div className="h-3 w-3 rounded-full bg-emerald-400/80" />
                </div>
                <div className="flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1 text-[11px] font-medium text-muted-foreground">
                  <Globe className="h-3 w-3" />
                  <span>openlynk.id/alexpratama</span>
                </div>
                <Link
                  href="/demo"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-foreground hover:text-zinc-600 transition-colors"
                >
                  <span className="hidden sm:inline">Buka Halaman Penuh</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Mockup Profile Content */}
              <div className="pt-6 pb-2">
                {/* Profile Header */}
                <div className="flex flex-col items-center text-center">
                  <div className="relative">
                    <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-500 p-0.5 shadow-md">
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
                  {/* Social Badges */}
                  <div className="mt-3 flex items-center gap-2">
                    <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                      <Video className="h-3 w-3 text-red-500" /> 120K Subscribers
                    </span>
                    <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                      <Music className="h-3 w-3 text-emerald-500" /> Creator Talks
                    </span>
                  </div>
                </div>

                {/* Section Divider Mock */}
                <div className="my-5 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <span className="h-px w-12 bg-border" />
                  <span>Karya & Produk Pilihan</span>
                  <span className="h-px w-12 bg-border" />
                </div>

                {/* Mini Bento Grid Showcase */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Card 1: Featured Digital Product (Highlight 1-Page Checkout) */}
                  <div className="sm:col-span-2 rounded-2xl border border-emerald-500/30 bg-emerald-50/40 p-4 shadow-sm transition-all hover:shadow-md dark:bg-emerald-950/20">
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
                          Panduan lengkap menata link-in-bio bernilai konversi tinggi + 20 template Figma.
                        </p>
                        <div className="mt-3 flex items-center gap-3">
                          <span className="font-display text-base font-bold text-foreground">
                            {formatIDR(79000)}
                          </span>
                          <Link
                            href="/demo"
                            className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow-xs hover:bg-emerald-500 transition-colors"
                          >
                            <Zap className="h-3 w-3" />
                            Beli Instan (1-Halaman)
                          </Link>
                        </div>
                      </div>
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 font-bold text-xs border border-emerald-500/20">
                        EBOOK
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Spotify Embed Preview */}
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

                  {/* Card 3: YouTube Video Embed Preview */}
                  <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-red-500">
                        <Video className="h-3.5 w-3.5" /> YouTube
                      </span>
                      <span className="text-[10px] text-muted-foreground">4K HD</span>
                    </div>
                    <div className="my-2 relative rounded-lg bg-zinc-900 aspect-video flex items-center justify-center overflow-hidden group cursor-pointer">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white shadow-md">
                        <Play className="h-4 w-4 fill-current ml-0.5" />
                      </div>
                      <span className="absolute bottom-1 left-2 text-[10px] font-medium text-white">
                        Setup OpenLynk 3 Menit
                      </span>
                    </div>
                  </div>

                  {/* Card 4: Flash Sale Countdown Timer */}
                  <div className="rounded-2xl border border-amber-500/30 bg-amber-50/40 p-4 shadow-sm flex flex-col justify-between dark:bg-amber-950/20">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                        <Timer className="h-3.5 w-3.5" /> Flash Sale
                      </span>
                      <span className="rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-600">
                        -40%
                      </span>
                    </div>
                    <p className="my-1 text-xs font-semibold">Diskon Akhir Pekan</p>
                    <div className="grid grid-cols-3 gap-1 text-center font-mono text-xs font-bold text-amber-700 dark:text-amber-300">
                      <div className="rounded-md bg-card/80 p-1 border border-amber-500/20">
                        04<span className="block text-[9px] font-sans font-normal text-muted-foreground">JAM</span>
                      </div>
                      <div className="rounded-md bg-card/80 p-1 border border-amber-500/20">
                        28<span className="block text-[9px] font-sans font-normal text-muted-foreground">MNT</span>
                      </div>
                      <div className="rounded-md bg-card/80 p-1 border border-amber-500/20">
                        15<span className="block text-[9px] font-sans font-normal text-muted-foreground">DTK</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 5: Note / Promo Card */}
                  <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                        <Tag className="h-3.5 w-3.5" /> Promo Khusus
                      </span>
                    </div>
                    <div className="my-2 rounded-lg border border-dashed border-border bg-muted/60 p-2 text-center">
                      <p className="text-[10px] text-muted-foreground">Gunakan kode voucher:</p>
                      <p className="font-mono text-xs font-bold text-foreground tracking-wider">
                        BENTO2026
                      </p>
                    </div>
                    <p className="text-[10px] text-muted-foreground text-center">
                      Potongan 20% semua produk
                    </p>
                  </div>
                </div>

                {/* Highlight Drawer Feature Callout */}
                <div className="mt-4 rounded-xl border border-zinc-900/10 bg-zinc-900 text-white p-3 sm:p-4 flex items-center justify-between gap-3 shadow-md dark:bg-zinc-800">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-zinc-950 font-bold">
                      <QrCode className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold">Checkout 1 Halaman: Tanpa Redirect</p>
                      <p className="text-[11px] text-zinc-300">
                        Pengunjung tap beli → bottom sheet muncul → bayar QRIS → file langsung unduh.
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/demo"
                    className="shrink-0 rounded-lg bg-white px-3 py-1 text-xs font-semibold text-zinc-950 hover:bg-zinc-100 transition-colors"
                  >
                    Tes Sekarang
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats & Trust Bar */}
        <section className="border-y border-border/60 bg-muted/30 py-10">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 text-center">
              <div>
                <p className="font-display text-3xl font-extrabold text-foreground sm:text-4xl">
                  &lt; 2 Mnt
                </p>
                <p className="mt-1 text-xs sm:text-sm font-medium text-muted-foreground">
                  Setup Cepat Siap Online
                </p>
              </div>
              <div>
                <p className="font-display text-3xl font-extrabold text-foreground sm:text-4xl">
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
                  Bebas Biaya Bulanan Starter
                </p>
              </div>
              <div>
                <p className="font-display text-3xl font-extrabold text-foreground sm:text-4xl">
                  100%
                </p>
                <p className="mt-1 text-xs sm:text-sm font-medium text-muted-foreground">
                  Mobile-First & Responsif
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section id="fitur" className="py-20 sm:py-28">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                FITUR LENGKAP
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Semua yang Dibutuhkan Kreator Modern
              </h2>
              <p className="mt-3 text-muted-foreground text-sm sm:text-base">
                Dirancang dari awal untuk kemudahan navigasi pengunjung mobile dan peningkatan omset penjualan Anda.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="group rounded-2xl border border-border/70 bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xs">
                          <Icon className="h-5 w-5" />
                        </div>
                        <Badge variant="secondary">
                          {item.badge}
                        </Badge>
                      </div>
                      <h3 className="mt-4 font-display text-lg font-bold text-foreground">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Comparison Section (OpenLynk vs Traditional Link-in-Bio) */}
        <section className="py-16 bg-muted/20 border-y border-border/60">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <div className="text-center max-w-xl mx-auto mb-10">
              <h2 className="font-display text-2xl sm:text-3xl font-bold">
                Mengapa Kreator Pindah ke OpenLynk?
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Perbandingan langsung OpenLynk dengan platform link-in-bio konvensional.
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
              <div className="grid grid-cols-3 border-b border-border bg-muted/50 p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <div className="col-span-1">Fitur & Pengalaman</div>
                <div className="text-center font-extrabold text-foreground">OpenLynk v2.0</div>
                <div className="text-center text-muted-foreground">Linktree / Jadul</div>
              </div>

              <div className="divide-y divide-border/60 text-xs sm:text-sm">
                <div className="grid grid-cols-3 p-4 items-center">
                  <span className="font-semibold text-foreground">Format Tampilan</span>
                  <span className="text-center font-medium text-emerald-600 dark:text-emerald-400">
                    Bento Grid 2D Interaktif
                  </span>
                  <span className="text-center text-muted-foreground">Daftar Tombol Vertikal Kaku</span>
                </div>

                <div className="grid grid-cols-3 p-4 items-center">
                  <span className="font-semibold text-foreground">Checkout Toko</span>
                  <span className="text-center font-medium text-emerald-600 dark:text-emerald-400">
                    1-Halaman (Drawer Bawah)
                  </span>
                  <span className="text-center text-muted-foreground">Redirect Halaman Eksternal</span>
                </div>

                <div className="grid grid-cols-3 p-4 items-center">
                  <span className="font-semibold text-foreground">Metode Pembayaran</span>
                  <span className="text-center font-medium text-emerald-600 dark:text-emerald-400">
                    QRIS Otomatis & VA Bank
                  </span>
                  <span className="text-center text-muted-foreground">PayPal / Stripe (Rumit)</span>
                </div>

                <div className="grid grid-cols-3 p-4 items-center">
                  <span className="font-semibold text-foreground">Media Embeds</span>
                  <span className="text-center font-medium text-emerald-600 dark:text-emerald-400">
                    Spotify, YouTube & Countdown
                  </span>
                  <span className="text-center text-muted-foreground">Hanya link teks biasa</span>
                </div>

                <div className="grid grid-cols-3 p-4 items-center">
                  <span className="font-semibold text-foreground">Biaya Awal</span>
                  <span className="text-center font-bold text-emerald-600 dark:text-emerald-400">
                    Rp 0 (Gratis Selamanya)
                  </span>
                  <span className="text-center text-muted-foreground">Biaya langganan bulanan mahal</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works (3 Steps) */}
        <section className="py-20 sm:py-24">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Cara Kerja 3 Langkah Mudah
            </h2>
            <p className="mt-3 text-muted-foreground text-sm sm:text-base max-w-lg mx-auto">
              Halaman bento siap tayang dan jualan Anda langsung live dalam waktu kurang dari 3 menit.
            </p>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm relative">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-white font-display text-sm font-bold dark:bg-white dark:text-zinc-900">
                  1
                </span>
                <h3 className="mt-4 font-display text-lg font-bold">Klaim Username Unik</h3>
                <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Amankan alamat link personal Anda seperti <code className="text-foreground">openlynk.id/namamu</code> sebelum diambil kreator lain.
                </p>
              </div>

              <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm relative">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-white font-display text-sm font-bold dark:bg-white dark:text-zinc-900">
                  2
                </span>
                <h3 className="mt-4 font-display text-lg font-bold">Hias Bento & Pasang Produk</h3>
                <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Tambahkan kartu sosial, pemutar musik Spotify, video YouTube, dan upload produk digitalmu secara visual dengan pengiriman otomatis.
                </p>
              </div>

              <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm relative">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-white font-display text-sm font-bold dark:bg-white dark:text-zinc-900">
                  3
                </span>
                <h3 className="mt-4 font-display text-lg font-bold">Bagikan Bio & Terima Bayaran</h3>
                <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Pasang di profil Instagram, TikTok, atau X. Pengunjung dapat langsung bayar via QRIS tanpa pernah meninggalkan halaman bio.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Live Interactive Demo CTA Box */}
        <section className="py-12 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 text-white mx-4 sm:mx-8 rounded-3xl my-8">
          <div className="mx-auto max-w-4xl px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/30">
                <Sparkles className="h-3 w-3" /> DEMO INTERAKTIF
              </span>
              <h3 className="mt-3 font-display text-2xl sm:text-3xl font-bold">
                Coba Langsung Halaman Demo Alex Pratama
              </h3>
              <p className="mt-1 text-sm text-zinc-300 max-w-lg">
                Rasakan mulusnya pengalaman klik bento, pemutar Spotify, dan simulasi checkout 1-halaman QRIS tanpa biaya.
              </p>
            </div>
            <Link
              href="/demo"
              className="shrink-0 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-zinc-900 shadow-md hover:bg-zinc-100 active:scale-95 transition-all"
            >
              <span>Buka Demo Live</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="harga" className="py-20 sm:py-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                HARGA TRANSPARAN
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Mulai Gratis, Upgrade Kapan Saja
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Tidak ada biaya tersembunyi. Mulai gratis tanpa kartu kredit.
              </p>

              {/* Billing Toggle */}
              <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-border bg-card p-1.5 shadow-xs">
                <button
                  type="button"
                  onClick={() => setIsAnnual(false)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                    !isAnnual ? "bg-zinc-900 text-white shadow-xs dark:bg-white dark:text-zinc-900" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Bulanan
                </button>
                <button
                  type="button"
                  onClick={() => setIsAnnual(true)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    isAnnual ? "bg-zinc-900 text-white shadow-xs dark:bg-white dark:text-zinc-900" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>Tahunan</span>
                  <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[10px] text-emerald-600 font-bold">
                    HEMAT 20%
                  </span>
                </button>
              </div>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              {/* Starter Plan */}
              <div className="rounded-3xl border border-border/70 bg-card p-8 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="font-display text-xl font-bold text-foreground">Starter</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Untuk kreator pemula yang baru mulai membangun profil dan katalog produk.
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
                      <span><strong>1 Halaman</strong> profil bento</span>
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
                      <span>Embed Spotify, YouTube, Maps, & Timer</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>Fee transaksi 5% per penjualan</span>
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
                      <span><strong>Kustom Domain</strong> (contoh: bio.namamu.com)</span>
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
                      <span>Bantuan prioritas via WhatsApp</span>
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

        {/* FAQ Section */}
        <section id="faq" className="py-20 bg-muted/20 border-t border-border/60">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <div className="text-center mb-10">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                TANYA JAWAB
              </span>
              <h2 className="mt-3 font-display text-2xl sm:text-3xl font-bold">
                Pertanyaan yang Sering Diajukan
              </h2>
            </div>

            <Accordion defaultValue={["faq-0"]} className="space-y-3">
              {faqs.map((faq, idx) => (
                <AccordionItem
                  key={faq.question}
                  value={`faq-${idx}`}
                  className="rounded-2xl border border-border/70 bg-card px-5 shadow-xs"
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

        {/* Bottom CTA Banner */}
        <section className="py-20 text-center">
          <div className="mx-auto max-w-4xl px-4">
            <h2 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
              Siap Ubah Bio Menjadi Mesin Cuan?
            </h2>
            <p className="mt-4 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
              Bangun halaman profil bento estetikmu sekarang. Gratis, 2 menit selesai, dan langsung siap terima pembayaran QRIS.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/klaim">
                <GradientButton className="!px-8 !py-3.5 !text-sm">
                  Klaim Halaman Gratis
                </GradientButton>
              </Link>
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-6 py-3 text-sm font-semibold shadow-xs hover:bg-muted transition-all"
              >
                <span>Lihat Contoh Demo</span>
                <ArrowRight className="h-4 w-4" />
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
