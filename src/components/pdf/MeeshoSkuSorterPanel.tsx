"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import {
  Download,
  Loader2,
  Package,
  GripVertical,
  CheckCircle,
  Trash2,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Layers,
  ChevronDown,
  Edit2,
  Check,
  Plus,
  Split,
  Files,
  FileText,
} from "lucide-react";
import type { PageSkuMap } from "@/lib/pdf/meeshoSkuExtractor";
import {
  buildMeeshoSkuGroupedPdf,
  countPagesPerSku,
  UNKNOWN_SKU,
} from "@/lib/pdf/meeshoSkuExtractor";
import {
  saveSkuOrder,
  clearSkuOrder,
  hasStoredSkuOrder,
  getStoredSkuGroups,
  saveOrUpdateSkuGroup,
  removeStoredSkuGroup,
  removeSkuFromStoredGroup,
  syncAllCurrentGroupsToStorage,
  clearSkuGroups,
  hasStoredSkuGroups,
  autoGroupSkus,
  type SkuGroup,
  type OrderItem,
} from "@/lib/meeshoSkuStorage";
import { triggerDownload, type MeeshoCropMode, type MeeshoPartner } from "@/lib/pdf/meeshoCropper";

export type { SkuGroup, OrderItem };

/**
 * Helper to display clean group names without redundant "Group: Group" prefixes
 * or outdated static SKU counts like "(2 SKUs)" when the count has changed.
 */
function getCleanGroupName(rawName: string): string {
  let cleaned = rawName.replace(/\s*\(\d+\s*SKUs?\)/gi, "").trim();
  if (!cleaned) cleaned = "Group";
  if (cleaned.toLowerCase().startsWith("group")) {
    return cleaned;
  }
  return `Group: ${cleaned}`;
}

interface MeeshoSkuSorterPanelProps {
  file: File;
  pageSkuMap: PageSkuMap;
  skuOrder: string[];
  onSkuOrderChange: (newOrder: string[]) => void;
  cropMode?: MeeshoCropMode;
  selectedPartner?: MeeshoPartner;
  onDownloadComplete?: () => void;
  sourceFilesCount?: number;
  totalLabelsCount?: number;
  fileBreakdown?: { name: string; pages: number }[];
}

export function MeeshoSkuSorterPanel({
  file,
  pageSkuMap,
  skuOrder,
  onSkuOrderChange,
  cropMode = "invoice",
  selectedPartner = "auto",
  onDownloadComplete,
  sourceFilesCount = 1,
  totalLabelsCount,
  fileBreakdown,
}: MeeshoSkuSorterPanelProps) {
  const [isBuilding, setIsBuilding] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [hasSavedBefore, setHasSavedBefore] = useState(() => hasStoredSkuOrder() || hasStoredSkuGroups());

  // Grouped Order Items State: auto-detect groups from localStorage upon initial load
  const [orderItems, setOrderItems] = useState<OrderItem[]>(() => {
    const storedGroups = getStoredSkuGroups();
    const { orderItems: initialGrouped } = autoGroupSkus(skuOrder, storedGroups);
    return initialGrouped;
  });

  // Expanded Groups state: Set of group IDs that are expanded
  const [expandedGroupIds, setExpandedGroupIds] = useState<Set<string>>(() => {
    const storedGroups = getStoredSkuGroups();
    const { autoGroupedGroupIds } = autoGroupSkus(skuOrder, storedGroups);
    return new Set(autoGroupedGroupIds);
  });

  // Checkbox selection state for manual multi-select grouping
  const [selectedSkus, setSelectedSkus] = useState<Set<string>>(new Set());

  // Group Renaming state
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [groupNameInput, setGroupNameInput] = useState<string>("");

  // Add Selected SKUs to existing group dropdown state (left toolbar)
  const [showAddToGroupMenu, setShowAddToGroupMenu] = useState(false);

  // Highlighted & Hovered Group (for Live Position Connection)
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [hoveredGroupId, setHoveredGroupId] = useState<string | null>(null);

  // Remember initial extraction order for "Reset to PDF Order"
  const originalPdfOrderRef = useRef<string[]>(skuOrder);
  useEffect(() => {
    if (originalPdfOrderRef.current.length === 0 && skuOrder.length > 0) {
      originalPdfOrderRef.current = skuOrder;
    }
  }, [skuOrder]);

  // Sync orderItems if external skuOrder changes completely (e.g. newly uploaded PDF)
  useEffect(() => {
    const currentSkus = orderItems.flatMap((it) =>
      it.type === "single" ? [it.sku] : it.group.skus
    );
    const isDifferent =
      currentSkus.length !== skuOrder.length ||
      !skuOrder.every((s) => currentSkus.includes(s));

    if (isDifferent) {
      const storedGroups = getStoredSkuGroups();
      const { orderItems: autoGrouped, autoGroupedGroupIds } = autoGroupSkus(skuOrder, storedGroups);
      setOrderItems(autoGrouped);
      setSelectedSkus(new Set());
      if (autoGroupedGroupIds.length > 0) {
        setExpandedGroupIds((prev) => {
          const copy = new Set(prev);
          autoGroupedGroupIds.forEach((id) => copy.add(id));
          return copy;
        });
      }
    }
  }, [skuOrder]);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [groupSearchQuery, setGroupSearchQuery] = useState("");

  // PDF Breakdown Popover State (clickable & scrollable on both mobile & desktop)
  const [showPdfBreakdown, setShowPdfBreakdown] = useState(false);
  const pdfBreakdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (pdfBreakdownRef.current && !pdfBreakdownRef.current.contains(e.target as Node)) {
        setShowPdfBreakdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  // Direct Jump Editing State
  const [jumpItemIndex, setJumpItemIndex] = useState<number | null>(null);
  const [jumpRankInput, setJumpRankInput] = useState<string>("");

  // Drag-and-drop state
  const dragIndexRef = useRef<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const pageCounts = useMemo(() => countPagesPerSku(pageSkuMap), [pageSkuMap]);

  /* ── Helper: Broadcast updated flattened skuOrder to parent ── */
  const updateItemsAndEmit = (newItems: OrderItem[]) => {
    setOrderItems(newItems);
    const flattened = newItems.flatMap((it) =>
      it.type === "single" ? [it.sku] : it.group.skus
    );
    onSkuOrderChange(flattened);
    setConfirmed(false);
  };

  /* ── Helper: Total label count for an OrderItem ── */
  const getItemLabelCount = (item: OrderItem): number => {
    if (item.type === "single") {
      return pageCounts[item.sku] || 0;
    }
    return item.group.skus.reduce((sum, s) => sum + (pageCounts[s] || 0), 0);
  };

  /* ── Filtered Items based on search query ── */
  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return orderItems;
    return orderItems.filter((item, index) => {
      const rank = (index + 1).toString();
      if (rank === q) return true;
      if (item.type === "single") {
        return item.sku.toLowerCase().includes(q);
      } else {
        return (
          item.group.name.toLowerCase().includes(q) ||
          item.group.skus.some((s) => s.toLowerCase().includes(q))
        );
      }
    });
  }, [orderItems, searchQuery]);

  // Find standalone matching SKUs from the current search results for quick grouping
  const matchingSingleSkus = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    const skus: string[] = [];
    filteredItems.forEach((it) => {
      if (it.type === "single") {
        skus.push(it.sku);
      }
    });
    return skus;
  }, [filteredItems, searchQuery]);

  const paginatedItems = filteredItems;

  // Extract all groups currently created, preserving their sequence position
  const allGroupsWithPosition = useMemo(() => {
    const groups: { group: SkuGroup; position: number; globalIndex: number }[] = [];
    orderItems.forEach((it, idx) => {
      if (it.type === "group") {
        groups.push({ group: it.group, position: idx + 1, globalIndex: idx });
      }
    });
    return groups;
  }, [orderItems]);

  // Filtered groups based on groupSearchQuery
  const filteredGroupsWithPosition = useMemo(() => {
    const q = groupSearchQuery.trim().toLowerCase();
    if (!q) return allGroupsWithPosition;
    return allGroupsWithPosition.filter(({ group, position }) => {
      if (position.toString() === q) return true;
      if (group.name.toLowerCase().includes(q)) return true;
      return group.skus.some((s) => s.toLowerCase().includes(q));
    });
  }, [allGroupsWithPosition, groupSearchQuery]);

  // ── Live Scroll Synchronization & Connected Group Refs ──
  const leftListRef = useRef<HTMLDivElement>(null);
  const rightListRef = useRef<HTMLDivElement>(null);
  const groupSlotRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const groupCardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Helper: Smoothly scroll an element to the exact vertical center of a container
  const scrollElementToCenter = (
    container: HTMLDivElement | null | undefined,
    element: HTMLDivElement | null | undefined,
    smooth = true
  ) => {
    if (!container || !element) return;
    const containerRect = container.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    const currentScrollTop = container.scrollTop;
    // Calculate the distance of element center from container top in the scroll coordinate space
    const elementTopInContainer = (elementRect.top - containerRect.top) + currentScrollTop;
    const targetScrollTop = elementTopInContainer - (container.clientHeight / 2) + (elementRect.height / 2);

    container.scrollTo({
      top: Math.max(0, targetScrollTop),
      behavior: smooth ? "smooth" : "auto",
    });
  };

  // Smooth scroll helper: Right column scrolls to group card and centers it
  const scrollToRightGroup = (groupId: string, smooth = true) => {
    if (groupSearchQuery.trim()) {
      const isCardRendered = groupCardRefs.current.has(groupId);
      if (!isCardRendered) {
        setGroupSearchQuery("");
        setTimeout(() => {
          const cardEl = groupCardRefs.current.get(groupId);
          const rightContainer = rightListRef.current;
          scrollElementToCenter(rightContainer, cardEl, smooth);
        }, 50);
        return;
      }
    }
    const cardEl = groupCardRefs.current.get(groupId);
    const rightContainer = rightListRef.current;
    if (cardEl && rightContainer) {
      scrollElementToCenter(rightContainer, cardEl, smooth);
    } else {
      setTimeout(() => {
        const c = groupCardRefs.current.get(groupId);
        const r = rightListRef.current;
        scrollElementToCenter(r, c, smooth);
      }, 50);
    }
  };

  // Smooth scroll helper: Left column scrolls to group position slot and centers it
  const scrollToLeftGroupSlot = (groupId: string, smooth = true) => {
    if (searchQuery.trim()) {
      const isSlotRendered = groupSlotRefs.current.has(groupId);
      if (!isSlotRendered) {
        setSearchQuery("");
        setTimeout(() => {
          const slotEl = groupSlotRefs.current.get(groupId);
          const leftContainer = leftListRef.current;
          scrollElementToCenter(leftContainer, slotEl, smooth);
        }, 50);
        return;
      }
    }
    const slotEl = groupSlotRefs.current.get(groupId);
    const leftContainer = leftListRef.current;
    if (slotEl && leftContainer) {
      scrollElementToCenter(leftContainer, slotEl, smooth);
    } else {
      setTimeout(() => {
        const s = groupSlotRefs.current.get(groupId);
        const l = leftListRef.current;
        scrollElementToCenter(l, s, smooth);
      }, 50);
    }
  };

  /* ── Group Creation: From Search or Checkbox Selection ── */
  const createGroupFromSkus = (skusToGroup: string[], defaultName?: string) => {
    if (skusToGroup.length < 2) return;

    let name = defaultName;
    if (!name) {
      if (searchQuery.trim()) {
        name = searchQuery.trim();
      } else {
        const existingGroupCount = orderItems.filter((it) => it.type === "group").length;
        name = `Group ${existingGroupCount + 1}`;
      }
    }

    const newGroup: SkuGroup = {
      id: `group-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name,
      skus: skusToGroup,
    };

    // Find first occurrence index of any of these SKUs
    let firstIndex = -1;
    for (let i = 0; i < orderItems.length; i++) {
      const it = orderItems[i];
      if (it.type === "single" && skusToGroup.includes(it.sku)) {
        firstIndex = i;
        break;
      }
    }
    if (firstIndex === -1) firstIndex = 0;

    // Remove these SKUs from wherever they are
    const remainingItems = orderItems.filter((it) => {
      if (it.type === "single") {
        return !skusToGroup.includes(it.sku);
      }
      return true;
    });

    // Insert the new group at the firstIndex position
    const targetIdx = Math.min(firstIndex, remainingItems.length);
    remainingItems.splice(targetIdx, 0, { type: "group", group: newGroup });

    // Persist to localStorage
    saveOrUpdateSkuGroup(newGroup);
    setHasSavedBefore(true);

    setExpandedGroupIds((prev) => new Set(prev).add(newGroup.id));
    setActiveGroupId(newGroup.id);
    setSelectedSkus(new Set());
    updateItemsAndEmit(remainingItems);
    scrollToRightGroup(newGroup.id, true);
  };

  /* ── Ungroup: Dissolve group back to individual items ── */
  const handleUngroup = (groupId: string) => {
    const targetIdx = orderItems.findIndex(
      (it) => it.type === "group" && it.group.id === groupId
    );
    if (targetIdx === -1) return;

    const groupItem = orderItems[targetIdx] as { type: "group"; group: SkuGroup };
    const replacementSingles: OrderItem[] = groupItem.group.skus.map((sku) => ({
      type: "single",
      sku,
    }));

    const next = [...orderItems];
    next.splice(targetIdx, 1, ...replacementSingles);
    setExpandedGroupIds((prev) => {
      const copy = new Set(prev);
      copy.delete(groupId);
      return copy;
    });
    if (activeGroupId === groupId) setActiveGroupId(null);

    // Remove from localStorage
    removeStoredSkuGroup(groupId);

    updateItemsAndEmit(next);
  };

  /* ── Add SKUs to an Existing Group ── */
  const handleAddSkusToGroup = (groupId: string, skusToAdd: string[]) => {
    const cleanSkus = skusToAdd
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    if (cleanSkus.length === 0) return;

    const groupIdx = orderItems.findIndex(
      (it) => it.type === "group" && it.group.id === groupId
    );
    if (groupIdx === -1) return;

    const groupItem = orderItems[groupIdx] as { type: "group"; group: SkuGroup };
    const existingSkusSet = new Set(groupItem.group.skus);
    const newUniqueSkus = cleanSkus.filter((s) => !existingSkusSet.has(s));
    if (newUniqueSkus.length === 0) return;

    const updatedSkus = [...groupItem.group.skus, ...newUniqueSkus];
    const updatedGroup: SkuGroup = { ...groupItem.group, skus: updatedSkus };

    // Remove newly added SKUs from standalone single items in orderItems
    const next = orderItems.filter((it) => {
      if (it.type === "single") {
        return !newUniqueSkus.includes(it.sku);
      }
      return true;
    });

    const targetIdx = next.findIndex(
      (it) => it.type === "group" && it.group.id === groupId
    );
    if (targetIdx !== -1) {
      next[targetIdx] = { type: "group", group: updatedGroup };
    }

    // Persist to localStorage
    saveOrUpdateSkuGroup(updatedGroup);
    setHasSavedBefore(true);

    // Expand group so user immediately sees the newly added SKU
    setExpandedGroupIds((prev) => new Set(prev).add(groupId));
    setActiveGroupId(groupId);

    // Uncheck added skus from multi-selection
    setSelectedSkus((prev) => {
      const copy = new Set(prev);
      newUniqueSkus.forEach((s) => copy.delete(s));
      return copy;
    });

    updateItemsAndEmit(next);
    scrollToRightGroup(groupId, true);
  };

  /* ── Remove a single SKU from a group ── */
  const handleRemoveSkuFromGroup = (groupId: string, skuToRemove: string) => {
    const groupIdx = orderItems.findIndex(
      (it) => it.type === "group" && it.group.id === groupId
    );
    if (groupIdx === -1) return;

    const groupItem = orderItems[groupIdx] as { type: "group"; group: SkuGroup };
    const updatedSkus = groupItem.group.skus.filter((s) => s !== skuToRemove);

    const next = [...orderItems];
    if (updatedSkus.length <= 1) {
      const remainingSingles: OrderItem[] = updatedSkus.map((s) => ({
        type: "single",
        sku: s,
      }));
      next.splice(groupIdx, 1, ...remainingSingles, { type: "single", sku: skuToRemove });
      removeStoredSkuGroup(groupId);
    } else {
      const updatedGroup = { ...groupItem.group, skus: updatedSkus };
      next[groupIdx] = {
        type: "group",
        group: updatedGroup,
      };
      next.splice(groupIdx + 1, 0, { type: "single", sku: skuToRemove });
      saveOrUpdateSkuGroup(updatedGroup);
    }
    updateItemsAndEmit(next);
  };

  /* ── Direct Rank Jump (e.g. Type #1 or #5) ── */
  const applyJumpToRank = (currentIndex: number) => {
    const parsed = parseInt(jumpRankInput, 10);
    if (isNaN(parsed) || parsed < 1 || parsed > orderItems.length) {
      setJumpItemIndex(null);
      return;
    }
    const targetIndex = parsed - 1;
    if (currentIndex === targetIndex) {
      setJumpItemIndex(null);
      return;
    }
    const next = [...orderItems];
    const [item] = next.splice(currentIndex, 1);
    next.splice(targetIndex, 0, item);
    updateItemsAndEmit(next);
    setJumpItemIndex(null);
    setJumpRankInput("");
  };

  /* ── Drag and Drop handlers ── */
  const handleDragStart = (index: number) => {
    dragIndexRef.current = index;
  };

  const handleDragEnter = (index: number) => {
    setDragOverIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (dropIndex: number) => {
    const dragIndex = dragIndexRef.current;
    if (dragIndex === null || dragIndex === dropIndex) {
      dragIndexRef.current = null;
      setDragOverIndex(null);
      return;
    }
    const next = [...orderItems];
    const [dragged] = next.splice(dragIndex, 1);
    next.splice(dropIndex, 0, dragged);
    updateItemsAndEmit(next);
    dragIndexRef.current = null;
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    dragIndexRef.current = null;
    setDragOverIndex(null);
  };

  /* ── Bulk Sorting Actions ── */
  const handleSortAlphabetical = (ascending = true) => {
    const sorted = [...orderItems].sort((a, b) => {
      const nameA = a.type === "single" ? a.sku : a.group.name;
      const nameB = b.type === "single" ? b.sku : b.group.name;
      if (nameA === UNKNOWN_SKU) return 1;
      if (nameB === UNKNOWN_SKU) return -1;
      return ascending ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });
    updateItemsAndEmit(sorted);
  };

  const handleSortByQuantity = (descending = true) => {
    const sorted = [...orderItems].sort((a, b) => {
      const countA = getItemLabelCount(a);
      const countB = getItemLabelCount(b);
      return descending ? countB - countA : countA - countB;
    });
    updateItemsAndEmit(sorted);
  };

  /* ── Clear Saved Order and Groups from LocalStorage ── */
  const handleClearSaved = () => {
    clearSkuOrder();
    clearSkuGroups();
    setHasSavedBefore(false);
  };

  /* ── Confirm & Download ── */
  const handleConfirmAndDownload = async () => {
    setIsBuilding(true);
    setErrorMsg(null);
    try {
      const flattened = orderItems.flatMap((it) =>
        it.type === "single" ? [it.sku] : it.group.skus
      );
      saveSkuOrder(flattened);
      const activeGroups = orderItems
        .filter((it): it is { type: "group"; group: SkuGroup } => it.type === "group")
        .map((it) => it.group);
      syncAllCurrentGroupsToStorage(activeGroups);
      setHasSavedBefore(true);
      setConfirmed(true);

      const result = await buildMeeshoSkuGroupedPdf(
        file,
        pageSkuMap,
        flattened,
        cropMode,
        selectedPartner,
        orderItems
      );
      triggerDownload(result.blobUrl, result.fileName);
      setTimeout(() => URL.revokeObjectURL(result.blobUrl), 5000);
      onDownloadComplete?.();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to build grouped PDF.";
      setErrorMsg(msg);
      setConfirmed(false);
    } finally {
      setIsBuilding(false);
    }
  };

  const totalGroupsCount = allGroupsWithPosition.length;
  const effectiveLabelsCount = totalLabelsCount ?? Object.keys(pageSkuMap).length;
  const effectiveFilesCount = sourceFilesCount ?? 1;

  return (
    <div className="w-full flex flex-col bg-white">
      {/* ── 2. Information Bar: Clean Stat Strip (Number Top, Description Bottom, Seamless No-Div Style) ── */}
      <div className="px-4 py-2 bg-slate-50/70 border-b border-slate-300 flex items-center justify-around sm:justify-center sm:gap-14 text-center select-none">
        {/* Merged PDFs Count */}
        {effectiveFilesCount > 1 ? (
          <div
            ref={pdfBreakdownRef}
            onClick={() => setShowPdfBreakdown((prev) => !prev)}
            className="relative flex flex-col items-center cursor-pointer select-none"
            title="Click to view all merged files and page counts"
          >
            <span className="text-sm sm:text-base font-bold text-slate-800 leading-tight flex items-center gap-0.5">
              <span>{effectiveFilesCount}</span>
              {fileBreakdown && fileBreakdown.length > 0 && (
                <ChevronDown
                  size={11}
                  className={`text-slate-400 transition-transform duration-150 ${showPdfBreakdown ? "rotate-180 text-[#051448]" : ""}`}
                />
              )}
            </span>
            <span className="text-[11px] font-medium text-slate-500">PDFs</span>

            {/* Clickable & Scrollable Breakdown Popover */}
            {fileBreakdown && fileBreakdown.length > 0 && (
              <div
                className={`absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center transition-all duration-150 ${
                  showPdfBreakdown
                    ? "opacity-100 pointer-events-auto scale-100"
                    : "opacity-0 pointer-events-none scale-95"
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-2.5 h-2.5 bg-white border-t border-l border-slate-300 rotate-45 -mb-1.5 z-10" />
                <div className="bg-white text-slate-900 border border-slate-300 text-xs rounded-lg shadow-xl p-3 min-w-[260px] max-w-[320px] space-y-2 text-left">
                  <div className="font-bold text-[11px] uppercase tracking-wider text-[#051448] border-b border-slate-200 pb-1.5 flex justify-between items-center">
                    <span>Combined Files ({effectiveFilesCount})</span>
                    <span className="text-[10px] font-semibold text-slate-500">{effectiveLabelsCount} Labels</span>
                  </div>
                  {/* Scrollable list with mouse wheel and touch scroll */}
                  <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 overscroll-contain">
                    {fileBreakdown.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[11px] gap-2 text-slate-800 py-0.5 border-b border-slate-50 last:border-0">
                        <span className="truncate max-w-[175px] font-medium" title={item.name}>
                          {idx + 1}. {item.name}
                        </span>
                        <span className="font-semibold shrink-0 bg-blue-50 px-2 py-0.5 rounded text-[#051448] border border-blue-200/60 text-[10px]">
                          {item.pages} {item.pages === 1 ? "page" : "pages"}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-1 border-t border-slate-100 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowPdfBreakdown(false)}
                      className="text-[10px] font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <span className="text-sm sm:text-base font-bold text-slate-800 leading-tight">1</span>
            <span className="text-[11px] font-medium text-slate-500">PDF</span>
          </div>
        )}

        {/* Total Labels Count */}
        <div className="flex flex-col items-center">
          <span className="text-sm sm:text-base font-bold text-[#051448] leading-tight">
            {effectiveLabelsCount}
          </span>
          <span className="text-[11px] font-medium text-slate-500">
            {effectiveLabelsCount === 1 ? "Label" : "Labels"}
          </span>
        </div>

        {/* Unique SKUs Count */}
        <div className="flex flex-col items-center">
          <span className="text-sm sm:text-base font-bold text-slate-800 leading-tight">
            {skuOrder.length}
          </span>
          <span className="text-[11px] font-medium text-slate-500">
            SKUs
          </span>
        </div>

        {/* Product Groups Count */}
        <div className="flex flex-col items-center">
          <span className="text-sm sm:text-base font-bold text-indigo-700 leading-tight">
            {totalGroupsCount}
          </span>
          <span className="text-[11px] font-medium text-slate-500">
            {totalGroupsCount === 1 ? "Group" : "Groups"}
          </span>
        </div>
      </div>

      {/* ── Error Alert ── */}
      {errorMsg && (
        <div className="mx-3 mt-2 px-3 py-2 rounded-md border border-red-200 bg-red-50 text-red-700 text-xs flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="font-bold ml-2 cursor-pointer">✕</button>
        </div>
      )}

      {/* ── TWO-PART SPLIT: Seamless Left & Right with single vertical divider ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch bg-white">
        {/* ════════ LEFT PART: SKUs & Sequence Order (7 Cols) ════════ */}
        <div className="lg:col-span-7 flex flex-col lg:border-r border-slate-400">
          {/* Header with Search Bar & All 3 Buttons Beside It (Height matching Product Groups search bar) */}
          <div className="px-2.5 py-1.5 bg-white border-b border-slate-400 flex items-center gap-1.5 sm:gap-2 text-xs">
            {/* Search Bar: Same height & padding as group search bar, width flexible to fit buttons */}
            <div className="relative flex-1 min-w-0 flex items-center">
              <Search size={15} className="absolute left-2.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search SKUs..."
                className="w-full h-[34px] pl-8.5 pr-7 py-1.5 text-xs sm:text-sm bg-slate-50/60 hover:bg-white focus:bg-white border border-slate-400 rounded-md focus:outline-hidden focus:border-[#051448] focus:ring-1 focus:ring-[#051448]/20 text-slate-900 font-normal placeholder:text-slate-400 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
                  title="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Actions Beside Search Bar: Contextual Grouping Actions + All 3 Sort Buttons */}
            <div className="flex items-center gap-1 shrink-0">
              {matchingSingleSkus.length >= 2 && (
                <button
                  type="button"
                  onClick={() => createGroupFromSkus(matchingSingleSkus)}
                  className="h-[34px] flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-2 rounded-md text-xs cursor-pointer shrink-0 shadow-2xs transition-colors"
                  title={`Group ${matchingSingleSkus.length} matched SKUs together`}
                >
                  <Layers size={13} />
                  <span>Group {matchingSingleSkus.length}</span>
                </button>
              )}

              {selectedSkus.size >= 2 && (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => createGroupFromSkus(Array.from(selectedSkus))}
                    className="h-[34px] flex items-center gap-1 bg-[#051448] hover:bg-[#071a5e] text-white font-medium px-2 rounded-md text-xs cursor-pointer shrink-0 shadow-2xs transition-colors"
                    title={`Group ${selectedSkus.size} selected SKUs together`}
                  >
                    <Plus size={13} />
                    <span>Group ({selectedSkus.size})</span>
                  </button>

                  {allGroupsWithPosition.length > 0 && (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowAddToGroupMenu((prev) => !prev)}
                        className="h-[34px] flex items-center gap-1 bg-white hover:bg-indigo-50/50 text-indigo-900 border border-indigo-300 font-medium px-1.5 rounded-md text-xs cursor-pointer shrink-0 shadow-2xs transition-colors"
                        title={`Add ${selectedSkus.size} selected SKU(s) to an existing group`}
                      >
                        <Layers size={13} className="text-indigo-600" />
                        <ChevronDown size={12} />
                      </button>

                      {showAddToGroupMenu && (
                        <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-slate-400 rounded-md shadow-lg z-50 py-1 text-xs max-h-48 overflow-y-auto">
                          <div className="px-2.5 py-1 text-[10px] font-medium text-slate-500 border-b border-slate-200 uppercase tracking-wider">
                            Select Target Group:
                          </div>
                          {allGroupsWithPosition.map(({ group, position }) => (
                            <button
                              key={group.id}
                              type="button"
                              onClick={() => {
                                handleAddSkusToGroup(group.id, Array.from(selectedSkus));
                                setShowAddToGroupMenu(false);
                              }}
                              className="w-full text-left px-2.5 py-1 hover:bg-indigo-50/70 text-slate-800 font-normal flex items-center justify-between gap-1 cursor-pointer transition-colors"
                            >
                              <span className="truncate">{getCleanGroupName(group.name)}</span>
                              <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 py-0.2 rounded-full shrink-0 font-medium">
                                Pos {position}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* All Three Sort Buttons beside Search Bar */}
              <button
                type="button"
                onClick={() => handleSortAlphabetical(true)}
                className="h-[34px] px-2 rounded-md font-medium text-slate-700 hover:text-[#051448] border border-slate-400 hover:border-[#051448] bg-white hover:bg-slate-50 transition-colors cursor-pointer text-xs shadow-2xs flex items-center justify-center whitespace-nowrap"
                title="Sort SKUs A to Z"
              >
                A→Z
              </button>

              <button
                type="button"
                onClick={() => handleSortByQuantity(true)}
                className="h-[34px] px-2 rounded-md font-medium text-slate-700 hover:text-[#051448] border border-slate-400 hover:border-[#051448] bg-white hover:bg-slate-50 transition-colors cursor-pointer text-xs shadow-2xs flex items-center justify-center whitespace-nowrap"
                title="Sort by highest label quantity first"
              >
                Qty ↓
              </button>

              <button
                type="button"
                onClick={handleClearSaved}
                disabled={!hasSavedBefore}
                className="h-[34px] px-2 rounded-md font-medium text-red-600 hover:text-red-700 disabled:text-slate-300 border border-slate-400 hover:border-red-400 disabled:border-slate-300 bg-white hover:bg-red-50 disabled:bg-slate-50 transition-colors cursor-pointer disabled:cursor-not-allowed text-xs shadow-2xs flex items-center justify-center"
                title={hasSavedBefore ? "Reset saved SKU arrangement" : "Default arrangement active"}
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>

          {/* Left Scrollable List */}
          <div
            ref={leftListRef}
            className="divide-y divide-slate-400 max-h-[150px] sm:max-h-[165px] lg:max-h-[380px] overflow-y-auto bg-white border-t border-slate-400"
          >
            {paginatedItems.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No SKUs match &ldquo;{searchQuery}&rdquo;.
              </div>
            ) : (
              paginatedItems.map((item) => {
                const globalIndex = orderItems.indexOf(item);
                const isDragTarget = dragOverIndex === globalIndex;
                const isEditingJump = jumpItemIndex === globalIndex;

                /* ── Item is a Group Slot Placeholder on the Left ── */
                if (item.type === "group") {
                  const group = item.group;
                  const totalGroupLabels = getItemLabelCount(item);
                  const isConnected = activeGroupId === group.id || hoveredGroupId === group.id;

                  return (
                    <div
                      key={`slot-${group.id}`}
                      ref={(el) => {
                        if (el) groupSlotRefs.current.set(group.id, el);
                        else groupSlotRefs.current.delete(group.id);
                      }}
                      draggable={!isEditingJump}
                      onDragStart={() => handleDragStart(globalIndex)}
                      onDragEnter={() => handleDragEnter(globalIndex)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(globalIndex)}
                      onDragEnd={handleDragEnd}
                      onMouseEnter={() => setHoveredGroupId(group.id)}
                      onMouseLeave={() => setHoveredGroupId(null)}
                      onClick={() => {
                        setActiveGroupId(group.id);
                        scrollToRightGroup(group.id, true);
                      }}
                      className={`flex items-center gap-2 px-3 py-1.5 text-xs cursor-pointer select-none transition-colors ${isConnected
                        ? "bg-indigo-100/80 text-indigo-950 font-semibold"
                        : isDragTarget
                          ? "bg-[#051448]/15"
                          : "bg-slate-100/70 hover:bg-slate-200/70 text-slate-900"
                        }`}
                    >
                      {/* Group Type Indicator (strictly aligned with Checkbox slot w-6) */}
                      <div className="flex items-center justify-center p-0.5 shrink-0" title="Product Group">
                        <div className={`w-5 h-5 flex items-center justify-center rounded border ${isConnected ? "bg-indigo-200 border-indigo-400 text-indigo-900" : "bg-indigo-100 border-indigo-300 text-indigo-800"}`}>
                          <Layers size={12} />
                        </div>
                      </div>

                      {/* Drag Handle */}
                      <GripVertical
                        size={14}
                        className="shrink-0 text-slate-600 cursor-grab active:cursor-grabbing"
                      />

                      {/* Position Number */}
                      {isEditingJump ? (
                        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="number"
                            min={1}
                            max={orderItems.length}
                            value={jumpRankInput}
                            onChange={(e) => setJumpRankInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") applyJumpToRank(globalIndex);
                              if (e.key === "Escape") setJumpItemIndex(null);
                            }}
                            autoFocus
                            placeholder={`${globalIndex + 1}`}
                            className="w-11 px-1 py-0.5 text-xs text-center border border-indigo-600 bg-white rounded font-semibold text-indigo-950"
                          />
                          <button
                            type="button"
                            onClick={() => applyJumpToRank(globalIndex)}
                            className="text-[10px] bg-indigo-700 text-white px-1.5 py-0.5 rounded font-medium hover:bg-indigo-800 cursor-pointer"
                          >
                            Go
                          </button>
                          <button
                            type="button"
                            onClick={() => setJumpItemIndex(null)}
                            className="text-slate-600 hover:text-black text-xs px-0.5 cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setJumpItemIndex(globalIndex);
                            setJumpRankInput((globalIndex + 1).toString());
                          }}
                          className={`text-xs font-semibold min-w-[28px] h-6 px-1.5 rounded border text-center shrink-0 cursor-pointer transition-colors ${isConnected
                            ? "bg-indigo-200/80 border-indigo-400 text-indigo-950 font-bold"
                            : "bg-white hover:bg-slate-100 border-slate-400 text-slate-800"
                            }`}
                          title={`Position ${globalIndex + 1}. Click to jump position`}
                        >
                          {globalIndex + 1}
                        </button>
                      )}

                      {/* Group Name & Badge */}
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        <span
                          className="font-semibold text-sm text-slate-900 truncate"
                          title={`${group.name}\n${group.skus.map((s, sIdx) => `• ${globalIndex + 1}.${sIdx + 1} ${s}: ${pageCounts[s] || 0} ${(pageCounts[s] || 0) === 1 ? "label" : "labels"}`).join("\n")}`}
                        >
                          {getCleanGroupName(group.name)}
                        </span>
                        <span className="text-xs font-medium text-indigo-900 bg-indigo-100 border border-indigo-300 px-2 py-0.5 rounded-full shrink-0">
                          {group.skus.length} SKUs
                        </span>
                      </div>

                      {/* Group Total Labels Count Badge */}
                      <span
                        className={`text-[11px] font-normal px-2 py-0.5 rounded-full border shrink-0 ${isConnected
                          ? "text-indigo-950 bg-indigo-200/80 border-indigo-300 font-medium"
                          : "text-slate-600 bg-slate-50 border-slate-400"
                          }`}
                      >
                        {totalGroupLabels} {totalGroupLabels === 1 ? "label" : "labels"}
                      </span>
                    </div>
                  );
                }

                /* ── Item is a Single SKU Row on the Left ── */
                const sku = item.sku;
                const count = pageCounts[sku] || 0;
                const isUnknown = sku === UNKNOWN_SKU;
                const isChecked = selectedSkus.has(sku);

                return (
                  <div
                    key={sku}
                    draggable={!isEditingJump}
                    onDragStart={() => handleDragStart(globalIndex)}
                    onDragEnter={() => handleDragEnter(globalIndex)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(globalIndex)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center gap-2 px-3 py-1.5 text-xs cursor-grab active:cursor-grabbing transition-colors select-none ${isDragTarget
                      ? "bg-[#051448]/10"
                      : isChecked
                        ? "bg-blue-50/40"
                        : isUnknown
                          ? "bg-amber-50/40 hover:bg-amber-50/60"
                          : "bg-white hover:bg-slate-50"
                      }`}
                  >
                    {/* Selection Checkbox for Grouping (Enlarged with generous click area) */}
                    <div
                      className="flex items-center justify-center p-0.5 rounded hover:bg-indigo-50 cursor-pointer shrink-0 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSkus((prev) => {
                          const copy = new Set(prev);
                          if (copy.has(sku)) copy.delete(sku);
                          else copy.add(sku);
                          return copy;
                        });
                      }}
                      title="Select to group with other SKUs"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          e.stopPropagation();
                          setSelectedSkus((prev) => {
                            const copy = new Set(prev);
                            if (e.target.checked) copy.add(sku);
                            else copy.delete(sku);
                            return copy;
                          });
                        }}
                        className="w-5 h-5 rounded border-2 border-slate-500 text-indigo-600 focus:ring-indigo-500 cursor-pointer shrink-0 accent-indigo-600"
                        title="Select to group with other SKUs"
                      />
                    </div>

                    {/* Drag Handle */}
                    <GripVertical
                      size={14}
                      className={`shrink-0 ${isDragTarget ? "text-[#051448]" : "text-slate-600"}`}
                    />

                    {/* Position Number / Clickable Rank Jump */}
                    {isEditingJump ? (
                      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="number"
                          min={1}
                          max={orderItems.length}
                          value={jumpRankInput}
                          onChange={(e) => setJumpRankInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") applyJumpToRank(globalIndex);
                            if (e.key === "Escape") setJumpItemIndex(null);
                          }}
                          autoFocus
                          placeholder={`${globalIndex + 1}`}
                          className="w-11 px-1 py-0.5 text-xs text-center border border-[#051448] bg-white rounded font-medium text-[#051448]"
                        />
                        <button
                          type="button"
                          onClick={() => applyJumpToRank(globalIndex)}
                          className="text-[10px] bg-[#051448] text-white px-1.5 py-0.5 rounded font-medium hover:bg-[#071a5e] cursor-pointer"
                        >
                          Go
                        </button>
                        <button
                          type="button"
                          onClick={() => setJumpItemIndex(null)}
                          className="text-slate-600 hover:text-black text-xs px-0.5 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setJumpItemIndex(globalIndex);
                          setJumpRankInput((globalIndex + 1).toString());
                        }}
                        className="text-xs font-semibold min-w-[28px] h-6 px-1.5 rounded bg-slate-50 hover:bg-slate-100 border border-slate-400 text-slate-700 text-center shrink-0 cursor-pointer transition-colors"
                        title={`Position ${globalIndex + 1}. Click to jump position`}
                      >
                        {globalIndex + 1}
                      </button>
                    )}

                    {/* SKU Name */}
                    <span
                      className="flex-1 font-normal text-slate-900 text-xs sm:text-[13px] truncate min-w-0"
                      title={sku}
                    >
                      {sku}
                    </span>

                    {/* Count Badge */}
                    <span
                      className={`text-[11px] font-normal px-2 py-0.5 rounded-full border shrink-0 ${isUnknown
                        ? "text-amber-800 bg-amber-50 border-amber-300"
                        : "text-slate-600 bg-slate-50 border-slate-400"
                        }`}
                    >
                      {count} {count === 1 ? "label" : "labels"}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ════════ RIGHT PART: Product Groups (5 Cols) ════════ */}
        <div className="lg:col-span-5 flex flex-col border-t-2 border-slate-800 lg:border-t-0 lg:border-l border-slate-400">
          {/* Header with Maximized Search Bar for Product Groups */}
          <div className="px-2.5 py-1.5 bg-white border-b border-slate-400 flex items-center gap-2 text-xs">
            <div className="relative flex-1 flex items-center w-full">
              <Search size={15} className="absolute left-2.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={groupSearchQuery}
                onChange={(e) => setGroupSearchQuery(e.target.value)}
                placeholder="Search groups..."
                className="w-full h-[34px] pl-8.5 pr-7 py-1.5 text-xs sm:text-sm bg-slate-50/60 hover:bg-white focus:bg-white border border-slate-400 rounded-md focus:outline-hidden focus:border-[#051448] focus:ring-1 focus:ring-[#051448]/20 text-slate-900 font-normal placeholder:text-slate-400 transition-colors"
              />
              {groupSearchQuery && (
                <button
                  type="button"
                  onClick={() => setGroupSearchQuery("")}
                  className="absolute right-2 text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
                  title="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Right Scrollable Groups List */}
          <div
            ref={rightListRef}
            className={`overflow-y-auto bg-white ${
              allGroupsWithPosition.length === 0
                ? "py-2 px-3"
                : "p-2 space-y-1.5 max-h-[150px] sm:max-h-[165px] lg:max-h-[380px]"
            }`}
          >
            {allGroupsWithPosition.length === 0 ? (
              /* Simple, compact 4-word message */
              <div className="py-1 text-center text-xs text-slate-400 font-normal">
                No groups created yet
              </div>
            ) : filteredGroupsWithPosition.length === 0 ? (
              /* Search Empty State */
              <div className="py-2 text-center text-xs text-slate-400 font-normal">
                No groups matched &ldquo;{groupSearchQuery}&rdquo;
              </div>
            ) : (
              filteredGroupsWithPosition.map(({ group, position, globalIndex }) => {
                const totalGroupLabels = group.skus.reduce((sum, s) => sum + (pageCounts[s] || 0), 0);
                const isEditingName = editingGroupId === group.id;
                const isEditingJump = jumpItemIndex === globalIndex;
                const isConnected = activeGroupId === group.id || hoveredGroupId === group.id;

                return (
                  <div
                    key={group.id}
                    ref={(el) => {
                      if (el) groupCardRefs.current.set(group.id, el);
                      else groupCardRefs.current.delete(group.id);
                    }}
                    onMouseEnter={() => setHoveredGroupId(group.id)}
                    onMouseLeave={() => setHoveredGroupId(null)}
                    onClick={() => {
                      setActiveGroupId(group.id);
                      scrollToLeftGroupSlot(group.id, true);
                    }}
                    className={`rounded-md border bg-white transition-all overflow-hidden cursor-pointer shadow-2xs ${isConnected
                      ? "border-indigo-600 ring-2 ring-indigo-600/30"
                      : "border-slate-400 hover:border-slate-500"
                      }`}
                  >
                    {/* Clean Compact Group Header */}
                    <div className={`px-3 py-1.5 flex items-center justify-between gap-2 border-b border-slate-400 transition-colors ${isConnected ? "bg-indigo-100/80 text-indigo-950" : "bg-slate-100/80 text-slate-900"
                      }`}>
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {/* Position Jump */}
                        {isEditingJump ? (
                          <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="number"
                              min={1}
                              max={orderItems.length}
                              value={jumpRankInput}
                              onChange={(e) => setJumpRankInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") applyJumpToRank(globalIndex);
                                if (e.key === "Escape") setJumpItemIndex(null);
                              }}
                              autoFocus
                              placeholder={`${position}`}
                              className="w-11 px-1 py-0.5 text-xs text-center border border-indigo-600 bg-white rounded font-bold text-indigo-950"
                            />
                            <button
                              type="button"
                              onClick={() => applyJumpToRank(globalIndex)}
                              className="text-[10px] bg-indigo-700 text-white px-1.5 py-0.5 rounded font-medium hover:bg-indigo-800 cursor-pointer"
                            >
                              Go
                            </button>
                            <button
                              type="button"
                              onClick={() => setJumpItemIndex(null)}
                              className="text-slate-600 hover:text-black text-xs px-0.5 cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setJumpItemIndex(globalIndex);
                              setJumpRankInput(position.toString());
                            }}
                            className={`text-xs font-semibold min-w-[28px] h-6 px-1.5 rounded border text-center shrink-0 cursor-pointer transition-colors ${isConnected
                                ? "bg-indigo-200/90 border-indigo-400 text-indigo-950 font-bold"
                                : "bg-white hover:bg-slate-100 border-slate-400 text-slate-800"
                              }`}
                            title={`Position ${position}. Click to change position`}
                          >
                            {position}
                          </button>
                        )}

                        {/* Group Name & Rename Input */}
                        {isEditingName ? (
                          <div className="flex items-center gap-1 flex-1 min-w-0">
                            <input
                              type="text"
                              value={groupNameInput}
                              onChange={(e) => setGroupNameInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  const updatedGroup = { ...group, name: groupNameInput.trim() || group.name };
                                  const next = [...orderItems];
                                  next[globalIndex] = {
                                    type: "group",
                                    group: updatedGroup,
                                  };
                                  updateItemsAndEmit(next);
                                  saveOrUpdateSkuGroup(updatedGroup);
                                  setEditingGroupId(null);
                                }
                                if (e.key === "Escape") setEditingGroupId(null);
                              }}
                              autoFocus
                              className="text-sm font-semibold bg-white border border-indigo-500 rounded px-1.5 py-0.5 text-slate-900 flex-1 min-w-0"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const updatedGroup = { ...group, name: groupNameInput.trim() || group.name };
                                const next = [...orderItems];
                                next[globalIndex] = {
                                  type: "group",
                                  group: updatedGroup,
                                };
                                updateItemsAndEmit(next);
                                saveOrUpdateSkuGroup(updatedGroup);
                                setEditingGroupId(null);
                              }}
                              className="p-1 rounded bg-[#051448] text-white hover:bg-[#071a5e] cursor-pointer"
                            >
                              <Check size={13} className="text-white" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 min-w-0 flex-1">
                            <Layers size={15} className={`shrink-0 ${isConnected ? "text-indigo-800" : "text-slate-800"}`} />
                            <span className="font-semibold text-sm text-slate-900 truncate" title={group.name}>
                              {getCleanGroupName(group.name)}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingGroupId(group.id);
                                setGroupNameInput(group.name);
                              }}
                              className="text-slate-700 hover:text-black p-1 hover:bg-slate-200/60 rounded cursor-pointer transition-colors"
                              title="Rename group"
                            >
                              <Edit2 size={13} />
                            </button>
                          </div>
                        )}

                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 border ${isConnected
                          ? "text-indigo-950 bg-indigo-200/80 border-indigo-300"
                          : "text-slate-800 bg-white border-slate-400"
                          }`}>
                          {group.skus.length} SKUs
                        </span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 border ${isConnected
                          ? "text-indigo-950 bg-indigo-200/80 border-indigo-300"
                          : "text-slate-800 bg-white border-slate-400"
                          }`}>
                          {totalGroupLabels} {totalGroupLabels === 1 ? "label" : "labels"}
                        </span>
                      </div>

                      {/* Group Action Tools */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleUngroup(group.id)}
                          className="p-1 text-red-600 hover:text-red-700 cursor-pointer transition-colors bg-transparent hover:bg-transparent"
                          title="Ungroup into individual separate SKUs"
                        >
                          <Split size={15} />
                        </button>
                      </div>
                    </div>

                    {/* Member SKUs list */}
                    <div className="divide-y divide-slate-400 bg-white">
                      {group.skus.map((sku, subIdx) => {
                        const count = pageCounts[sku] || 0;
                        return (
                          <div
                            key={sku}
                            className="flex items-center justify-between gap-2 px-3 py-1.5 bg-white hover:bg-slate-50 transition-colors"
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <span className="text-xs font-semibold text-indigo-700 min-w-[28px] text-center shrink-0">
                                {position}.{subIdx + 1}
                              </span>
                              <span className="font-normal text-sm text-slate-800 truncate" title={sku}>
                                {sku}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[11px] font-normal px-2 py-0.5 rounded-full border text-slate-600 bg-slate-50 border-slate-300">
                                {count} {count === 1 ? "label" : "labels"}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveSkuFromGroup(group.id, sku)}
                                className="p-1 text-red-600 hover:text-red-700 cursor-pointer transition-colors bg-transparent hover:bg-transparent"
                                title="Remove SKU from this group back to left list"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ── Sticky Bottom Footer: Sort Tools on Left, Confirm & Download on Right (Always visible without scrolling) ── */}
      <div className="sticky bottom-0 z-40 px-3 py-2 border-t border-slate-400 bg-white/95 backdrop-blur-xs flex items-center justify-between gap-2 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
        {/* Left: Label status count */}
        <div className="flex items-center gap-1.5 text-xs text-[#051448] font-semibold">
          <span>{effectiveLabelsCount} {effectiveLabelsCount === 1 ? "Label" : "Labels"} ready</span>
        </div>

        {/* Right: Confirm & Download PDF Button */}
        <button
          type="button"
          onClick={handleConfirmAndDownload}
          disabled={isBuilding}
          className={`h-[34px] flex items-center justify-center gap-1.5 text-xs sm:text-sm font-medium px-4 rounded-md transition-all cursor-pointer disabled:cursor-not-allowed ${confirmed
            ? "bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs"
            : "bg-[#051448] hover:bg-[#071a5e] text-white shadow-xs"
            } disabled:opacity-60`}
        >
          {isBuilding ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>Building PDF...</span>
            </>
          ) : confirmed ? (
            <>
              <CheckCircle size={14} />
              <span>Download Again</span>
            </>
          ) : (
            <>
              <Download size={14} />
              <span>Confirm &amp; Download PDF</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
