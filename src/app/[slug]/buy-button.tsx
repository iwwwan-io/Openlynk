"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShoppingBag, Plus, Minus } from "lucide-react";

export function BuyButton({
  productId,
  pageSlug,
  accent,
}: {
  productId: string;
  pageSlug: string;
  accent?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [qty, setQty] = useState(1);

  async function buy() {
    const name = prompt("Nama kamu?");
    if (!name) return;
    const contact = prompt("Email / WA?");
    if (!contact) return;
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, buyerName: name, buyerContact: contact, qty }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "gagal");
      router.push(`/checkout/${json.order.id}?slug=${pageSlug}`);
    } catch (e) {
      alert(e instanceof Error ? e.message : "gagal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-3 flex gap-2">
      <div className="flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1">
        <button
          type="button"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="p-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Minus className="h-3 w-3" />
        </button>
        <span className="w-5 text-center text-xs font-semibold">{qty}</span>
        <button
          type="button"
          onClick={() => setQty((q) => Math.min(10, q + 1))}
          className="p-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>
      <button
        onClick={buy}
        disabled={loading}
        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full py-2 text-xs font-semibold text-white shadow-xs transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ backgroundColor: accent ?? "#18181b" }}
      >
        <ShoppingBag className="h-3.5 w-3.5" />
        <span>{loading ? "Memproses..." : "Beli"}</span>
      </button>
    </div>
  );
}
