import Link from "next/link";
import { NavbarShell, HomeFooter } from "@/components/site";
import { GradientButton } from "@/components/primitives";
import { Mail, MessageCircle, HelpCircle, Clock } from "lucide-react";

export const metadata = {
  title: "Hubungi Kami | OpenLynk",
  description: "Layanan bantuan, dukungan teknis, dan informasi kontak OpenLynk.",
};

export default function ContactPage() {
  return (
    <div className="container mx-auto flex min-h-screen w-full flex-col items-center px-4 py-4 md:py-8">
      <NavbarShell>
        <Link href="/klaim">
          <GradientButton className="!px-5 !py-2 !text-sm">Mulai Gratis</GradientButton>
        </Link>
      </NavbarShell>

      <main className="w-full max-w-3xl flex-1 py-20">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">Hubungi Kami</h1>
            <p className="text-xs text-muted-foreground">Tim dukungan OpenLynk siap membantu Anda</p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border/60 pt-6">
          <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Mail className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-base">Email Dukungan</h3>
            </div>
            <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
              Untuk kendala teknis, pertanyaan transaksi, atau permohonan kerjasama:
            </p>
            <a
              href="mailto:support@openlynk.id"
              className="mt-3 inline-block font-semibold text-sm text-primary hover:underline"
            >
              support@openlynk.id
            </a>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <MessageCircle className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-base">WhatsApp Resmi</h3>
            </div>
            <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
              Layanan pesan cepat untuk pembeli dan kreator:
            </p>
            <a
              href="https://wa.me/6281234567890"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block font-semibold text-sm text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              +62 812-3456-7890
            </a>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Clock className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-base">Jam Operasional</h3>
            </div>
            <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
              Senin - Jumat: 09.00 - 18.00 WIB<br />
              Sabtu & Minggu: Dukungan tiket darurat
            </p>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <HelpCircle className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-base">Portal Unduhan</h3>
            </div>
            <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
              Kehilangan tautan unduhan produk digital yang pernah dibeli?
            </p>
            <Link
              href="/akses"
              className="mt-3 inline-block font-semibold text-sm text-primary hover:underline"
            >
              Cari Pesanan di /akses →
            </Link>
          </div>
        </div>
      </main>

      <HomeFooter />
    </div>
  );
}
