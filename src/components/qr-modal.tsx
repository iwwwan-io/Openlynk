"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { QrCode, Copy, Check, X, Download } from "lucide-react";

export function QrModal({
  slug,
  pageName,
  variant = "default",
  className,
}: {
  slug: string;
  pageName?: string;
  variant?: "default" | "pill";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function show(e?: React.MouseEvent) {
    e?.stopPropagation();
    setUrl(`${window.location.origin}/${slug}`);
    setCopied(false);
    setOpen(true);
  }

  async function copy() {
    await navigator.clipboard.writeText(url).catch(() => undefined);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function downloadQR() {
    try {
      setDownloading(true);
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&margin=0&data=${encodeURIComponent(url)}`;
      const res = await fetch(qrUrl);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `openlynk-qr-${slug}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(
        `https://api.qrserver.com/v1/create-qr-code/?size=600x600&margin=0&data=${encodeURIComponent(url)}`,
        "_blank"
      );
    } finally {
      setDownloading(false);
    }
  }

  const buttonClass =
    className ||
    (variant === "pill"
      ? "inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:text-foreground hover:bg-muted shadow-2xs"
      : "inline-flex items-center gap-1 rounded-lg px-2 py-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors");

  return (
    <>
      <button
        type="button"
        className={buttonClass}
        title="Buka Kode QR Halaman"
        onClick={show}
      >
        <QrCode className="h-3.5 w-3.5" />
        <span>QR</span>
      </button>

      {open &&
        mounted &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/65 p-4 backdrop-blur-xs animate-in fade-in duration-150"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
            }}
          >
            <div
              className="relative w-full max-w-sm rounded-3xl border border-border bg-card p-6 text-center shadow-2xl transition-all animate-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(false);
                }}
                className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                title="Tutup"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center justify-center gap-2.5 mb-1">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-foreground">
                  <QrCode className="h-5 w-5" />
                </span>
                <div className="text-left">
                  <p className="font-display font-bold text-base text-foreground leading-tight">
                    {pageName ? `QR ${pageName}` : "Kode QR Profil"}
                  </p>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    /{slug}
                  </p>
                </div>
              </div>

              {/* QR Image Box with White Padded Background for Reliable Scanning */}
              <div className="mx-auto mt-4 inline-block rounded-2xl border border-border/80 bg-white p-3.5 shadow-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=0&data=${encodeURIComponent(url)}`}
                  alt={`QR /${slug}`}
                  width={200}
                  height={200}
                  className="h-48 w-48 sm:h-52 sm:w-52 rounded-lg object-contain"
                />
              </div>

              <p className="mt-3 text-xs text-muted-foreground font-mono bg-muted/50 rounded-xl py-1.5 px-3 truncate">
                {url}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={copy}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card py-2.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted active:scale-95 shadow-2xs"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="text-emerald-500">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Salin Link</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={downloadQR}
                  disabled={downloading}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-zinc-900 py-2.5 text-xs font-semibold text-white shadow-xs transition-opacity hover:opacity-90 active:scale-95 disabled:opacity-50 dark:bg-white dark:text-zinc-900"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>{downloading ? "Mengunduh..." : "Unduh QR"}</span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
