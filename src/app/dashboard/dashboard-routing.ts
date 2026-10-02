import type { DashboardTab } from "./components/dashboard-header";
import type { StudioSubtab } from "./components/studio-workspace";

export interface ParsedDashboardRoute {
  tab: DashboardTab;
  slug?: string;
  subtab?: StudioSubtab;
  showOverview?: boolean;
}

export function parseDashboardPath(pathname: string): ParsedDashboardRoute {
  const cleanPath = pathname.split("?")[0].replace(/^\/dashboard\/?/, "");
  const segments = cleanPath ? cleanPath.split("/").filter(Boolean) : [];
  const [first, second, third] = segments;

  if (!first) {
    return { tab: "pages" };
  }

  if (first === "overview") {
    return { tab: "pages", showOverview: true };
  }

  if (first === "studio") {
    const validSubtabs: StudioSubtab[] = ["studio", "theme", "content", "products"];
    const subtab =
      third && validSubtabs.includes(third as StudioSubtab)
        ? (third as StudioSubtab)
        : undefined;
    return {
      tab: "pages",
      slug: second,
      subtab,
    };
  }

  if (first === "pages") {
    const validSubtabs: StudioSubtab[] = ["studio", "theme", "content", "products"];
    const subtab =
      third && validSubtabs.includes(third as StudioSubtab)
        ? (third as StudioSubtab)
        : undefined;
    return {
      tab: "pages",
      slug: second,
      subtab,
    };
  }

  if (first === "store") {
    return { tab: "store" };
  }

  if (first === "coupons") {
    return { tab: "coupons", slug: second };
  }

  if (first === "analytics") {
    return { tab: "analytics", slug: second };
  }

  if (first === "finance") {
    return { tab: "finance" };
  }

  if (first === "settings") {
    return { tab: "settings" };
  }

  // If first segment is a known subtab
  const validSubtabs: StudioSubtab[] = ["studio", "theme", "content", "products"];
  if (validSubtabs.includes(first as StudioSubtab)) {
    return {
      tab: "pages",
      subtab: first as StudioSubtab,
      slug: second,
    };
  }

  // If first segment is a slug (e.g. /dashboard/demo or /dashboard/demo/theme)
  if (second && validSubtabs.includes(second as StudioSubtab)) {
    return {
      tab: "pages",
      slug: first,
      subtab: second as StudioSubtab,
    };
  }

  return { tab: "pages", slug: first };
}

export function buildDashboardPath(
  tab: DashboardTab,
  slug?: string,
  subtab?: StudioSubtab,
  showOverview?: boolean
): string {
  if (showOverview) {
    return "/dashboard/overview";
  }
  if (tab === "pages") {
    if (slug) {
      if (subtab && subtab !== "studio") {
        return `/dashboard/studio/${slug}/${subtab}`;
      }
      return `/dashboard/studio/${slug}`;
    }
    return "/dashboard/studio";
  }
  if (tab === "coupons") {
    return slug ? `/dashboard/coupons/${slug}` : "/dashboard/coupons";
  }
  if (tab === "analytics") {
    return slug ? `/dashboard/analytics/${slug}` : "/dashboard/analytics";
  }
  return `/dashboard/${tab}`;
}
