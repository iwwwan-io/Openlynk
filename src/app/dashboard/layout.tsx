"use client";

import { type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { DashboardProvider, useDashboard } from "./dashboard-context";
import { DashboardHeader, type DashboardTab } from "./components/dashboard-header";
import { AddCardModal } from "./add-card-modal";
import { NewPageModal } from "./components/new-page-modal";
import { UserProfileModal } from "./components/user-profile-modal";
import { ConfirmDialog } from "@/components/confirm";

function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    pages,
    activeId,
    activePage,
    activeSlug,
    currentUser,
    setCurrentUser,
    refresh,
    orders,
    products,
    hasToken,
    isPro,
    selectPage,
    showNewPageModal,
    setShowNewPageModal,
    showAddCardModal,
    setShowAddCardModal,
    showProfileModal,
    setShowProfileModal,
    pendingDelete,
    setPendingDelete,
    deleting,
    executeDelete,
    handleAddBento,
    handleCreatePage,
  } = useDashboard();

  // Tentukan tab aktif berdasarkan URL path
  let currentTab: DashboardTab = "pages";
  if (pathname.startsWith("/dashboard/store")) {
    currentTab = "store";
  } else if (pathname.startsWith("/dashboard/coupons")) {
    currentTab = "coupons";
  } else if (pathname.startsWith("/dashboard/analytics")) {
    currentTab = "analytics";
  } else if (pathname.startsWith("/dashboard/finance")) {
    currentTab = "finance";
  } else if (pathname.startsWith("/dashboard/settings")) {
    currentTab = "settings";
  }

  function handleTabChange(tab: DashboardTab) {
    if (tab === "pages") {
      if (activeSlug) {
        router.push(`/dashboard/studio/${activeSlug}`);
      } else {
        router.push("/dashboard/overview");
      }
    } else if (tab === "store") {
      router.push("/dashboard/store");
    } else if (tab === "coupons") {
      if (activeSlug) {
        router.push(`/dashboard/coupons/${activeSlug}`);
      } else {
        router.push("/dashboard/coupons");
      }
    } else if (tab === "analytics") {
      if (activeSlug) {
        router.push(`/dashboard/analytics/${activeSlug}`);
      } else {
        router.push("/dashboard/analytics");
      }
    } else if (tab === "finance") {
      router.push("/dashboard/finance");
    } else if (tab === "settings") {
      router.push("/dashboard/settings");
    }
  }

  function handleSelectPage(pageId: string) {
    selectPage(pageId);
    const selected = pages.find((p) => p.id === pageId);
    if (!selected) return;

    if (currentTab === "coupons") {
      router.push(`/dashboard/coupons/${selected.slug}`);
    } else if (currentTab === "analytics") {
      router.push(`/dashboard/analytics/${selected.slug}`);
    } else {
      router.push(`/dashboard/studio/${selected.slug}`);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground antialiased flex flex-col">
      {/* Top Header & Tab Navigation - Persistent shell ala Vercel */}
      <DashboardHeader
        tab={currentTab}
        onTabChange={handleTabChange}
        hasToken={hasToken}
        activeSlug={activeSlug}
        ordersCount={orders.length}
        pages={pages}
        activePageId={activeId}
        onSelectPage={handleSelectPage}
        onNewPageClick={() => setShowNewPageModal(true)}
        currentUser={currentUser}
        onOpenProfileModal={() => setShowProfileModal(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 space-y-6">
        {children}
      </main>

      {/* Global Modals */}
      <AddCardModal
        open={showAddCardModal}
        onClose={() => setShowAddCardModal(false)}
        onAdd={handleAddBento}
        availableProducts={products.filter(
          (pr) => !activePage?.bento?.some((b) => b.type === "product" && b.productId === pr.id)
        )}
      />

      <NewPageModal
        isOpen={showNewPageModal}
        onClose={() => setShowNewPageModal(false)}
        onCreate={handleCreatePage}
        isPro={isPro}
        pageCount={pages.length}
        onUpgradePro={() => setShowProfileModal(true)}
      />

      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        currentUser={currentUser}
        pageCount={pages.length}
        onProfileUpdated={(updatedUser) => {
          setCurrentUser(updatedUser);
          refresh();
        }}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(v) => !v && setPendingDelete(null)}
        title={
          pendingDelete?.kind === "page"
            ? "Hapus halaman?"
            : pendingDelete?.kind === "product"
              ? "Hapus produk?"
              : "Hapus kupon?"
        }
        description={pendingDelete?.label}
        confirmLabel="Ya, hapus"
        danger
        busy={deleting}
        onConfirm={executeDelete}
      />
    </div>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardProvider>
      <DashboardShell>{children}</DashboardShell>
    </DashboardProvider>
  );
}
