import Link from "next/link";
import { NavbarShell, HomeFooter } from "@/components/site";
import { GradientButton } from "@/components/primitives";
import { RotateCcw } from "lucide-react";

export const metadata = {
  title: "Kebijakan Pengembalian Dana (Refund Policy) | OpenLynk",
  description: "Ketentuan pengembalian dana dan garansi produk digital di OpenLynk.",
};

export default function RefundPage() {
  return (
    <div className="container mx-auto flex min-h-screen w-full flex-col items-center px-4 py-4 md:py-8">
      <NavbarShell>
        <Link href="/klaim">
          <GradientButton className="!px-5 !py-2 !text-sm">Mulai Gratis</GradientButton>
        </Link>
      </NavbarShell>

      <main className="w-full max-w-3xl flex-1 py-20">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <RotateCcw className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">Kebijakan Pengembalian Dana</h1>
            <p className="text-xs text-muted-foreground">Ketentuan Khusus Produk Non-Fisik & Digital</p>
          </div>
        </div>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted-foreground border-t border-border/60 pt-6">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">1. Karakteristik Produk Digital</h2>
            <p>
              Produk yang dijual melalui platform OpenLynk adalah <strong>100% produk digital non-fisik</strong> (seperti file unduhan e-book, template, preset, source code, lisensi software, atau link akses khusus) yang dikirimkan secara instan seketika pembayaran dikonfirmasi lunas oleh sistem.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">2. Ketentuan Umum Pengembalian Dana (Refund)</h2>
            <p>
              Mengingat sifat produk digital yang langsung dapat diunduh, disalin, atau diakses segera setelah pembelian, <strong>seluruh penjualan produk digital bersifat final dan tidak dapat dibatalkan atau dikembalikan dananya secara sepihak</strong> setelah berkas berhasil diunduh.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">3. Kondisi Khusus yang Memenuhi Syarat Refund</h2>
            <p>
              Pengembalian dana dapat disetujui dalam kondisi luar biasa berikut:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Pembayaran Ganda (*Double Charge*):</strong> Saldo pembeli terpotong lebih dari satu kali untuk nomor pesanan yang sama akibat gangguan jaringan gateway perbankan.</li>
              <li><strong>Berkas Rusak / Corrupt:</strong> Berkas digital terbukti rusak, tidak lengkap, atau tautan unduhan tidak dapat diakses sama sekali, dan pihak kreator tidak dapat menyediakan berkas pengganti dalam 2x24 jam kerja.</li>
              <li><strong>Ketidaksesuaian Mayor:</strong> Produk yang diterima terbukti secara nyata berbeda total dari deskripsi yang tercantum di halaman etalase kreator.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">4. Prosedur Pengajuan Refund</h2>
            <p>
              Untuk mengajukan klaim pengembalian dana, pembeli dapat menghubungi tim OpenLynk atau langsung menghubungi kreator terkait melalui kontak yang tersedia selambat-lambatnya <strong>3 (tiga) hari kalender</strong> sejak transaksi dilakukan dengan menyertakan:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Nomor ID Pesanan (Order ID, contoh: #ord_xxx).</li>
              <li>Bukti pembayaran sah dari bank / e-wallet.</li>
              <li>Tangkapan layar kendala atau deskripsi masalah yang dialami.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">5. Proses Pengembalian Dana</h2>
            <p>
              Klaim yang disetujui akan diproses pengembalian dananya melalui saluran pembayaran asal (transfer bank atau saldo e-wallet) dalam kurun waktu 3 hingga 7 hari kerja tergantung kebijakan masing-masing bank penerbit.
            </p>
          </section>
        </div>
      </main>

      <HomeFooter />
    </div>
  );
}
