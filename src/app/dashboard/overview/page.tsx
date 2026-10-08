"use client";

import { useRouter } from "next/navigation";
import { useDashboard } from "../dashboard-context";
import { PagesOverview } from "../components/pages-overview";

export default function DashboardOverviewPage() {
  const router = useRouter();
  const {
    pages,
    activeId,
    loading,
    selectPage,
    setShowNewPageModal,
    handleDeletePage,
    isPro,
    setShowProfileModal,
  } = useDashboard();

  function handleSelectPage(pageId: string) {
    selectPage(pageId);
    const target = pages.find((p) => p.id === pageId);
    if (target) {
      router.push(`/dashboard/studio/${target.slug}`);
    }
  }

  return (
    <div className="flex flex-col gap-y-6 animate-in fade-in duration-200">
      <PagesOverview
        pages={pages}
        activeId={activeId}
        loading={loading}
        showOverview={true}
        onSelectPage={handleSelectPage}
        onNewPageClick={() => setShowNewPageModal(true)}
        onDeletePage={handleDeletePage}
        isPro={isPro}
        onUpgradePro={() => setShowProfileModal(true)}
      />
    </div>
  );
}
