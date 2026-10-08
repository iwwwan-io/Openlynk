"use client";

import { useDashboard } from "../dashboard-context";
import { SettingsTab } from "../components/settings-tab";

export default function DashboardSettingsPage() {
  const {
    adminToken,
    handleSaveAdminToken,
    activePage,
    handleUpdateCustomDomain,
    currentUser,
    setShowProfileModal,
    pages,
  } = useDashboard();

  return (
    <div className="animate-in fade-in duration-200">
      <SettingsTab
        initialToken={adminToken}
        onSaveToken={handleSaveAdminToken}
        activePage={activePage}
        onUpdateCustomDomain={handleUpdateCustomDomain}
        currentUser={currentUser}
        onOpenProfileModal={() => setShowProfileModal(true)}
        pageCount={pages.length}
      />
    </div>
  );
}
