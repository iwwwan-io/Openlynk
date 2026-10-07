"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { usePathname, useRouter } from "next/navigation";
import type { Page, Product, Order, BentoSize, Coupon, SocialLinks, User } from "@/lib/types";
import { DashboardHeader, type DashboardTab } from "../components/dashboard-header";
import { ConfirmDialog } from "@/components/confirm";
import { PagesOverview } from "../components/pages-overview";
import { StudioWorkspace, type StudioSubtab } from "../components/studio-workspace";
import { StoreTab } from "../components/store-tab";
import { CouponsTab } from "../components/coupons-tab";
import { AnalyticsTab, type AnalyticsStats } from "../components/analytics-tab";
import { FinanceTab } from "../components/finance-tab";
import { SettingsTab } from "../components/settings-tab";
import { NewPageModal } from "../components/new-page-modal";
import { UserProfileModal } from "../components/user-profile-modal";
import { AddCardModal } from "../add-card-modal";
import { parseDashboardPath, buildDashboardPath } from "../dashboard-routing";

function subscribeStorage(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getStoredToken(): string {
  return localStorage.getItem("openlynk_admin") ?? "";
}

function getServerToken(): string {
  return "";
}

function token(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("openlynk_admin") ?? "";
}

function headers(): HeadersInit {
  const t = token();
  return t
    ? { "Content-Type": "application/json", Authorization: `Bearer ${t}` }
    : { "Content-Type": "application/json" };
}

export default function Dashboard() {
  const router = useRouter();
  const pathname = usePathname() || "/dashboard";
  const initialRoute = parseDashboardPath(pathname);

  const [tab, setTab] = useState<DashboardTab>(() => initialRoute.tab);
  const [studioSubtab, setStudioSubtab] = useState<StudioSubtab>(() => initialRoute.subtab || "studio");
  const [showOverview, setShowOverview] = useState<boolean>(() => Boolean(initialRoute.showOverview));

  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState<Page[]>([]);
  const [activeId, setActiveId] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [stats, setStats] = useState<AnalyticsStats>({
    views: 0,
    clicks: 0,
    orders: 0,
    omset: 0,
    viewsOverTime: [],
    clicksOverTime: [],
  });
  const [subs, setSubs] = useState(0);

  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const storedToken = useSyncExternalStore(subscribeStorage, getStoredToken, getServerToken);
  const [customToken, setCustomToken] = useState<string | null>(null);
  const adminToken = customToken !== null ? customToken : storedToken;
  const hasToken = Boolean(adminToken);

  // Modals
  const [showNewPageModal, setShowNewPageModal] = useState(false);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<
    { kind: "page" | "product" | "coupon"; id: string; label: string } | null
  >(null);
  const [deleting, setDeleting] = useState(false);

  const active = pages.find((p) => p.id === activeId) ?? pages[0];

  function updateUrl(
    nextTab: DashboardTab,
    nextSlug?: string,
    nextSubtab?: StudioSubtab,
    isOverview?: boolean,
    replace = false
  ) {
    if (typeof window === "undefined") return;
    const targetUrl = buildDashboardPath(nextTab, nextSlug, nextSubtab, isOverview);
    if (window.location.pathname !== targetUrl) {
      if (replace) {
        window.history.replaceState(null, "", targetUrl);
      } else {
        window.history.pushState(null, "", targetUrl);
      }
    }
  }

  async function refresh(activeOverrideId?: string, overrideSlug?: string) {
    try {
      const meRes = await fetch("/api/auth/me")
        .then((r) => r.json())
        .catch(() => ({ user: null, pages: [] }));

      if (!meRes.user && !adminToken) {
        router.push(`/masuk?redirect=${encodeURIComponent(window.location.pathname)}`);
        return;
      }

      if (meRes.user) {
        setCurrentUser(meRes.user);
      }

      let p: Page[] = meRes.pages ?? [];
      // Fallback ke /api/pages hanya jika menggunakan ADMIN_TOKEN tanpa user session
      if (!meRes.user && adminToken) {
        const fallback = await fetch("/api/pages").then((r) => r.json()).catch(() => []);
        if (Array.isArray(fallback) && fallback.length > 0) {
          p = fallback;
        }
      }

      setPages(p);
      setLoading(false);

      let targetPage: Page | undefined;

      if (activeOverrideId) {
        targetPage = p.find((page) => page.id === activeOverrideId);
      } else {
        const route = parseDashboardPath(window.location.pathname);
        const slugToMatch = overrideSlug || route.slug;
        if (slugToMatch) {
          targetPage = p.find((page) => page.slug === slugToMatch);
        }
      }

      if (!targetPage && p.length > 0) {
        targetPage = p[0];
      }

      const aid = targetPage?.id || "";
      if (aid) {
        setActiveId(aid);
        const [pr, st, o, sb, cp] = await Promise.all([
          fetch(`/api/products?pageId=${aid}`).then((r) => r.json()).catch(() => []),
          fetch(`/api/analytics?pageId=${aid}`).then((r) => r.json()).catch(() => ({})),
          fetch(`/api/orders?pageId=${aid}`).then((r) => r.json()).catch(() => []),
          fetch(`/api/subscribe?pageId=${aid}`).then((r) => r.json()).catch(() => []),
          fetch(`/api/coupons?pageId=${aid}`, { headers: headers() }).then((r) => r.json()).catch(() => []),
        ]);
        setProducts(pr);
        setStats({
          views: st.views ?? 0,
          clicks: st.clicks ?? 0,
          orders: st.orders ?? 0,
          omset: st.omset ?? 0,
          viewsOverTime: st.viewsOverTime ?? [],
          clicksOverTime: st.clicksOverTime ?? [],
        });
        setOrders(o);
        setSubs(Array.isArray(sb) ? sb.length : 0);
        setCoupons(Array.isArray(cp) ? cp : []);

        // Sync URL on initial load if visiting /dashboard directly without params
        const curRoute = parseDashboardPath(window.location.pathname);
        if (window.location.pathname === "/dashboard" && targetPage) {
          updateUrl("pages", targetPage.slug, curRoute.subtab || "studio", false, true);
        }
      } else {
        setActiveId("");
        setProducts([]);
        setStats({
          views: 0,
          clicks: 0,
          orders: 0,
          omset: 0,
          viewsOverTime: [],
          clicksOverTime: [],
        });
        setOrders([]);
        setSubs(0);
        setCoupons([]);
      }
    } catch {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen for browser Back/Forward (popstate)
  useEffect(() => {
    function handlePopState() {
      const parsed = parseDashboardPath(window.location.pathname);
      setTab(parsed.tab);
      if (parsed.subtab) setStudioSubtab(parsed.subtab);
      if (parsed.showOverview !== undefined) setShowOverview(parsed.showOverview);
      if (parsed.slug && pages.length > 0) {
        const found = pages.find((p) => p.slug === parsed.slug);
        if (found && found.id !== activeId) {
          refresh(found.id);
        }
      }
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pages, activeId]);

  function handleTabChange(nextTab: DashboardTab) {
    setTab(nextTab);
    updateUrl(nextTab, active?.slug, studioSubtab, false);
  }

  function handleSelectPage(pageId: string) {
    const selected = pages.find((p) => p.id === pageId);
    refresh(pageId);
    if (selected) {
      updateUrl(tab, selected.slug, studioSubtab, false);
    }
  }

  function handleCarouselToggle(open: boolean) {
    setShowOverview(open);
    if (open) {
      updateUrl("pages", active?.slug, studioSubtab, true);
    } else {
      updateUrl("pages", active?.slug, studioSubtab, false);
    }
  }

  function handleSubtabChange(nextSubtab: StudioSubtab) {
    setStudioSubtab(nextSubtab);
    updateUrl("pages", active?.slug, nextSubtab, false);
  }

  async function post(url: string, body: unknown) {
    const res = await fetch(url, { method: "POST", headers: headers(), body: JSON.stringify(body) });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error ?? "Gagal memproses aksi");
    } else {
      await refresh();
    }
  }

  async function patch(url: string, body: unknown) {
    const res = await fetch(url, {
      method: "PATCH",
      headers: headers(),
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error ?? "Gagal memproses aksi");
    } else {
      await refresh();
    }
  }

  // Page Handlers
  async function handleCreatePage(slug: string, name: string) {
    const res = await fetch("/api/pages", {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ slug, name }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Gagal membuat halaman");
    await refresh(json.id, slug);
    updateUrl("pages", slug, "studio", false);
  }

  async function handleDeletePage(id: string, slugName: string) {
    setPendingDelete({ kind: "page", id, label: `Hapus halaman /${slugName} beserta seluruh produk & kartu bentonya?` });
  }

  async function executeDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      if (pendingDelete.kind === "page") await doDeletePage(pendingDelete.id);
      else if (pendingDelete.kind === "product") await doDeleteProduct(pendingDelete.id);
      else await doDeleteCoupon(pendingDelete.id);
    } finally {
      setDeleting(false);
    }
  }

  async function doDeletePage(id: string) {
    const t = token();
    const res = await fetch(`/api/pages?id=${id}`, {
      method: "DELETE",
      headers: t ? { Authorization: `Bearer ${t}` } : undefined,
    });
    if (!res.ok) toast.error((await res.json()).error ?? "Gagal menghapus");
    else {
      await refresh("");
      updateUrl("pages", undefined, "studio", true);
    }
  }

  // Bento Card Handlers
  async function handleAddBento(action: string, data: Record<string, unknown>) {
    if (!active) return;
    await post(`/api/pages/${active.id}/bento`, { action, ...data });
  }

  async function handleResizeBento(bentoId: string, size: BentoSize) {
    if (!active) return;
    await post(`/api/pages/${active.id}/bento`, { action: "resize", bentoId, size });
  }

  async function handleRemoveBento(bentoId: string) {
    if (!active) return;
    await post(`/api/pages/${active.id}/bento`, { action: "remove", bentoId });
  }

  async function handleEditBento(bentoId: string, data: Record<string, unknown>) {
    if (!active) return;
    await post(`/api/pages/${active.id}/bento`, { action: "edit", bentoId, ...data });
  }

  async function handleMoveBento(bentoId: string, dir: number) {
    if (!active) return;
    await post(`/api/pages/${active.id}/bento`, { action: "move", bentoId, dir });
  }

  async function handleReorderBento(order: string[]) {
    if (!active) return;
    await post(`/api/pages/${active.id}/bento`, { action: "reorder", order });
  }

  async function handleSaveTheme(themeData: {
    name: string;
    bio: string;
    image?: string;
    bannerImage?: string;
    socials?: SocialLinks;
    theme: string;
    accentColor: string;
    darkMode: boolean;
  }) {
    if (!active) return;
    await patch("/api/pages", { id: active.id, ...themeData });
  }

  async function handleUpdateCustomDomain(domain: string | null) {
    if (!active) return;
    await patch("/api/pages", { id: active.id, customDomain: domain });
  }

  // Product Handlers
  async function handleCreateProduct(productData: {
    name: string;
    priceIdr: number;
    kind: "digital" | "fisik";
    stock: number | null;
    description: string;
  }) {
    if (!active) return;
    await post("/api/products", { pageId: active.id, ...productData });
  }

  async function handleToggleProductActive(id: string, isActive: boolean) {
    await patch("/api/products", { id, isActive });
  }

  async function handleUploadProductFile(
    e: React.ChangeEvent<HTMLInputElement>,
    prodId: string
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/uploads", { method: "POST", body: form });
    const json = await res.json();
    if (!res.ok) {
      toast.error(json.error ?? "Gagal upload file");
      return;
    }
    await patch("/api/products", { id: prodId, fileUrl: json.url });
  }

  async function handleUpdateProduct(
    id: string,
    data: {
      name?: string;
      description?: string;
      priceIdr?: number;
      stock?: number | null;
      kind?: "digital" | "fisik";
      isActive?: boolean;
      imageUrl?: string;
      fileUrl?: string;
    }
  ) {
    await patch("/api/products", { id, ...data });
  }

  async function handleDeleteProduct(id: string, productName: string) {
    setPendingDelete({ kind: "product", id, label: `Hapus produk "${productName}"? Kartu produk ini di bento juga akan terhapus.` });
  }

  async function doDeleteProduct(id: string) {
    const t = token();
    const res = await fetch(`/api/products?id=${id}`, {
      method: "DELETE",
      headers: t ? { Authorization: `Bearer ${t}` } : undefined,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error ?? "Gagal menghapus produk");
    } else {
      await refresh();
    }
  }

  // Order Handlers
  async function handleFulfillOrder(orderId: string) {
    await patch("/api/orders", { orderId, status: "sent" });
  }

  // Settings Handlers
  function handleSaveAdminToken(newToken: string) {
    if (newToken) {
      localStorage.setItem("openlynk_admin", newToken);
    } else {
      localStorage.removeItem("openlynk_admin");
    }
    setCustomToken(newToken);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("storage"));
    }
    refresh();
  }

  async function handleCreateCoupon(data: {
    code: string;
    discountType: "percent" | "fixed";
    discountValue: number;
    minOrderIdr?: number;
    maxUses?: number | null;
    expiresAt?: string | null;
  }) {
    if (!active) return;
    await post("/api/coupons", { pageId: active.id, ...data });
  }

  async function handleToggleCouponActive(id: string, isActive: boolean) {
    await patch("/api/coupons", { id, isActive });
  }

  async function handleDeleteCoupon(id: string) {
    setPendingDelete({ kind: "coupon", id, label: "Hapus kupon ini? Kupon tidak bisa dikembalikan." });
  }

  async function doDeleteCoupon(id: string) {
    const t = token();
    const res = await fetch(`/api/coupons?id=${id}`, {
      method: "DELETE",
      headers: t ? { Authorization: `Bearer ${t}` } : undefined,
    });
    if (!res.ok) toast.error((await res.json()).error ?? "Gagal menghapus kupon");
    else await refresh();
  }

  const isPro = currentUser?.role === "admin" || currentUser?.plan === "pro";

  return (
    <div className="min-h-screen bg-background text-foreground antialiased flex flex-col">
      {/* Top Header & Tab Navigation */}
      <DashboardHeader
        tab={tab}
        onTabChange={handleTabChange}
        hasToken={hasToken}
        activeSlug={active?.slug}
        ordersCount={orders.length}
        pages={pages}
        activePageId={active?.id}
        onSelectPage={handleSelectPage}
        onNewPageClick={() => setShowNewPageModal(true)}
        currentUser={currentUser}
        onOpenProfileModal={() => setShowProfileModal(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 space-y-6">
        {/* TAB 1: PAGES & BENTO STUDIO */}
        {tab === "pages" && (
          <div className="flex flex-col gap-y-6 animate-in fade-in duration-200">
            {/* List of Profile Pages */}
            <PagesOverview
              pages={pages}
              activeId={active?.id || ""}
              loading={loading}
              showOverview={showOverview}
              onCarouselToggle={handleCarouselToggle}
              onSelectPage={handleSelectPage}
              onNewPageClick={() => setShowNewPageModal(true)}
              onDeletePage={handleDeletePage}
              isPro={isPro}
              onUpgradePro={() => setShowProfileModal(true)}
            />

            {/* Active Page Bento Studio Workspace */}
            {active && !showOverview && (
              <StudioWorkspace
                page={active}
                products={products}
                subtab={studioSubtab}
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
            )}
          </div>
        )}

        {/* TAB 2: STORE & ORDERS */}
        {tab === "store" && (
          <div className="animate-in fade-in duration-200">
            <StoreTab
              orders={orders}
              onFulfillOrder={handleFulfillOrder}
              products={products}
              activePage={active}
              onCreateProduct={handleCreateProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
              onToggleActive={handleToggleProductActive}
              onUploadFile={handleUploadProductFile}
            />
          </div>
        )}

        {/* TAB 3: COUPONS & PROMOS */}
        {tab === "coupons" && active && (
          <div className="animate-in fade-in duration-200">
            <CouponsTab
              pageId={active.id}
              coupons={coupons}
              onCreateCoupon={handleCreateCoupon}
              onToggleActive={handleToggleCouponActive}
              onDeleteCoupon={handleDeleteCoupon}
            />
          </div>
        )}

        {/* TAB 4: ANALYTICS & TRAFFIC */}
        {tab === "analytics" && (
          <div className="animate-in fade-in duration-200">
            <AnalyticsTab
              stats={stats}
              subsCount={subs}
              accentColor={active?.accentColor || "#2563eb"}
            />
          </div>
        )}

        {/* TAB 5: FINANCE & WITHDRAWALS */}
        {tab === "finance" && (
          <div className="animate-in fade-in duration-200">
            <FinanceTab currentUser={currentUser} />
          </div>
        )}

        {/* TAB 6: SETTINGS & ADMIN TOKEN */}
        {tab === "settings" && (
          <div className="animate-in fade-in duration-200">
            <SettingsTab
              initialToken={adminToken}
              onSaveToken={handleSaveAdminToken}
              activePage={active}
              onUpdateCustomDomain={handleUpdateCustomDomain}
              currentUser={currentUser}
              onOpenProfileModal={() => setShowProfileModal(true)}
              pageCount={pages.length}
            />
          </div>
        )}
      </main>

      {/* MODAL 1: ADD CARD TO BENTO */}
      <AddCardModal
        open={showAddCardModal}
        onClose={() => setShowAddCardModal(false)}
        onAdd={handleAddBento}
        availableProducts={products.filter(
          (pr) => !active?.bento.some((b) => b.type === "product" && b.productId === pr.id)
        )}
      />

      {/* MODAL 2: CREATE NEW PROFILE PAGE */}
      <NewPageModal
        isOpen={showNewPageModal}
        onClose={() => setShowNewPageModal(false)}
        onCreate={handleCreatePage}
        isPro={isPro}
        pageCount={pages.length}
        onUpgradePro={() => setShowProfileModal(true)}
      />

      {/* MODAL 3: USER PROFILE & SUBSCRIPTION */}
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

      {/* KONFIRMASI HAPUS */}
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
