export type BentoSize = "1x1" | "2x1" | "2x2" | "4x2" | "4x1";

export type BentoItem =
  | { id: string; type: "header"; title: string; subtitle?: string; size?: BentoSize; pos?: XY }
  | { id: string; type: "link"; title: string; href: string; size?: BentoSize; pos?: XY }
  | { id: string; type: "product"; productId: string; pos?: XY }
  | { id: string; type: "note"; title?: string; text: string; size?: BentoSize; pos?: XY }
  | { id: string; type: "video"; title?: string; url: string; size?: BentoSize; pos?: XY }
  | { id: string; type: "music"; title?: string; url: string; size?: BentoSize; pos?: XY }
  | { id: string; type: "map"; label: string; address: string; size?: BentoSize; pos?: XY }
  | { id: string; type: "countdown"; title: string; targetDate: string; emoji?: string; size?: BentoSize; pos?: XY }
  | { id: string; type: "image"; url: string; caption?: string; href?: string; size?: BentoSize; pos?: XY }
  | { id: string; type: "github"; username: string; size?: BentoSize; pos?: XY }
  | { id: string; type: "calendar"; title: string; url: string; description?: string; size?: BentoSize; pos?: XY }
  | {
      id: string;
      type: "sawer";
      title?: string;
      message?: string;
      unitName?: string;
      unitPrice?: number;
      targetAmount?: number;
      currentAmount?: number;
      size?: BentoSize;
      pos?: XY;
    };

import type { ThemeName } from "./themes";
import type { XY } from "./grid";

export type { ThemeName as PageTheme } from "./themes";

export type SocialPlatform =
  | "instagram"
  | "tiktok"
  | "youtube"
  | "twitter"
  | "whatsapp"
  | "telegram"
  | "github"
  | "discord"
  | "linkedin"
  | "spotify"
  | "website";

export type SocialLinks = Partial<Record<SocialPlatform, string>>;

export function normalizeSocialUrl(platform: SocialPlatform, value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  const cleanHandle = trimmed.replace(/^@/, "");

  switch (platform) {
    case "instagram":
      return `https://instagram.com/${cleanHandle}`;
    case "tiktok":
      return `https://tiktok.com/@${cleanHandle}`;
    case "youtube":
      return `https://youtube.com/@${cleanHandle}`;
    case "twitter":
      return `https://x.com/${cleanHandle}`;
    case "whatsapp": {
      const digits = trimmed.replace(/[^0-9]/g, "");
      if (digits.startsWith("0")) {
        return `https://wa.me/62${digits.slice(1)}`;
      }
      if (digits.startsWith("8")) {
        return `https://wa.me/62${digits}`;
      }
      return `https://wa.me/${digits}`;
    }
    case "telegram":
      return `https://t.me/${cleanHandle}`;
    case "github":
      return `https://github.com/${cleanHandle}`;
    case "discord":
      return `https://discord.gg/${cleanHandle}`;
    case "linkedin":
      return `https://linkedin.com/in/${cleanHandle}`;
    case "spotify":
      return `https://open.spotify.com/user/${cleanHandle}`;
    case "website":
      return `https://${trimmed}`;
    default:
      return `https://${trimmed}`;
  }
}

export type User = {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: "creator" | "admin";
  createdAt: string;
  updatedAt: string;
};

export type Session = {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
};

export type Page = {
  id: string;
  userId?: string;
  slug: string;
  name: string;
  bio: string;
  image?: string;
  bannerImage?: string;
  socials?: SocialLinks;
  customDomain?: string;
  bento: BentoItem[];
  theme: ThemeName;
  accentColor: string;
  darkMode: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Product = {
  id: string;
  pageId: string;
  name: string;
  description: string;
  priceIdr: number;
  originalPriceIdr?: number;
  stock: number | null;
  kind: "digital" | "fisik";
  imageUrl?: string;
  fileUrl?: string;
  isActive: boolean;
  createdAt: string;
};

export type OrderStatus = "pending" | "paid" | "expired" | "cancelled" | "sent";

export type DiscountType = "percent" | "fixed";

export type Coupon = {
  id: string;
  pageId: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderIdr?: number;
  maxUses?: number | null;
  usedCount: number;
  isActive: boolean;
  expiresAt?: string | null;
  createdAt: string;
};

export type Order = {
  id: string;
  productId: string;
  pageId: string;
  buyerName: string;
  buyerContact: string;
  qty: number;
  totalIdr: number;
  feeIdr: number;
  status: OrderStatus;
  couponCode?: string;
  discountIdr?: number;
  snapToken?: string;
  createdAt: string;
  paidAt?: string;
  downloadCount?: number;
  lastDownloadedAt?: string;
};

export type PayoutStatus = "pending" | "processing" | "completed" | "rejected";

export type PayoutAccount = {
  id: string;
  userId: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  createdAt: string;
  updatedAt: string;
};

export type PayoutRequest = {
  id: string;
  userId: string;
  amountIdr: number;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  status: PayoutStatus;
  adminNotes?: string;
  proofUrl?: string;
  createdAt: string;
  processedAt?: string;
};

export type CreatorBalance = {
  totalEarnings: number;
  totalWithdrawn: number;
  pendingWithdrawals: number;
  availableBalance: number;
  minWithdrawal: number;
};

export function formatIDR(n: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);
}

export function uid(prefix = "id"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

export function parseSawerProductId(productId: string): {
  isSawer: boolean;
  bentoId?: string;
  message: string;
} {
  if (!productId.startsWith("sawer:")) {
    return { isSawer: false, message: "" };
  }
  const rest = productId.slice(6);
  const colonIndex = rest.indexOf(":");
  if (colonIndex !== -1) {
    const bentoId = rest.slice(0, colonIndex).trim() || undefined;
    const message = rest.slice(colonIndex + 1);
    return { isSawer: true, bentoId, message };
  }
  return { isSawer: true, bentoId: undefined, message: rest };
}

