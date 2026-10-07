import Link from "next/link";
import { NavbarShell, HomeFooter } from "@/components/site";
import { GradientButton } from "@/components/primitives";
import { FileText } from "lucide-react";

export const metadata = {
  title: "Syarat dan Ketentuan Layanan | OpenLynk",
  description: "Ketentuan penggunaan platform OpenLynk bagi kreator dan pembeli produk digital.",
};

export default function TermsPage() {
  return (
    <div className="container mx-auto flex min-h-screen w-full flex-col items-center px-4 py-4 md:py-8">
      <NavbarShell>
        <Link href="/klaim">
          <GradientButton className="!px-5 !py-2 !text-sm">Mulai Gratis</GradientButton>
        </Link>
      </NavbarShell>

      <main className="w-full max-w-3xl flex-1 py-20">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">Syarat dan Ketentuan</h1>
            <p className="text-xs text-muted-foreground">Terakhir diperbarui: 5 Oktober 2026</p>
          </div>
        </div>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted-foreground border-t border-border/60 pt-6">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">1. Penerimaan Ketentuan</h2>
            <p>
              Dengan mendaftar, mengakses, atau menggunakan layanan OpenLynk (&quot;Platform&quot;), Anda menyetujui untuk terikat dengan Syarat dan Ketentuan ini. Jika Anda tidak menyetujui ketentuan ini, Anda tidak diperkenankan menggunakan platform kami.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">2. Deskripsi Layanan</h2>
            <p>
              OpenLynk menyediakan layanan link-in-bio bento interaktif dan platform etalase produk digital bagi kreator independen untuk mendistribusikan karya (seperti e-book, software, template, audio, dan preset) serta menerima apresiasi donasi (sawer QRIS) dari audiens.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">3. Kewajiban & Konten Kreator</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Kreator menjamin bahwa seluruh berkas digital dan materi yang dijual merupakan hak milik pribadi atau memiliki izin lisensi distribusi yang sah.</li>
              <li>Dilarang keras memperjualbelikan materi pornografi, konten bajakan/hak cipta pihak lain tanpa izin, malware/virus, perjudian, narkotika, atau materi ilegal menurut hukum Republik Indonesia.</li>
              <li>OpenLynk berhak menangguhkan atau menghapus halaman dan produk yang melanggar ketentuan hukum atau hak cipta tanpa pemberitahuan sebelumnya.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">4. Biaya Platform & Pembayaran</h2>
            <p>
              OpenLynk mengenakan komisi platform standar sebesar 5% dari total transaksi penjualan produk digital. Pembayaran diproses secara aman melalui gerbang pembayaran berlisensi (Midtrans) menggunakan QRIS, e-wallet, atau transfer bank resmi.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">5. Penarikan Saldo (Payouts)</h2>
            <p>
              Kreator dapat mengajukan permohonan penarikan dana bersih ke rekening bank atau e-wallet yang didukung di Indonesia dengan batas minimum penarikan sebesar Rp 50.000. Proses verifikasi dan pencairan diproses dalam waktu 1x24 jam kerja operasional perbankan.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">6. Batasan Tanggung Jawab</h2>
            <p>
              OpenLynk bertindak sebagai platform perantara teknologi dan tidak bertanggung jawab atas kesesuaian, isi materi, atau dampak penggunaan dari berkas digital yang disediakan secara mandiri oleh masing-masing kreator.
            </p>
          </section>
        </div>
      </main>

      <HomeFooter />
    </div>
  );
}
