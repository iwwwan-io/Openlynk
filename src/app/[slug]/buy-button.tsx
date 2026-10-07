"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ShoppingBag, Plus, Minus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");

  async function buy(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !contact.trim()) {
      toast.error("Nama dan kontak wajib diisi");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, buyerName: name.trim(), buyerContact: contact.trim(), qty }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "gagal");
      setDialogOpen(false);
      router.push(`/checkout/${json.order.id}?slug=${pageSlug}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "gagal");
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
        onClick={() => setDialogOpen(true)}
        disabled={loading}
        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full py-2 text-xs font-semibold text-white shadow-xs transition-opacity hover:opacity-90 disabled:opacity-50"
        style={{ backgroundColor: accent ?? "#18181b" }}
      >
        <ShoppingBag className="h-3.5 w-3.5" />
        <span>{loading ? "Memproses..." : "Beli"}</span>
      </button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm rounded-3xl">
          <DialogHeader className="text-left">
            <DialogTitle className="font-display font-bold">Data Pembeli</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Isi nama dan kontak untuk melanjutkan ke pembayaran
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={buy} className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-semibold" htmlFor={`buyer-name-${productId}`}>
                Nama kamu
              </label>
              <input
                id={`buyer-name-${productId}`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama lengkap"
                autoComplete="name"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold" htmlFor={`buyer-contact-${productId}`}>
                Email / WA
              </label>
              <input
                id={`buyer-contact-${productId}`}
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="email@contoh.id / 0812xxxx"
                autoComplete="email"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full py-2.5 text-xs font-bold text-white min-h-[44px] disabled:opacity-50"
              style={{ backgroundColor: accent ?? "#18181b" }}
            >
              {loading ? "Memproses..." : `Beli ×${qty}`}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
