"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { Product } from "@/lib/types";

export type CheckoutStep = "detail" | "checkout" | "payment" | "success";

interface CheckoutContextType {
  selectedProduct: Product | null;
  isOpen: boolean;
  step: CheckoutStep;
  qty: number;
  orderId: string | null;
  snapToken: string | null;
  pageSlug: string;
  accentColor: string;
  openCheckout: (product: Product, initialQty?: number, initialStep?: CheckoutStep) => void;
  closeCheckout: () => void;
  setStep: (step: CheckoutStep) => void;
  setQty: (qty: number | ((prev: number) => number)) => void;
  setOrderData: (orderId: string, snapToken: string | null) => void;
}

const CheckoutContext = createContext<CheckoutContextType | null>(null);

export function CheckoutProvider({
  children,
  pageSlug,
  accentColor = "#2563eb",
}: {
  children: ReactNode;
  pageSlug: string;
  accentColor?: string;
}) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<CheckoutStep>("detail");
  const [qty, setQty] = useState(1);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [snapToken, setSnapToken] = useState<string | null>(null);

  function openCheckout(product: Product, initialQty = 1, initialStep: CheckoutStep = "detail") {
    setSelectedProduct(product);
    setQty(initialQty);
    setStep(initialStep);
    setOrderId(null);
    setSnapToken(null);
    setIsOpen(true);
  }

  function closeCheckout() {
    setIsOpen(false);
    // beri sedikit jeda sebelum reset agar animasi penutupan mulus
    setTimeout(() => {
      setSelectedProduct(null);
      setStep("detail");
      setOrderId(null);
      setSnapToken(null);
      setQty(1);
    }, 300);
  }

  function setOrderData(id: string, token: string | null) {
    setOrderId(id);
    setSnapToken(token);
  }

  return (
    <CheckoutContext.Provider
      value={{
        selectedProduct,
        isOpen,
        step,
        qty,
        orderId,
        snapToken,
        pageSlug,
        accentColor,
        openCheckout,
        closeCheckout,
        setStep,
        setQty,
        setOrderData,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const ctx = useContext(CheckoutContext);
  if (!ctx) {
    throw new Error("useCheckout must be used within a CheckoutProvider");
  }
  return ctx;
}
