"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useDashboard } from "../dashboard-context";
import { PagesOverview } from "./pages-overview";
import { StudioWorkspace, type StudioSubtab } from "./studio-workspace";

interface StudioPageViewProps {
  forcedSubtab?: StudioSubtab;
}

export function StudioPageView({ forcedSubtab }: StudioPageViewProps) {
  const router = useRouter();
  const params = useParams();
  const rawSlug = (params?.slug as string) || "";
  const rawSubtab = forcedSubtab || (params?.subtab as StudioSubtab) || "studio";

  const validSubtabs: StudioSubtab[] = ["studio", "theme", "content", "products"];
  const currentSubtab: StudioSubtab = validSubtabs.includes(rawSubtab) ? rawSubtab : "studio";

  const {
    loading,
    pages,
    activeId,
    activePage,
    products,
    selectPage,
    setShowNewPageModal,
    setShowAddCardModal,
    handleDeletePage,
    isPro,
    setShowProfileModal,
    handleResizeBento,
    handleRemoveBento,
    handleEditBento,
    handleMoveBento,
    handleReorderBento,
    handleSaveTheme,
    handleCreateProduct,
    handleUpdateProduct,
    handleDeleteProduct,
    handleToggleProductActive,
    handleUploadProductFile,
  } = useDashboard();

  // Pastikan halaman yang sesuai dengan slug aktif
  const targetPage = pages.find((p) => p.slug === rawSlug) || activePage;

  useEffect(() => {
    if (!loading && targetPage && targetPage.id !== activeId) {
      selectPage(targetPage.id);
    }
  }, [loading, targetPage, activeId, selectPage]);

  function handleSelectPage(pageId: string) {
    selectPage(pageId);
    const selected = pages.find((p) => p.id === pageId);
    if (selected) {
      if (currentSubtab === "studio") {
        router.push(`/dashboard/studio/${selected.slug}`);
      } else {
        router.push(`/dashboard/studio/${selected.slug}/${currentSubtab}`);
      }
    }
  }

  function handleSubtabChange(nextSubtab: StudioSubtab) {
    const slug = targetPage?.slug || rawSlug;
    if (nextSubtab === "studio") {
      router.push(`/dashboard/studio/${slug}`);
    } else {
      router.push(`/dashboard/studio/${slug}/${nextSubtab}`);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
        <p className="text-sm text-muted-foreground animate-pulse">Memuat Studio Bento...</p>
      </div>
    );
  }

  if (!targetPage) {
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

  return (
    <div className="flex flex-col gap-y-6 animate-in fade-in duration-200">
      {/* Compact Desktop Strip */}
      <PagesOverview
        pages={pages}
        activeId={targetPage.id}
        loading={loading}
        showOverview={false}
        onCarouselToggle={(open) => {
          if (open) router.push("/dashboard/overview");
        }}
        onSelectPage={handleSelectPage}
        onNewPageClick={() => setShowNewPageModal(true)}
        onDeletePage={handleDeletePage}
        isPro={isPro}
        onUpgradePro={() => setShowProfileModal(true)}
      />

      {/* Studio Bento Workspace */}
      <StudioWorkspace
        page={targetPage}
        products={products}
        subtab={currentSubtab}
        onSubtabChange={handleSubtabChange}
        onOpenAddModal={() => setShowAddCardModal(true)}
        onResizeBento={handleResizeBento}
        onRemoveBento={handleRemoveBento}
        onEditBento={handleEditBento}
        onMoveBento={handleMoveBento}
        onReorderBento={handleReorderBento}
        onSaveTheme={handleSaveTheme}
        onCreateProduct={handleCreateProduct}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
        onToggleProductActive={handleToggleProductActive}
        onUploadProductFile={handleUploadProductFile}
      />
    </div>
  );
}
