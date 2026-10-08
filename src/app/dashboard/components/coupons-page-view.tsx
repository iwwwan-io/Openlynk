"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useDashboard } from "../dashboard-context";
import { CouponsTab } from "./coupons-tab";

export function CouponsPageView() {
  const params = useParams();
  const rawSlug = (params?.slug as string) || "";
  const {
    loading,
    pages,
    activeId,
    activePage,
    coupons,
    selectPage,
    handleCreateCoupon,
    handleToggleCouponActive,
    handleDeleteCoupon,
  } = useDashboard();

  const targetPage = pages.find((p) => p.slug === rawSlug) || activePage;

  useEffect(() => {
    if (!loading && targetPage && targetPage.id !== activeId) {
      selectPage(targetPage.id);
    }
  }, [loading, targetPage, activeId, selectPage]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
        <p className="text-sm text-muted-foreground animate-pulse">Memuat data kupon...</p>
      </div>
    );
  }

  if (!targetPage) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Silakan pilih atau buat halaman terlebih dahulu untuk mengelola kupon diskon.
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-200">
      <CouponsTab
        pageId={targetPage.id}
        coupons={coupons}
        onCreateCoupon={handleCreateCoupon}
        onToggleActive={handleToggleCouponActive}
        onDeleteCoupon={handleDeleteCoupon}
      />
    </div>
  );
}
