/**
 * Secure, localStorage-backed persistence for the seller's preferred Flipkart SKU order.
 *
 * Only the SKU order (an ordered string array) is ever stored.
 * No customer data, order IDs, or PDF content is persisted.
 *
 * Key: "lco_flipkart_sku_order"
 * Value: JSON.stringify(string[])
 */

export interface SkuGroup {
  id: string;
  name: string;
  skus: string[];
}

export type OrderItem =
  | { type: "single"; sku: string }
  | { type: "group"; group: SkuGroup };

export interface StoredSkuGroup {
  id: string;
  name: string;
  skus: string[];
}

const STORAGE_KEY = "lco_flipkart_sku_order";
const GROUPS_STORAGE_KEY = "lco_flipkart_sku_groups";

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

/**
 * Returns the saved SKU groups from localStorage.
 */
export function getStoredSkuGroups(): StoredSkuGroup[] {
  try {
    if (typeof window === "undefined" || !window.localStorage) return [];
    const raw = window.localStorage.getItem(GROUPS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (g) =>
          g &&
          typeof g.name === "string" &&
          Array.isArray(g.skus) &&
          g.skus.length >= 2
      ) as StoredSkuGroup[];
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Saves the entire list of SKU groups to localStorage.
 */
export function saveSkuGroups(groups: StoredSkuGroup[]): void {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    const validGroups = groups.filter(
      (g) => g && g.name?.trim() && Array.isArray(g.skus) && g.skus.length >= 2
    );
    window.localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(validGroups));
  } catch {
    // Silently ignore storage quota errors
  }
}

/**
 * Adds or updates a single group in localStorage.
 * If a group with matching name or ID exists, merges their SKUs and updates name.
 */
export function saveOrUpdateSkuGroup(group: { name: string; skus: string[]; id?: string }): void {
  if (!group.name?.trim() || !group.skus || group.skus.length < 2) return;
  try {
    const existing = getStoredSkuGroups();
    const cleanName = group.name.trim();
    const cleanSkus = Array.from(new Set(group.skus.map((s) => s.trim()).filter(Boolean)));

    // Look for match by id or by name (case-insensitive)
    const matchIndex = existing.findIndex(
      (g) => (group.id && g.id === group.id) || g.name.toLowerCase() === cleanName.toLowerCase()
    );

    if (matchIndex !== -1) {
      // Merge unique SKUs so variants accumulate over time
      const mergedSkus = Array.from(new Set([...existing[matchIndex].skus, ...cleanSkus]));
      existing[matchIndex] = {
        id: group.id || existing[matchIndex].id,
        name: cleanName,
        skus: mergedSkus,
      };
    } else {
      existing.push({
        id: group.id || `group-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: cleanName,
        skus: cleanSkus,
      });
    }

    saveSkuGroups(existing);
  } catch {
    // Silently ignore
  }
}

/**
 * Removes a group by ID or Name from localStorage.
 */
export function removeStoredSkuGroup(groupIdOrName: string): void {
  try {
    const existing = getStoredSkuGroups();
    const filtered = existing.filter(
      (g) => g.id !== groupIdOrName && g.name.toLowerCase() !== groupIdOrName.toLowerCase()
    );
    saveSkuGroups(filtered);
  } catch {
    // Silently ignore
  }
}

/**
 * Removes a specific SKU from a stored group. If fewer than 2 SKUs remain, the group is removed.
 */
export function removeSkuFromStoredGroup(groupIdOrName: string, skuToRemove: string): void {
  try {
    const existing = getStoredSkuGroups();
    const matchIndex = existing.findIndex(
      (g) => g.id === groupIdOrName || g.name.toLowerCase() === groupIdOrName.toLowerCase()
    );
    if (matchIndex === -1) return;

    const remainingSkus = existing[matchIndex].skus.filter((s) => s !== skuToRemove);
    if (remainingSkus.length < 2) {
      existing.splice(matchIndex, 1);
    } else {
      existing[matchIndex].skus = remainingSkus;
    }
    saveSkuGroups(existing);
  } catch {
    // Silently ignore
  }
}

/**
 * Syncs all currently active groups from the UI into localStorage.
 */
export function syncAllCurrentGroupsToStorage(activeGroups: SkuGroup[]): void {
  for (const group of activeGroups) {
    saveOrUpdateSkuGroup(group);
  }
}

/**
 * Clears all SKU groups from localStorage.
 */
export function clearSkuGroups(): void {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    window.localStorage.removeItem(GROUPS_STORAGE_KEY);
  } catch {
    // Silently ignore
  }
}

/**
 * Checks if any SKU groups are stored in localStorage.
 */
export function hasStoredSkuGroups(): boolean {
  return getStoredSkuGroups().length > 0;
}

/**
 * Checks the given list of SKUs against stored groups.
 * If 2 or more SKUs belonging to a stored group are found, they are automatically
 * bundled into a group at the position of the earliest matching SKU.
 */
export function autoGroupSkus(
  currentSkus: string[],
  storedGroups: StoredSkuGroup[] = getStoredSkuGroups()
): { orderItems: OrderItem[]; autoGroupedGroupIds: string[] } {
  if (!currentSkus || currentSkus.length === 0) {
    return { orderItems: [], autoGroupedGroupIds: [] };
  }

  if (!storedGroups || storedGroups.length === 0) {
    return {
      orderItems: currentSkus.map((sku) => ({ type: "single", sku })),
      autoGroupedGroupIds: [],
    };
  }

  const currentSet = new Set(currentSkus);
  const claimedSkus = new Set<string>();
  const matchedGroups: {
    group: SkuGroup;
    matchedSkus: string[];
    firstIndex: number;
  }[] = [];

  for (const stored of storedGroups) {
    // Find SKUs in current PDF that belong to this stored group and aren't already claimed
    const matched = stored.skus.filter((s) => currentSet.has(s) && !claimedSkus.has(s));

    // Must have at least 2 matching SKUs in this PDF to form a group
    if (matched.length >= 2) {
      matched.forEach((s) => claimedSkus.add(s));

      // Determine earliest position of any matched SKU in currentSkus
      const firstIndex = Math.min(...matched.map((s) => currentSkus.indexOf(s)));

      matchedGroups.push({
        group: {
          id: stored.id || `group-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: stored.name,
          skus: matched,
        },
        matchedSkus: matched,
        firstIndex,
      });
    }
  }

  // If no groups matched, return all singles
  if (matchedGroups.length === 0) {
    return {
      orderItems: currentSkus.map((sku) => ({ type: "single", sku })),
      autoGroupedGroupIds: [],
    };
  }

  // Build the final orderItems list preserving the relative position of earliest SKU
  const orderItems: OrderItem[] = [];
  const insertedGroupIds = new Set<string>();

  for (let i = 0; i < currentSkus.length; i++) {
    const sku = currentSkus[i];

    if (claimedSkus.has(sku)) {
      // Find which group owns this SKU
      const groupMatch = matchedGroups.find((mg) => mg.matchedSkus.includes(sku));
      if (groupMatch && !insertedGroupIds.has(groupMatch.group.id)) {
        // Insert group at the position of its first encountered SKU
        orderItems.push({ type: "group", group: groupMatch.group });
        insertedGroupIds.add(groupMatch.group.id);
      }
      // Subsequent SKUs of this group are absorbed into the group, so skip pushing them
    } else {
      orderItems.push({ type: "single", sku });
    }
  }

  return {
    orderItems,
    autoGroupedGroupIds: Array.from(insertedGroupIds),
  };
}

