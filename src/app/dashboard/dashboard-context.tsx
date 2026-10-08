"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import type { Page, Product, Order, BentoSize, Coupon, SocialLinks, User } from "@/lib/types";
import type { AnalyticsStats } from "./components/analytics-tab";

function subscribeStorage(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getStoredToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("openlynk_admin") ?? "";
}

function getServerToken(): string {
  return "";
}

function token(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("openlynk_admin") ?? "";
}

function authHeaders(): HeadersInit {
  const t = token();
  return t
    ? { "Content-Type": "application/json", Authorization: `Bearer ${t}` }
    : { "Content-Type": "application/json" };
}

interface DeleteTarget {
  kind: "page" | "product" | "coupon";
  id: string;
  label: string;
}

interface DashboardContextType {
  loading: boolean;
  pages: Page[];
  activeId: string;
  activePage: Page | undefined;
  activeSlug: string | undefined;
  currentUser: User | null;
  setCurrentUser: (u: User | null) => void;
  products: Product[];
  orders: Order[];
  coupons: Coupon[];
  stats: AnalyticsStats;
  subs: number;
  hasToken: boolean;
  adminToken: string;
  isPro: boolean;
  refresh: (activeOverrideId?: string, overrideSlug?: string) => Promise<void>;
  selectPage: (pageId: string) => void;
  setActiveId: (pageId: string) => void;

  // Modals
  showNewPageModal: boolean;
  setShowNewPageModal: (show: boolean) => void;
  showAddCardModal: boolean;
  setShowAddCardModal: (show: boolean) => void;
  showProfileModal: boolean;
  setShowProfileModal: (show: boolean) => void;
  pendingDelete: DeleteTarget | null;
  setPendingDelete: (target: DeleteTarget | null) => void;
  deleting: boolean;
  executeDelete: () => Promise<void>;

  // Handlers
  handleAddBento: (action: string, data: Record<string, unknown>) => Promise<void>;
  handleResizeBento: (bentoId: string, size: BentoSize) => Promise<void>;
  handleRemoveBento: (bentoId: string) => Promise<void>;
  handleEditBento: (bentoId: string, data: Record<string, unknown>) => Promise<void>;
  handleMoveBento: (bentoId: string, dir: number) => Promise<void>;
  handleReorderBento: (order: string[]) => Promise<void>;
  handleSaveTheme: (data: {
    name: string;
    bio: string;
    image?: string;
    bannerImage?: string;
    socials?: SocialLinks;
    theme: string;
    accentColor: string;
    darkMode: boolean;
  }) => Promise<void>;
  handleUpdateCustomDomain: (domain: string | null) => Promise<void>;

  // Products
  handleCreateProduct: (data: {
    name: string;
    priceIdr: number;
    kind: "digital" | "fisik";
    stock: number | null;
    description: string;
  }) => Promise<void>;
  handleUpdateProduct: (
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
  ) => Promise<void>;
  handleDeleteProduct: (id: string, productName: string) => Promise<void>;
  handleToggleProductActive: (id: string, isActive: boolean) => Promise<void>;
  handleUploadProductFile: (
    e: React.ChangeEvent<HTMLInputElement>,
    prodId: string
  ) => Promise<void>;

  // Coupons
  handleCreateCoupon: (data: {
    code: string;
    discountType: "percent" | "fixed";
    discountValue: number;
    minOrderIdr?: number;
    maxUses?: number | null;
    expiresAt?: string | null;
  }) => Promise<void>;
  handleToggleCouponActive: (id: string, isActive: boolean) => Promise<void>;
  handleDeleteCoupon: (id: string) => Promise<void>;

  // Orders
  handleFulfillOrder: (orderId: string) => Promise<void>;

  // Pages
  handleCreatePage: (slug: string, name: string) => Promise<void>;
  handleDeletePage: (id: string, slugName: string) => void;

  // Settings
  handleSaveAdminToken: (newToken: string) => void;
}

const DashboardContext = createContext<DashboardContextType | null>(null);

export function useDashboard(): DashboardContextType {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return ctx;
}

export function DashboardProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

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
  const [pendingDelete, setPendingDelete] = useState<DeleteTarget | null>(null);
  const [deleting, setDeleting] = useState(false);

  const activePage = pages.find((p) => p.id === activeId) ?? pages[0];
  const activeSlug = activePage?.slug;

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
      } else if (overrideSlug) {
        targetPage = p.find((page) => page.slug === overrideSlug);
      } else {
        // Cek segmen slug dari URL saat ini
        const segments = window.location.pathname.split("/").filter(Boolean);
        // Bisa berupa /dashboard/studio/:slug atau /dashboard/coupons/:slug atau /dashboard/:slug
        const matchedByUrl = p.find((page) => segments.includes(page.slug));
        targetPage = matchedByUrl || (activeId ? p.find((page) => page.id === activeId) : undefined);
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
          fetch(`/api/coupons?pageId=${aid}`, { headers: authHeaders() }).then((r) => r.json()).catch(() => []),
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

  // Sinkronisasi activeId saat pathname berubah
  useEffect(() => {
    if (pages.length === 0) return;
    const segments = pathname.split("/").filter(Boolean);
    const matched = pages.find((p) => segments.includes(p.slug));
    if (matched && matched.id !== activeId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveId(matched.id);
      // Fetch sub-data untuk halaman baru
      Promise.all([
        fetch(`/api/products?pageId=${matched.id}`).then((r) => r.json()).catch(() => []),
        fetch(`/api/analytics?pageId=${matched.id}`).then((r) => r.json()).catch(() => ({})),
        fetch(`/api/orders?pageId=${matched.id}`).then((r) => r.json()).catch(() => []),
        fetch(`/api/subscribe?pageId=${matched.id}`).then((r) => r.json()).catch(() => []),
        fetch(`/api/coupons?pageId=${matched.id}`, { headers: authHeaders() }).then((r) => r.json()).catch(() => []),
      ]).then(([pr, st, o, sb, cp]) => {
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
      });
    }
  }, [pathname, pages, activeId]);

  function selectPage(pageId: string) {
    const selected = pages.find((p) => p.id === pageId);
    if (!selected) return;
    setActiveId(pageId);
    refresh(pageId);
  }

  async function post(url: string, body: unknown) {
    const res = await fetch(url, { method: "POST", headers: authHeaders(), body: JSON.stringify(body) });
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
      headers: authHeaders(),
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error ?? "Gagal memproses aksi");
    } else {
      await refresh();
    }
  }

  async function handleCreatePage(slug: string, name: string) {
    const res = await fetch("/api/pages", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ slug, name }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Gagal membuat halaman");
    await refresh(json.id, slug);
    router.push(`/dashboard/studio/${slug}`);
  }

  function handleDeletePage(id: string, slugName: string) {
    setPendingDelete({
      kind: "page",
      id,
      label: `Hapus halaman /${slugName} beserta seluruh produk & kartu bentonya?`,
    });
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
      setPendingDelete(null);
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
      router.push("/dashboard/overview");
    }
  }

  async function handleAddBento(action: string, data: Record<string, unknown>) {
    if (!activePage) return;
    await post(`/api/pages/${activePage.id}/bento`, { action, ...data });
  }

  async function handleResizeBento(bentoId: string, size: BentoSize) {
    if (!activePage) return;
    await post(`/api/pages/${activePage.id}/bento`, { action: "resize", bentoId, size });
  }

  async function handleRemoveBento(bentoId: string) {
    if (!activePage) return;
    await post(`/api/pages/${activePage.id}/bento`, { action: "remove", bentoId });
  }

  async function handleEditBento(bentoId: string, data: Record<string, unknown>) {
    if (!activePage) return;
    await post(`/api/pages/${activePage.id}/bento`, { action: "edit", bentoId, ...data });
  }

  async function handleMoveBento(bentoId: string, dir: number) {
    if (!activePage) return;
    await post(`/api/pages/${activePage.id}/bento`, { action: "move", bentoId, dir });
  }

  async function handleReorderBento(order: string[]) {
    if (!activePage) return;
    await post(`/api/pages/${activePage.id}/bento`, { action: "reorder", order });
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
    if (!activePage) return;
    await patch("/api/pages", { id: activePage.id, ...themeData });
  }

  async function handleUpdateCustomDomain(domain: string | null) {
    if (!activePage) return;
    await patch("/api/pages", { id: activePage.id, customDomain: domain });
  }

  async function handleCreateProduct(productData: {
    name: string;
    priceIdr: number;
    kind: "digital" | "fisik";
    stock: number | null;
    description: string;
  }) {
    if (!activePage) return;
    await post("/api/products", { pageId: activePage.id, ...productData });
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
    setPendingDelete({
      kind: "product",
      id,
      label: `Hapus produk "${productName}"? Kartu produk ini di bento juga akan terhapus.`,
    });
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

  async function handleFulfillOrder(orderId: string) {
    await patch("/api/orders", { orderId, status: "sent" });
  }

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
    if (!activePage) return;
    await post("/api/coupons", { pageId: activePage.id, ...data });
  }

  async function handleToggleCouponActive(id: string, isActive: boolean) {
    await patch("/api/coupons", { id, isActive });
  }

  async function handleDeleteCoupon(id: string) {
    setPendingDelete({
      kind: "coupon",
      id,
      label: "Hapus kupon ini? Kupon tidak bisa dikembalikan.",
    });
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
    <DashboardContext.Provider
      value={{
        loading,
        pages,
        activeId,
        activePage,
        activeSlug,
        currentUser,
        setCurrentUser,
        products,
        orders,
        coupons,
        stats,
        subs,
        hasToken,
        adminToken,
        isPro,
        refresh,
        selectPage,
        setActiveId,
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
        handleResizeBento,
        handleRemoveBento,
        handleEditBento,
        handleMoveBento,
        handleReorderBento,
        handleSaveTheme,
        handleUpdateCustomDomain,
        handleCreateProduct,
        handleUpdateProduct,
        handleDeleteProduct,
        handleToggleProductActive,
        handleUploadProductFile,
        handleCreateCoupon,
        handleToggleCouponActive,
        handleDeleteCoupon,
        handleFulfillOrder,
        handleCreatePage,
        handleDeletePage,
        handleSaveAdminToken,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}
