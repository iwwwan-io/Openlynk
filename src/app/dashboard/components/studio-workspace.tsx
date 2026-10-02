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
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full font-display text-lg font-bold text-white shadow-xs"
            style={{ backgroundColor: page.accentColor || "#18181b" }}
          >
            {page.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={page.image} alt={page.name} className="h-full w-full object-cover" />
            ) : (
              page.name.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-xl font-bold text-foreground">{page.name}</h2>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Aktif
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              <span className="font-mono">/{page.slug}</span>
              <button
                type="button"
                onClick={copyProfileUrl}
                className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                title="Salin Tautan"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-500" />
                    <span className="text-emerald-500">Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Salin</span>
                  </>
                )}
              </button>
              <span>·</span>
              <a
                href={`/${page.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <span>Lihat Live</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Studio Subtabs Selector */}
        <div className="flex items-center gap-1 overflow-x-auto rounded-full border border-border bg-muted p-1 text-xs scrollbar-none">
          {subtabs.map((st) => {
            const SubIcon = st.icon;
            const isActive = subtab === st.id;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => handleSubtabChange(st.id as StudioSubtab)}
                className={`flex shrink-0 whitespace-nowrap items-center gap-1.5 rounded-full px-3.5 py-1.5 font-medium transition-all ${
                  isActive
                    ? "bg-card text-foreground shadow-2xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <SubIcon className="h-3.5 w-3.5" />
                <span>{st.label}</span>
              </button>
            );
          })}
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
