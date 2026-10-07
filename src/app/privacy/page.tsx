import Link from "next/link";
import { NavbarShell, HomeFooter } from "@/components/site";
import { GradientButton } from "@/components/primitives";
import { ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Kebijakan Privasi | OpenLynk",
  description: "Kebijakan perlindungan data pribadi pengguna dan pembeli di OpenLynk.",
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto flex min-h-screen w-full flex-col items-center px-4 py-4 md:py-8">
      <NavbarShell>
        <Link href="/klaim">
          <GradientButton className="!px-5 !py-2 !text-sm">Mulai Gratis</GradientButton>
        </Link>
      </NavbarShell>

      <main className="w-full max-w-3xl flex-1 py-20">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">Kebijakan Privasi</h1>
            <p className="text-xs text-muted-foreground">Terakhir diperbarui: 5 Oktober 2026</p>
          </div>
        </div>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted-foreground border-t border-border/60 pt-6">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">1. Komitmen Perlindungan Privasi</h2>
            <p>
              OpenLynk menghargai privasi setiap pengguna, baik kreator maupun pembeli. Kebijakan ini menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, dan melindungi informasi pribadi Anda sesuai dengan Undang-Undang Perlindungan Data Pribadi (UU PDP) Republik Indonesia.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">2. Data yang Kami Kumpulkan</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Data Akun Kreator:</strong> Alamat email, nama lengkap, foto profil, tautan media sosial, serta nomor rekening bank/e-wallet untuk pencairan dana.</li>
              <li><strong>Data Transaksi Pembeli:</strong> Nama pembeli, alamat email, dan nomor WhatsApp yang diisi saat checkout produk digital. Kami <em>tidak pernah</em> mengumpulkan atau menyimpan nomor kartu kredit/debit atau PIN perbankan Anda.</li>
              <li><strong>Data Analitik:</strong> Jumlah kunjungan profil (*views*), klik tautan (*clicks*), serta agregasi volume penjualan secara anonim.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">3. Penggunaan Informasi</h2>
            <p>
              Informasi yang dikumpulkan digunakan semata-mata untuk:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Memproses transaksi pembayaran dan memvalidasi pesanan digital via Midtrans.</li>
              <li>Mengirimkan berkas digital resmi dan tautan unduhan aman ke email dan WhatsApp pembeli.</li>
              <li>Memberikan akses riwayat unduhan kembali pada menu Portal Pembeli (/akses).</li>
              <li>Menyalurkan saldo penghasilan kreator ke rekening pencairan yang terdaftar.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">4. Keamanan & Kerahasiaan Data</h2>
            <p>
              Password akun kreator dienkripsi menggunakan algoritma cryptographic hashing modern (*scrypt with random 16-byte salt*). Seluruh komunikasi data dilindungi dengan enkripsi Transport Layer Security (TLS/HTTPS). Kami tidak pernah menjual, menyewakan, atau memperdagangkan data pribadi Anda kepada pihak ketiga untuk tujuan pemasaran.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">5. Hak Akses & Penghapusan Data</h2>
            <p>
              Anda berhak meminta salinan informasi pribadi yang kami simpan atau mengajukan permohonan penghapusan akun beserta data terkait dengan menghubungi kami melalui saluran bantuan resmi.
            </p>
          </section>
        </div>
      </main>

      <HomeFooter />
    </div>
  );
}
