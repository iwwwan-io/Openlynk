import type { Order, Product, PayoutRequest } from "@/lib/types";

function escapeCSV(field: unknown): string {
  if (field === null || field === undefined) return '""';
  const str = String(field);
  return `"${str.replace(/"/g, '""')}"`;
}

function triggerDownload(content: string, filename: string) {
  const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportOrdersToCSV(
  orders: Order[],
  products: Product[],
  pageName = "OpenLynk"
) {
  const productMap = new Map(products.map((p) => [p.id, p.name]));

  const headers = [
    "ID Pesanan",
    "Tanggal",
    "Nama Pembeli",
    "Kontak (WA/Email)",
    "Nama Produk",
    "Jumlah (Qty)",
    "Total Belanja (IDR)",
    "Biaya Layanan (IDR)",
    "Diskon (IDR)",
    "Kode Kupon",
    "Status Pesanan",
    "Tanggal Bayar",
    "Jumlah Download",
  ];

  const rows = orders.map((o) => {
    let productName = productMap.get(o.productId) || o.productId;
    if (o.productId.startsWith("sawer:")) {
      productName = "Sawer Dukungan / Traktir Kopi";
    }

    return [
      escapeCSV(o.id),
      escapeCSV(new Date(o.createdAt).toLocaleString("id-ID")),
      escapeCSV(o.buyerName),
      escapeCSV(o.buyerContact),
      escapeCSV(productName),
      escapeCSV(o.qty),
      escapeCSV(o.totalIdr),
      escapeCSV(o.feeIdr),
      escapeCSV(o.discountIdr || 0),
      escapeCSV(o.couponCode || "-"),
      escapeCSV(o.status.toUpperCase()),
      escapeCSV(o.paidAt ? new Date(o.paidAt).toLocaleString("id-ID") : "-"),
      escapeCSV(o.downloadCount || 0),
    ].join(",");
  });

  const csvContent = [headers.join(","), ...rows].join("\r\n");
  const dateStr = new Date().toISOString().slice(0, 10);
  const safeName = pageName.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
  triggerDownload(csvContent, `pesanan_${safeName}_${dateStr}.csv`);
}

export function exportFinanceToCSV(
  orders: Order[],
  payouts: PayoutRequest[],
  pageName = "OpenLynk"
) {
  const headers = [
    "Tipe Transaksi",
    "ID Referensi",
    "Tanggal",
    "Keterangan",
    "Status",
    "Kredit Masuk (IDR)",
    "Debit Keluar (IDR)",
  ];

  const orderRows = orders
    .filter((o) => o.status === "paid" || o.status === "sent")
    .map((o) => {
      // Model fee-on-top: pembeli bayar total+fee, kreator terima total penuh.
      const net = o.totalIdr;
      return [
        escapeCSV("PENJUALAN"),
        escapeCSV(o.id),
        escapeCSV(o.paidAt ? new Date(o.paidAt).toLocaleString("id-ID") : new Date(o.createdAt).toLocaleString("id-ID")),
        escapeCSV(`Order dari ${o.buyerName}`),
        escapeCSV("SELESAI"),
        escapeCSV(net),
        escapeCSV(0),
      ].join(",");
    });

  const payoutRows = payouts.map((p) => {
    return [
      escapeCSV("PENARIKAN DANA"),
      escapeCSV(p.id),
      escapeCSV(new Date(p.createdAt).toLocaleString("id-ID")),
      escapeCSV(`Pencairan ke ${p.bankName} (${p.accountNumber})`),
      escapeCSV(p.status.toUpperCase()),
      escapeCSV(0),
      escapeCSV(p.amountIdr),
    ].join(",");
  });

  const csvContent = [headers.join(","), ...orderRows, ...payoutRows].join("\r\n");
  const dateStr = new Date().toISOString().slice(0, 10);
  const safeName = pageName.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
  triggerDownload(csvContent, `mutasi_keuangan_${safeName}_${dateStr}.csv`);
}
