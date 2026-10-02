"use client";

import { useState } from "react";

export function Subscribe({ pageId, dark }: { pageId: string; dark?: boolean }) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  async function submit() {
    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pageId, email }),
    });
    if (!res.ok) alert((await res.json()).error ?? "gagal");
    else {
      setDone(true);
      setEmail("");
    }
  }

  if (done)
    return (
      <p className={`mt-6 text-center text-sm ${dark ? "text-zinc-400" : "text-zinc-600"}`}>
        Terima kasih sudah berlangganan!
      </p>
    );

  return (
    <div className="mt-6 flex gap-2">
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="email@kamu.id"
        inputMode="email"
        className={`flex-1 rounded-full border px-4 py-2 text-sm ${
          dark ? "border-zinc-700 bg-zinc-900 text-zinc-100" : "bg-white"
        }`}
      />
      <button onClick={submit} className="rounded-full bg-black px-4 py-2 text-sm text-white">
        Ikuti
      </button>
    </div>
  );
}
