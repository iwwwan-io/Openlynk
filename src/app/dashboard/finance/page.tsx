"use client";

import { useDashboard } from "../dashboard-context";
import { FinanceTab } from "../components/finance-tab";

export default function DashboardFinancePage() {
  const { currentUser } = useDashboard();

  return (
    <div className="animate-in fade-in duration-200">
      <FinanceTab currentUser={currentUser} />
    </div>
  );
}
