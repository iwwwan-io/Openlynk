import Link from "next/link";
import { Compass, Home, Sparkles } from "lucide-react";

export const metadata = {
  title: "404 - Halaman Tidak Ditemukan | OpenLynk",
  description: "Maaf, halaman atau profil kreator yang Anda cari tidak dapat ditemukan di OpenLynk.",
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4 text-center text-white selection:bg-emerald-500 selection:text-black">
      {/* Glow Effect Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-md flex flex-col items-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-400 mb-6 shadow-inner">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Error 404
        </div>

        {/* 404 Large Display */}
        <h1 className="font-display text-7xl font-extrabold tracking-tight sm:text-8xl bg-gradient-to-b from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
          404
        </h1>

        <h2 className="mt-4 font-display text-xl font-bold tracking-tight text-white sm:text-2xl">
          Halaman Tidak Ditemukan
        </h2>

        <p className="mt-3 text-sm text-zinc-400 leading-relaxed max-w-sm">
          Profil kreator atau halaman yang Anda cari mungkin telah diubah namanya, dinonaktifkan, atau tautan yang Anda masukkan salah.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full sm:w-auto rounded-full bg-emerald-500 px-6 py-3 text-xs font-bold text-black shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 hover:shadow-emerald-500/30 transition active:scale-[0.98]"
          >
            <Home className="h-4 w-4" />
            Kembali ke Beranda
          </Link>
          <Link
            href="/jelajahi"
            className="flex items-center justify-center gap-2 w-full sm:w-auto rounded-full border border-zinc-800 bg-zinc-900/80 px-6 py-3 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition active:scale-[0.98]"
          >
            <Compass className="h-4 w-4" />
            Jelajahi Kreator
          </Link>
        </div>

        {/* Secondary prompt */}
        <p className="mt-10 text-xs text-zinc-500 flex items-center justify-center gap-1.5">
          Ingin punya tautan bio sendiri?{" "}
          <Link href="/daftar" className="text-emerald-400 hover:underline inline-flex items-center gap-1 font-medium">
            Daftar Gratis <Sparkles className="h-3 w-3" />
          </Link>
        </p>
      </div>
    </div>
  );
}
