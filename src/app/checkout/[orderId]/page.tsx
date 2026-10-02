import { getDb } from "@/lib/store";
import { formatIDR, parseSawerProductId } from "@/lib/types";
import { PayActions } from "./pay-actions";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const db = await getDb();
  const order = db.orders.find((o) => o.id === orderId);
  if (!order) return <main className="p-10">Order tidak ditemukan.</main>;
  const product = db.products.find((p) => p.id === order.productId);
  const sawer = parseSawerProductId(order.productId);

  return (
    <main className="mx-auto max-w-md px-6 py-12">
      <h1 className="text-xl font-bold">Checkout</h1>
      <div className="mt-4 rounded-xl border p-4 text-sm space-y-1">
        <p>
          Produk:{" "}
          <span className="font-semibold">
            {sawer.isSawer
              ? `Sawer Dukungan / Traktir Kopi ☕ (${sawer.message || "Traktir Kopi"})`
              : product?.name ?? "Produk"}
          </span>
        </p>
        <p>Qty: {order.qty}</p>
        <p>Total: {formatIDR(order.totalIdr + order.feeIdr)} (termasuk fee)</p>
        <p>
          Status:{" "}
          <span className="font-mono font-semibold uppercase">{order.status}</span>
        </p>
        <p className="mt-2 break-all text-xs text-muted-foreground">Snap token: {order.snapToken}</p>
        {(order.status === "paid" || order.status === "sent") && order.productId.startsWith("sawer:") && (
          <div className="mt-3 rounded-lg bg-emerald-500/10 p-3 text-emerald-600 dark:text-emerald-400 font-medium">
            Terima kasih banyak atas traktiran kopi dan dukungan Anda! ❤️
          </div>
        )}
        {(order.status === "paid" || order.status === "sent") &&
          product?.kind === "digital" &&
          product?.fileUrl && (
            <a
              href={`/api/downloads/${order.id}?contact=${encodeURIComponent(order.buyerContact)}`}
              className="mt-3 inline-flex items-center gap-1.5 font-semibold text-primary underline hover:text-primary/80 transition-colors"
            >
              Unduh Berkas Digital (Tautan Aman) 📥
            </a>
          )}
      </div>
      <PayActions orderId={order.id} status={order.status} snapToken={order.snapToken} />
      <p className="mt-4 text-sm text-zinc-600">
        Dengan Midtrans key asli, tombol Snap akan membuka popup bayar QRIS/VA.
        Tanpa key, gunakan simulasi bayar untuk demo webhook.
      </p>
    </main>
  );
}
