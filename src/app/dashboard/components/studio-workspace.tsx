"use client";

import { useState } from "react";
import type { BentoSize, Page, Product, SocialLinks } from "@/lib/types";
import {
  LayoutGrid,
  Palette,
  Layers,
  ShoppingBag,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import { GridEditor } from "../grid-editor";
import { ThemePicker } from "../theme-picker";
import { ContentList } from "../content-list";
import { PageProductsManager } from "./page-products-manager";
import { QrModal } from "../qr-modal";

export type StudioSubtab = "studio" | "theme" | "content" | "products";

interface StudioWorkspaceProps {
  page: Page;
  products: Product[];
  subtab?: StudioSubtab;
  onSubtabChange?: (subtab: StudioSubtab) => void;
  onOpenAddModal: () => void;
  onResizeBento: (bentoId: string, size: BentoSize) => Promise<void>;
  onRemoveBento: (bentoId: string) => Promise<void>;
  onEditBento: (bentoId: string, data: Record<string, unknown>) => Promise<void>;
  onMoveBento: (bentoId: string, dir: number) => Promise<void>;
  onReorderBento: (order: string[]) => Promise<void>;
  onSaveTheme: (data: {
    name: string;
    bio: string;
    image?: string;
    bannerImage?: string;
    socials?: SocialLinks;
    theme: string;
    accentColor: string;
    darkMode: boolean;
  }) => Promise<void>;
  onCreateProduct: (data: {
    name: string;
    priceIdr: number;
    kind: "digital" | "fisik";
    stock: number | null;
    description: string;
  }) => Promise<void>;
  onUpdateProduct?: (
    id: string,
    data: {
      name?: string;
      priceIdr?: number;
      kind?: "digital" | "fisik";
      stock?: number | null;
      description?: string;
      imageUrl?: string;
      fileUrl?: string;
      isActive?: boolean;
    }
  ) => Promise<void>;
  onDeleteProduct?: (id: string, name: string) => Promise<void>;
  onToggleProductActive: (id: string, isActive: boolean) => Promise<void>;
  onUploadProductFile: (e: React.ChangeEvent<HTMLInputElement>, productId: string) => Promise<void>;
}

export function StudioWorkspace({
  page,
  products,
  subtab: controlledSubtab,
  onSubtabChange,
  onOpenAddModal,
  onResizeBento,
  onRemoveBento,
  onEditBento,
  onMoveBento,
  onReorderBento,
  onSaveTheme,
  onCreateProduct,
  onUpdateProduct,
  onDeleteProduct,
  onToggleProductActive,
  onUploadProductFile,
}: StudioWorkspaceProps) {
  const [internalSubtab, setInternalSubtab] = useState<StudioSubtab>("studio");
  const subtab = controlledSubtab ?? internalSubtab;

  function handleSubtabChange(nextSubtab: StudioSubtab) {
    setInternalSubtab(nextSubtab);
    onSubtabChange?.(nextSubtab);
  }

  const [copied, setCopied] = useState(false);

  function copyProfileUrl() {
    const url = `${window.location.origin}/${page.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  const subtabs = [
    { id: "studio", label: "Visual Grid", icon: LayoutGrid },
    { id: "theme", label: "Tema & Profil", icon: Palette },
    { id: "content", label: `Kartu (${page.bento?.length ?? 0})`, icon: Layers },
    { id: "products", label: `Toko (${products.length})`, icon: ShoppingBag },
  ] as const;

  return (
    <div
      id="editor-section"
      className="space-y-6"
    >
      {/* Studio Header Card */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-sm">
        {page.bannerImage && (
          <div
            className="absolute inset-0 h-24 sm:h-28 w-full bg-cover bg-center opacity-30 dark:opacity-20 blur-xs"
            style={{ backgroundImage: `url(${page.bannerImage})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/70 to-card" />
          </div>
        )}

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-4">
            <div
              className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl font-display text-xl sm:text-2xl font-bold text-white shadow-md ring-2 ring-background"
              style={{ backgroundColor: page.accentColor || "#18181b" }}
            >
              {page.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={page.image} alt={page.name} className="h-full w-full object-cover" />
              ) : (
                page.name.charAt(0).toUpperCase()
              )}
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="font-display text-xl sm:text-2xl font-extrabold text-foreground tracking-tight truncate">
                  {page.name}
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
                {page.customDomain && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-mono font-medium text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    {page.customDomain}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                <span className="font-mono text-foreground font-semibold">openlynk.id/{page.slug}</span>
                <span>•</span>
                <span className="font-medium">{page.bento?.length ?? 0} Kartu</span>
                <span>•</span>
                <span className="font-medium">{products.length} Produk</span>
              </div>
            </div>
          </div>

          {/* Quick Actions & Subtabs */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Quick Live Preview & Copy Buttons */}
            <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-2xl border border-border/60">
              <button
                type="button"
                onClick={copyProfileUrl}
                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-card transition-all cursor-pointer shadow-2xs"
                title="Salin Tautan Profil"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-emerald-500">Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Salin</span>
                  </>
                )}
              </button>

              <a
                href={`/${page.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-card transition-all shadow-2xs"
                title="Buka halaman profil publik di tab baru"
              >
                <span>Lihat Live</span>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
              </a>

              <div className="px-1 text-xs">
                <QrModal slug={page.slug} pageName={page.name} />
              </div>
            </div>

            {/* Studio Subtabs Selector */}
            <div className="flex items-center gap-1 overflow-x-auto rounded-2xl border border-border/80 bg-muted/80 p-1 text-xs scrollbar-none w-full sm:w-auto">
              {subtabs.map((st) => {
                const SubIcon = st.icon;
                const isActive = subtab === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => handleSubtabChange(st.id as StudioSubtab)}
                    className={`flex flex-1 sm:flex-none justify-center shrink-0 whitespace-nowrap items-center gap-1.5 rounded-xl px-3.5 py-1.5 font-medium transition-all cursor-pointer ${isActive
                        ? "bg-card text-foreground shadow-xs font-bold ring-1 ring-border"
                        : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                      }`}
                  >
                    <SubIcon className="h-3.5 w-3.5" />
                    <span>{st.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* SUBTAB 1: VISUAL STUDIO GRID */}
      {subtab === "studio" && (
        <GridEditor
          key={`${page.id}-${page.bento.map((b) => `${b.id}:${"size" in b ? b.size : ""}`).join(",")}`}
          pageId={page.id}
          bento={page.bento}
          products={products}
          onAddClick={onOpenAddModal}
          onResize={onResizeBento}
          onRemove={onRemoveBento}
          onEdit={onEditBento}
        />
      )}

      {/* SUBTAB 2: THEME & PROFILE DESIGN */}
      {subtab === "theme" && (
        <ThemePicker
          name={page.name}
          bio={page.bio}
          image={page.image}
          bannerImage={page.bannerImage}
          socials={page.socials}
          theme={page.theme}
          accentColor={page.accentColor}
          darkMode={page.darkMode}
          onSave={onSaveTheme}
        />
      )}

      {/* SUBTAB 3: CONTENT LIST & REORDER */}
      {subtab === "content" && (
        <ContentList
          bento={page.bento}
          onReorder={onReorderBento}
          onMove={onMoveBento}
          onResize={onResizeBento}
          onRemove={onRemoveBento}
          onEdit={onEditBento}
        />
      )}

      {/* SUBTAB 4: PRODUCTS IN THIS PAGE */}
      {subtab === "products" && (
        <PageProductsManager
          page={page}
          products={products}
          onCreateProduct={onCreateProduct}
          onUpdateProduct={onUpdateProduct}
          onDeleteProduct={onDeleteProduct}
          onToggleActive={onToggleProductActive}
          onUploadFile={onUploadProductFile}
        />
      )}
    </div>
  );
}
