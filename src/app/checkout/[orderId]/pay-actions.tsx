"use client";

import Script from "next/script";
import { useState } from "react";

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
      alert(e instanceof Error ? e.message : "gagal");
    } finally {
      setLoading(false);
    }
  }

  function snapPay() {
    if (window.snap && snapToken) window.snap.pay(snapToken);
    else alert("Snap.js belum dimuat. Isi MIDTRANS_CLIENT_KEY + script Snap.");
  }

  if (status !== "pending") return <p className="mt-4 text-sm">Order {status}.</p>;

  return (
    <div className="mt-4 flex gap-2">
      {process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY && (
        <Script
          src="https://app.sandbox.midtrans.com/snap/snap.js"
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        />
      )}
      <button
        onClick={snapPay}
        className="flex-1 rounded-full bg-black py-2 text-sm font-medium text-white"
      >
        Bayar via Snap
      </button>
      <button
        onClick={simulate}
        disabled={loading}
        className="flex-1 rounded-full border py-2 text-sm disabled:opacity-50"
      >
        {loading ? "..." : "Simulasi bayar"}
      </button>
    </div>
  );
}
