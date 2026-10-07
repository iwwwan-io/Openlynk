"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/**
 * Dialog konfirmasi terpadu pengganti confirm()/prompt() bawaan browser.
 * Terkendali penuh: parent mengatur open + onOpenChange + onConfirm.
 * Varian input opsional untuk satu isian teks singkat (mis. alasan suspend).
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Ya, lanjutkan",
  cancelLabel = "Batal",
  danger = false,
  busy = false,
  input,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  busy?: boolean;
  input?: { label: string; placeholder?: string; defaultValue?: string };
  onConfirm: (inputValue?: string) => void | Promise<void>;
}) {
  const [inputValue, setInputValue] = useState(input?.defaultValue ?? "");

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
        </AlertDialogHeader>
        {input && (
          <div>
            <label className="mb-1 block text-xs font-semibold text-foreground">
              {input.label}
            </label>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={input.placeholder}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
            />
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            disabled={busy}
            onClick={(e) => {
              e.preventDefault();
              void (async () => {
                await onConfirm(input ? inputValue : undefined);
                onOpenChange(false);
              })();
            }}
            className={
              danger
                ? "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:ring-destructive/20"
                : undefined
            }
          >
            {busy ? "Memproses..." : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
