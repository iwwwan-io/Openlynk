import { revalidatePath } from "next/cache";

/**
 * Revalidate all public paths associated with a creator page (ISR on-demand).
 */
export function revalidatePagePaths(slug?: string | null, customDomain?: string | null) {
  try {
    if (slug) {
      revalidatePath(`/${slug}`, "page");
      revalidatePath(`/${slug}/products`, "page");
    }
    revalidatePath("/jelajahi", "page");
    if (customDomain) {
      revalidatePath(`/domain/${customDomain}`, "page");
      revalidatePath(`/domain/${customDomain}/products`, "page");
    }
  } catch (err) {
    // Graceful fallback in non-Next.js environments (e.g. unit tests)
    if (process.env.NODE_ENV !== "test") {
      console.debug("[ISR] Skipped revalidatePagePaths:", err);
    }
  }
}

/**
 * Revalidate all public paths associated with a specific product.
 */
export function revalidateProductPaths(
  slug?: string | null,
  productId?: string | null,
  customDomain?: string | null
) {
  try {
    if (slug) {
      revalidatePath(`/${slug}`, "page");
      if (productId) {
        revalidatePath(`/${slug}/products/${productId}`, "page");
        revalidatePath(`/${slug}/p/${productId}`, "page");
      }
    }
    if (customDomain) {
      revalidatePath(`/domain/${customDomain}`, "page");
      if (productId) {
        revalidatePath(`/domain/${customDomain}/products/${productId}`, "page");
      }
    }
  } catch (err) {
    // Graceful fallback in non-Next.js environments (e.g. unit tests)
    if (process.env.NODE_ENV !== "test") {
      console.debug("[ISR] Skipped revalidateProductPaths:", err);
    }
  }
}
