"use client";

import Script from "next/script";
import { useState } from "react";
import { toast } from "sonner";

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        options?: {
          onSuccess?: (result: unknown) => void;
          onPending?: (result: unknown) => void;
          onError?: (result: unknown) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}

export function PayActions({
  orderId,
  status,
  snapToken,
}: {
  orderId: string;
  status: string;
  snapToken?: string;
}) {
  const [loading, setLoading] = useState(false);

  async function simulate() {
    setLoading(true);
    try {
      const res = await fetch("/api/orders/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "gagal");
      window.location.reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "gagal");
    } finally {
      setLoading(false);
    }
  }

  function snapPay() {
    if (window.snap && snapToken) window.snap.pay(snapToken);
    else toast.error("Snap.js belum dimuat. Isi MIDTRANS_CLIENT_KEY + script Snap.");
  }

  if (status !== "pending") return <p className="mt-4 text-sm">Order {status}.</p>;

  const isProduction =
    process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true" ||
    process.env.NODE_ENV === "production";
  const snapUrl = isProduction
    ? "https://app.midtrans.com/snap/snap.js"
    : "https://app.sandbox.midtrans.com/snap/snap.js";

  return (
    <div className="mt-4 flex gap-2">
      {process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY && (
        <Script
          src={snapUrl}
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        />
      )}
      <button
        onClick={snapPay}
        className="flex-1 rounded-full bg-black py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
      >
        Bayar via Snap
      </button>
      {!isProduction && (
        <button
          onClick={simulate}
          disabled={loading}
          className="flex-1 rounded-full border border-dashed border-amber-500/50 bg-amber-500/5 py-2 text-sm font-medium text-amber-700 dark:text-amber-400 hover:bg-amber-500/10 transition-colors disabled:opacity-50"
        >
          {loading ? "Memproses..." : "Simulasi Bayar (Dev)"}
        </button>
      )}
    </div>
  );
}
