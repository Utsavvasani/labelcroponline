/**
 * Secure, localStorage-backed persistence for the seller's preferred Flipkart SKU order.
 *
 * Only the SKU order (an ordered string array) is ever stored.
 * No customer data, order IDs, or PDF content is persisted.
 *
 * Key: "lco_flipkart_sku_order"
 * Value: JSON.stringify(string[])
 */

const STORAGE_KEY = "lco_flipkart_sku_order";

/**
 * Returns the stored SKU order array, or an empty array if none is saved.
 * Safe to call in SSR context (returns [] if localStorage unavailable).
 */
export function getStoredSkuOrder(): string[] {
  try {
    if (typeof window === "undefined" || !window.localStorage) return [];
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every((item) => typeof item === "string")) {
      return parsed as string[];
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Saves the provided SKU order to localStorage.
 * Safe to call in SSR context (no-op if localStorage unavailable).
 */
export function saveSkuOrder(order: string[]): void {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(order));
  } catch {
    // Quota exceeded or private browsing — silently ignore
  }
}

/**
 * Removes the saved SKU order from localStorage.
 */
export function clearSkuOrder(): void {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Silently ignore
  }
}

/**
 * Checks whether a non-empty SKU order is currently saved.
 */
export function hasStoredSkuOrder(): boolean {
  return getStoredSkuOrder().length > 0;
}
