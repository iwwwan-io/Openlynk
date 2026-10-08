"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDashboard } from "./dashboard-context";
import { PagesOverview } from "./components/pages-overview";

export default function DashboardRootPage() {
  const router = useRouter();
  const {
    loading,
    pages,
    activeId,
    activeSlug,
    selectPage,
    setShowNewPageModal,
    handleDeletePage,
    isPro,
    setShowProfileModal,
  } = useDashboard();

  useEffect(() => {
    if (!loading && pages.length > 0) {
      const targetSlug = activeSlug || pages[0].slug;
      router.replace(`/dashboard/studio/${targetSlug}`);
    }
  }, [loading, pages, activeSlug, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
        <p className="text-sm text-muted-foreground animate-pulse">Memuat workspace OpenLynk...</p>
      </div>
    );
  }

  if (pages.length === 0) {
    return (
      <div className="animate-in fade-in duration-200">
        <PagesOverview
          pages={pages}
          activeId={activeId}
          loading={loading}
          showOverview={true}
          onSelectPage={selectPage}
          onNewPageClick={() => setShowNewPageModal(true)}
          onDeletePage={handleDeletePage}
          isPro={isPro}
          onUpgradePro={() => setShowProfileModal(true)}
        />
      </div>
    );
  }

  return null;
}
