"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import {
  Download,
  Loader2,
  Package,
  RotateCcw,
  GripVertical,
  CheckCircle,
  Trash2,
  Search,
  X,
  ClipboardPaste,
  ChevronLeft,
  ChevronRight,
  Layers,
  ChevronDown,
  ChevronUp,
  Edit2,
  Check,
  Plus,
  Split,
  Sparkles,
} from "lucide-react";
import type { PageSkuMap } from "@/lib/pdf/flipkartSkuExtractor";
import {
  buildSkuGroupedPdf,
  countPagesPerSku,
  UNKNOWN_SKU,
} from "@/lib/pdf/flipkartSkuExtractor";
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
} from "@/lib/flipkartSkuStorage";
import { triggerDownload } from "@/lib/pdf/flipkartCropper";

export type { SkuGroup, OrderItem };

interface FlipkartSkuSorterPanelProps {
  file: File;
  pageSkuMap: PageSkuMap;
  skuOrder: string[];
  onSkuOrderChange: (newOrder: string[]) => void;
  soldByName?: string;
  onDownloadComplete?: () => void;
}

export function FlipkartSkuSorterPanel({
  file,
  pageSkuMap,
  skuOrder,
  onSkuOrderChange,
  soldByName,
  onDownloadComplete,
}: FlipkartSkuSorterPanelProps) {
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

  // Track auto-grouped items to display helpful notification & badges
  const [autoGroupedSet, setAutoGroupedSet] = useState<Set<string>>(() => {
    const storedGroups = getStoredSkuGroups();
    const { autoGroupedGroupIds } = autoGroupSkus(skuOrder, storedGroups);
    return new Set(autoGroupedGroupIds);
  });

  const [autoGroupedNotice, setAutoGroupedNotice] = useState<string | null>(() => {
    const storedGroups = getStoredSkuGroups();
    const { autoGroupedGroupIds } = autoGroupSkus(skuOrder, storedGroups);
    if (autoGroupedGroupIds.length > 0) {
      return `${autoGroupedGroupIds.length} product group${autoGroupedGroupIds.length > 1 ? "s" : ""} automatically matched & grouped from saved storage`;
    }
    return null;
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
        setAutoGroupedSet(new Set(autoGroupedGroupIds));
        setExpandedGroupIds((prev) => {
          const copy = new Set(prev);
          autoGroupedGroupIds.forEach((id) => copy.add(id));
          return copy;
        });
        setAutoGroupedNotice(
          `${autoGroupedGroupIds.length} product group${autoGroupedGroupIds.length > 1 ? "s" : ""} automatically matched & grouped from saved storage`
        );
      } else {
        setAutoGroupedSet(new Set());
        setAutoGroupedNotice(null);
      }
    }
  }, [skuOrder]);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination State for high-volume batches (left column)
  const [pageSize, setPageSize] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Direct Jump Editing State
  const [jumpItemIndex, setJumpItemIndex] = useState<number | null>(null);
  const [jumpRankInput, setJumpRankInput] = useState<string>("");

  // Bulk Paste / Excel Order Modal State
  const [showBulkPasteModal, setShowBulkPasteModal] = useState(false);
  const [bulkPasteText, setBulkPasteText] = useState("");
  const [bulkPasteFeedback, setBulkPasteFeedback] = useState<string | null>(null);

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

  // Adjust pagination for left list
  const effectivePageSize = pageSize === 0 ? Math.max(1, filteredItems.length) : pageSize;
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / effectivePageSize));
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedItems = useMemo(() => {
    if (pageSize === 0) return filteredItems;
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

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

  // ── Live Scroll Synchronization & Connected Group Refs ──
  const leftListRef = useRef<HTMLDivElement>(null);
  const rightListRef = useRef<HTMLDivElement>(null);
  const groupSlotRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const groupCardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const isProgrammaticScrollRef = useRef(false);
  const scrollAnimFrameRef = useRef<number | null>(null);

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
    const cardEl = groupCardRefs.current.get(groupId);
    const rightContainer = rightListRef.current;
    scrollElementToCenter(rightContainer, cardEl, smooth);
  };

  // Smooth scroll helper: Left column scrolls to group position slot and centers it
  const scrollToLeftGroupSlot = (groupId: string, smooth = true) => {
    const targetIdx = orderItems.findIndex(
      (it) => it.type === "group" && it.group.id === groupId
    );
    if (targetIdx !== -1) {
      const neededPage = Math.floor(targetIdx / pageSize) + 1;
      if (currentPage !== neededPage) {
        setCurrentPage(neededPage);
        setTimeout(() => {
          const slotEl = groupSlotRefs.current.get(groupId);
          const leftContainer = leftListRef.current;
          scrollElementToCenter(leftContainer, slotEl, smooth);
        }, 80);
        return;
      }
    }

    const slotEl = groupSlotRefs.current.get(groupId);
    const leftContainer = leftListRef.current;
    scrollElementToCenter(leftContainer, slotEl, smooth);
  };

  // When scrolling the left column, synchronize the right column's scroll position and center the active group
  const handleLeftScroll = () => {
    if (isProgrammaticScrollRef.current) return;
    if (scrollAnimFrameRef.current) cancelAnimationFrame(scrollAnimFrameRef.current);

    scrollAnimFrameRef.current = requestAnimationFrame(() => {
      const leftContainer = leftListRef.current;
      const rightContainer = rightListRef.current;
      if (!leftContainer || !rightContainer || allGroupsWithPosition.length === 0) return;

      const containerRect = leftContainer.getBoundingClientRect();
      const containerCenter = containerRect.top + containerRect.height / 2;

      let closestGroupId: string | null = null;
      let minDistance = Infinity;

      groupSlotRefs.current.forEach((el, gId) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        if (rect.bottom >= containerRect.top - 20 && rect.top <= containerRect.bottom + 20) {
          const slotCenter = rect.top + rect.height / 2;
          const dist = Math.abs(slotCenter - containerCenter);
          if (dist < minDistance) {
            minDistance = dist;
            closestGroupId = gId;
          }
        }
      });

      if (closestGroupId) {
        if (closestGroupId !== activeGroupId) {
          setActiveGroupId(closestGroupId);
        }
        isProgrammaticScrollRef.current = true;
        scrollToRightGroup(closestGroupId, true);
        setTimeout(() => {
          isProgrammaticScrollRef.current = false;
        }, 300);
      }
    });
  };

  // When scrolling the right column, synchronize the left column's scroll position and center the active group slot
  const handleRightScroll = () => {
    if (isProgrammaticScrollRef.current) return;
    if (scrollAnimFrameRef.current) cancelAnimationFrame(scrollAnimFrameRef.current);

    scrollAnimFrameRef.current = requestAnimationFrame(() => {
      const rightContainer = rightListRef.current;
      const leftContainer = leftListRef.current;
      if (!rightContainer || !leftContainer || allGroupsWithPosition.length === 0) return;

      const containerRect = rightContainer.getBoundingClientRect();
      const containerCenter = containerRect.top + containerRect.height / 2;

      let closestGroupId: string | null = null;
      let minDistance = Infinity;

      groupCardRefs.current.forEach((el, gId) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        if (rect.bottom >= containerRect.top - 20 && rect.top <= containerRect.bottom + 20) {
          const cardCenter = rect.top + rect.height / 2;
          const dist = Math.abs(cardCenter - containerCenter);
          if (dist < minDistance) {
            minDistance = dist;
            closestGroupId = gId;
          }
        }
      });

      if (closestGroupId) {
        if (closestGroupId !== activeGroupId) {
          setActiveGroupId(closestGroupId);
        }
        isProgrammaticScrollRef.current = true;
        scrollToLeftGroupSlot(closestGroupId, true);
        setTimeout(() => {
          isProgrammaticScrollRef.current = false;
        }, 300);
      }
    });
  };

  /* ── Group Creation: From Search or Checkbox Selection ── */
  const createGroupFromSkus = (skusToGroup: string[], defaultName?: string) => {
    if (skusToGroup.length < 2) return;

    let name = defaultName;
    if (!name) {
      if (searchQuery.trim()) {
        name = searchQuery.trim();
      } else {
        name = `Group (${skusToGroup.length} SKUs)`;
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
    setAutoGroupedSet((prev) => {
      const copy = new Set(prev);
      copy.delete(groupId);
      return copy;
    });

    updateItemsAndEmit(next);
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
      setAutoGroupedSet((prev) => {
        const copy = new Set(prev);
        copy.delete(groupId);
        return copy;
      });
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

  const handleResetToPdfOrder = () => {
    if (originalPdfOrderRef.current.length > 0) {
      const defaultItems: OrderItem[] = originalPdfOrderRef.current.map((sku) => ({
        type: "single",
        sku,
      }));
      setExpandedGroupIds(new Set());
      setSelectedSkus(new Set());
      setActiveGroupId(null);
      setAutoGroupedSet(new Set());
      setAutoGroupedNotice(null);
      updateItemsAndEmit(defaultItems);
    }
  };

  /* ── Bulk Paste Order from Excel / Text ── */
  const handleOpenBulkPaste = () => {
    const currentSkus = orderItems.flatMap((it) =>
      it.type === "single" ? [it.sku] : it.group.skus
    );
    setBulkPasteText(currentSkus.join("\n"));
    setBulkPasteFeedback(null);
    setShowBulkPasteModal(true);
  };

  const handleApplyBulkPaste = () => {
    const lines = bulkPasteText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) {
      setBulkPasteFeedback("Please paste at least one SKU name.");
      return;
    }

    const uniquePasted: string[] = [];
    for (const line of lines) {
      if (!uniquePasted.includes(line)) {
        uniquePasted.push(line);
      }
    }

    const currentSkus = orderItems.flatMap((it) =>
      it.type === "single" ? [it.sku] : it.group.skus
    );
    const matched = uniquePasted.filter((s) => currentSkus.includes(s));
    const unmatched = currentSkus.filter((s) => !matched.includes(s));
    const newFlatOrder = [...matched, ...unmatched];

    const newItems: OrderItem[] = newFlatOrder.map((sku) => ({
      type: "single",
      sku,
    }));
    setExpandedGroupIds(new Set());
    setSelectedSkus(new Set());
    setActiveGroupId(null);
    setAutoGroupedSet(new Set());
    setAutoGroupedNotice(null);
    updateItemsAndEmit(newItems);
    setShowBulkPasteModal(false);
  };

  /* ── Clear Saved Order and Groups from LocalStorage ── */
  const handleClearSaved = () => {
    clearSkuOrder();
    clearSkuGroups();
    setHasSavedBefore(false);
    setAutoGroupedSet(new Set());
    setAutoGroupedNotice(null);
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

      const result = await buildSkuGroupedPdf(file, pageSkuMap, flattened, soldByName);
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
  const totalSingleSkusCount = orderItems.filter((it) => it.type === "single").length;

  return (
    <div className="w-full flex flex-col">
      {/* ── Top Bar: Title + Batch Summary + Smart Bulk Actions ── */}
      <div className="px-3.5 py-2.5 bg-slate-50 border-b border-[#051448]/15 flex flex-wrap items-center justify-between gap-2">
        {/* Left: Title & Count Badges */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-bold text-sm text-black truncate">
            Arrange SKU Order
          </span>
          <span className="text-xs font-bold text-[#051448] bg-[#051448]/10 border border-[#051448]/20 px-2 py-0.5 rounded-full shrink-0">
            {skuOrder.length} Unique SKUs
          </span>
          {totalGroupsCount > 0 && (
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
              <Layers size={11} />
              {totalGroupsCount} {totalGroupsCount === 1 ? "Group" : "Groups"}
            </span>
          )}
        </div>

        {/* Right: Smart Bulk Actions */}
        <div className="flex items-center flex-wrap gap-1.5 shrink-0 text-xs">
          <button
            type="button"
            onClick={() => handleSortAlphabetical(true)}
            className="font-semibold text-black/75 hover:text-[#051448] border border-slate-300 hover:border-[#051448]/50 px-2 py-1 rounded bg-white transition-colors cursor-pointer shadow-2xs"
            title="Sort A to Z"
          >
            A→Z
          </button>

          <button
            type="button"
            onClick={() => handleSortByQuantity(true)}
            className="font-semibold text-black/75 hover:text-[#051448] border border-slate-300 hover:border-[#051448]/50 px-2 py-1 rounded bg-white transition-colors cursor-pointer shadow-2xs"
            title="Sort by highest label quantity first"
          >
            Qty ↓
          </button>

          <button
            type="button"
            onClick={handleOpenBulkPaste}
            className="font-semibold text-[#051448] hover:bg-blue-50 border border-[#051448]/30 px-2 py-1 rounded bg-white transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
            title="Paste customized SKU order from Excel or Notepad"
          >
            <ClipboardPaste size={12} />
            <span className="hidden sm:inline">Paste Order</span>
          </button>

          <button
            type="button"
            onClick={handleResetToPdfOrder}
            className="font-semibold text-black/60 hover:text-black border border-slate-300 px-2 py-1 rounded bg-white transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
            title="Reset to the original order from the uploaded PDF"
          >
            <RotateCcw size={11} />
            <span className="hidden md:inline">Reset</span>
          </button>

          {hasSavedBefore && (
            <button
              type="button"
              onClick={handleClearSaved}
              className="font-semibold text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 px-2 py-1 rounded bg-white transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
              title="Clear saved arrangement from local storage"
            >
              <Trash2 size={11} />
              <span className="hidden md:inline">Clear Saved</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Search & Group Creation Strip ── */}
      <div className="px-3.5 py-1.5 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative flex-1 max-w-sm flex items-center">
            <Search size={13} className="absolute left-2.5 text-black/40 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search similar SKUs to group or reorder..."
              className="w-full pl-8 pr-7 py-1 text-xs bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-hidden focus:border-[#051448] text-black font-medium transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
                className="absolute right-2 text-black/40 hover:text-black cursor-pointer"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* ⚡ Quick Group Filtered SKUs Button */}
          {matchingSingleSkus.length >= 2 && (
            <button
              type="button"
              onClick={() => createGroupFromSkus(matchingSingleSkus)}
              className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-2.5 py-1 rounded text-xs transition-colors cursor-pointer shadow-xs shrink-0"
              title={`Group all ${matchingSingleSkus.length} matched SKUs together into one unified unit`}
            >
              <Layers size={13} />
              <span>Group {matchingSingleSkus.length} Matched</span>
            </button>
          )}

          {/* Manual Checkbox Selection Grouping Button */}
          {selectedSkus.size >= 2 && (
            <button
              type="button"
              onClick={() => createGroupFromSkus(Array.from(selectedSkus))}
              className="flex items-center gap-1 bg-[#051448] hover:bg-[#071a5e] text-white font-bold px-2.5 py-1 rounded text-xs transition-colors cursor-pointer shadow-xs shrink-0"
              title={`Group ${selectedSkus.size} selected SKUs together`}
            >
              <Plus size={13} />
              <span>Group Selected ({selectedSkus.size})</span>
            </button>
          )}
        </div>

        {/* Left List Pagination */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] text-black/60">
            {searchQuery ? (
              <>
                <strong className="text-[#051448]">{filteredItems.length}</strong> matches
              </>
            ) : (
              <>
                <strong>{orderItems.length}</strong> items in sequence
              </>
            )}
          </span>

          {filteredItems.length > 25 && (
            <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 rounded border border-slate-300 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                title="Previous page"
              >
                <ChevronLeft size={13} />
              </button>
              <span className="text-[11px] font-bold text-[#051448] px-1">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1 rounded border border-slate-300 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                title="Next page"
              >
                <ChevronRight size={13} />
              </button>

              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="text-[11px] bg-slate-50 border border-slate-300 rounded px-1 py-0.5 ml-1 text-black font-medium cursor-pointer"
              >
                <option value={25}>25 / page</option>
                <option value={50}>50 / page</option>
                <option value={100}>100 / page</option>
                <option value={0}>All ({filteredItems.length})</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* ── Error Alert ── */}
      {errorMsg && (
        <div className="mx-3 mt-2 px-3 py-2 rounded-md border border-red-200 bg-red-50 text-red-700 text-xs flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="font-bold ml-2 cursor-pointer">✕</button>
        </div>
      )}

      {/* ── Auto-Grouped Notification Banner ── */}
      {autoGroupedNotice && (
        <div className="mx-3 sm:mx-3.5 mt-2 px-3 py-2 rounded-md border border-emerald-300 bg-emerald-50 text-emerald-900 text-xs flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-emerald-600 shrink-0" />
            <span>
              <strong>Auto-Grouped:</strong> {autoGroupedNotice}.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setAutoGroupedNotice(null)}
            className="text-emerald-700 hover:text-emerald-950 font-bold ml-2 p-0.5 rounded hover:bg-emerald-100 cursor-pointer"
            title="Dismiss notice"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── TWO-COLUMN SPLIT VIEW: Left (All Other SKUs & Sequence) | Right (Groups & Position Link) ── */}
      <div className="p-3 sm:p-3.5 grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
        {/* ════════ LEFT COLUMN: Individual SKUs & Sequence Order (7 Cols) ════════ */}
        <div className="lg:col-span-7 flex flex-col rounded-md border border-slate-200 bg-slate-50/50 overflow-hidden">
          {/* Section Header */}
          <div className="px-3 py-2 bg-white border-b border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-bold text-black">
              <Package size={14} className="text-[#051448]" />
              <span>All Other SKUs &amp; Sequence</span>
              <span className="text-[11px] font-normal text-black/55">
                ({totalSingleSkusCount} standalone)
              </span>
            </div>
            <span className="text-[10px] text-black/50 hidden sm:inline">
              Drag or click #rank to jump
            </span>
          </div>

          {/* Left Scrollable List */}
          <div
            ref={leftListRef}
            onScroll={handleLeftScroll}
            className="p-2 space-y-1.5 max-h-[310px] overflow-y-auto"
          >
            {paginatedItems.length === 0 ? (
              <div className="py-8 text-center text-black/50 text-xs">
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
                      onMouseEnter={() => {
                        setHoveredGroupId(group.id);
                        setActiveGroupId(group.id);
                        scrollToRightGroup(group.id, true);
                      }}
                      onMouseLeave={() => setHoveredGroupId(null)}
                      onClick={() => {
                        setActiveGroupId(group.id);
                        scrollToRightGroup(group.id, true);
                      }}
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md border text-xs cursor-pointer select-none transition-colors ${
                        isConnected
                          ? "border-indigo-400 bg-indigo-50/80 shadow-xs ring-1 ring-indigo-200"
                          : isDragTarget
                          ? "border-[#051448] bg-[#051448]/10"
                          : "border-indigo-200 bg-indigo-50/40 hover:border-indigo-300 hover:bg-indigo-50/60 shadow-2xs"
                      }`}
                    >
                      {/* Drag Handle */}
                      <GripVertical
                        size={14}
                        className="shrink-0 text-indigo-400 cursor-grab active:cursor-grabbing"
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
                            className="w-11 px-1 py-0.5 text-xs text-center border border-indigo-600 bg-white rounded font-bold text-indigo-950"
                          />
                          <button
                            type="button"
                            onClick={() => applyJumpToRank(globalIndex)}
                            className="text-[10px] bg-indigo-700 text-white px-1.5 py-0.5 rounded font-bold hover:bg-indigo-800 cursor-pointer"
                          >
                            Go
                          </button>
                          <button
                            type="button"
                            onClick={() => setJumpItemIndex(null)}
                            className="text-black/50 hover:text-black text-xs px-0.5 cursor-pointer"
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
                          className={`text-xs font-bold min-w-[26px] px-1 py-0.5 rounded text-center shrink-0 cursor-pointer transition-colors ${
                            isConnected
                              ? "bg-indigo-600 text-white shadow-xs"
                              : "text-indigo-950 bg-indigo-100/80 hover:bg-indigo-200 border border-indigo-200"
                          }`}
                          title={`Position #${globalIndex + 1}. Click to jump position`}
                        >
                          #{globalIndex + 1}
                        </button>
                      )}

                      {/* Group Name & Badge */}
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        <Layers size={13} className="text-indigo-600 shrink-0" />
                        <span className="font-bold text-xs text-indigo-950 truncate" title={group.name}>
                          Group: {group.name}
                        </span>
                        <span className="text-[10px] text-indigo-700 bg-indigo-100/70 border border-indigo-200 px-1.5 py-0.2 rounded-full shrink-0">
                          {group.skus.length} SKUs
                        </span>
                        {autoGroupedSet.has(group.id) && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0" title="Automatically grouped from saved storage">
                            <Sparkles size={9} />
                            Auto
                          </span>
                        )}
                      </div>

                      {/* Total Labels Count */}
                      <span className="text-[11px] font-bold text-indigo-900 bg-indigo-100/70 border border-indigo-200 px-2 py-0.5 rounded-full shrink-0">
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
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md border text-xs cursor-grab active:cursor-grabbing transition-all select-none ${
                      isDragTarget
                        ? "border-[#051448] bg-[#051448]/10 shadow-xs"
                        : isChecked
                        ? "border-indigo-400 bg-indigo-50/60 shadow-xs"
                        : isUnknown
                        ? "border-amber-200 bg-amber-50/50 hover:border-amber-300"
                        : "border-slate-200 bg-white hover:border-[#051448]/40 hover:bg-blue-50/30 shadow-2xs"
                    }`}
                  >
                    {/* Selection Checkbox for Grouping (Enlarged with generous click area) */}
                    <div
                      className="flex items-center justify-center p-1 -m-1 rounded hover:bg-indigo-100/70 cursor-pointer shrink-0 transition-colors"
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
                        className="w-5 h-5 rounded border-2 border-slate-400 text-indigo-600 focus:ring-indigo-500 cursor-pointer shrink-0 accent-indigo-600"
                        title="Select to group with other SKUs"
                      />
                    </div>

                    {/* Drag Handle */}
                    <GripVertical
                      size={14}
                      className={`shrink-0 ${isDragTarget ? "text-[#051448]" : "text-black/30"}`}
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
                          className="w-11 px-1 py-0.5 text-xs text-center border border-[#051448] bg-white rounded font-bold text-[#051448]"
                        />
                        <button
                          type="button"
                          onClick={() => applyJumpToRank(globalIndex)}
                          className="text-[10px] bg-[#051448] text-white px-1.5 py-0.5 rounded font-bold hover:bg-[#071a5e] cursor-pointer"
                        >
                          Go
                        </button>
                        <button
                          type="button"
                          onClick={() => setJumpItemIndex(null)}
                          className="text-black/50 hover:text-black text-xs px-0.5 cursor-pointer"
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
                        className="text-xs font-bold text-[#051448] min-w-[26px] px-1 py-0.5 rounded hover:bg-blue-100/70 border border-transparent hover:border-blue-300 text-center shrink-0 cursor-pointer transition-colors"
                        title={`Position #${globalIndex + 1}. Click to jump position`}
                      >
                        #{globalIndex + 1}
                      </button>
                    )}

                    {/* SKU Name */}
                    <span
                      className="flex-1 font-semibold text-black text-xs sm:text-[13px] truncate min-w-0"
                      title={sku}
                    >
                      {sku}
                    </span>

                    {/* Count Badge */}
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                        isUnknown
                          ? "text-amber-800 bg-amber-100 border-amber-300"
                          : "text-[#051448] bg-[#051448]/8 border-[#051448]/25"
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

        {/* ════════ RIGHT COLUMN: Product Groups (5 Cols) ════════ */}
        <div className="lg:col-span-5 flex flex-col rounded-md border border-slate-200 bg-slate-50/50 overflow-hidden">
          {/* Section Header */}
          <div className="px-3 py-2 bg-white border-b border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-bold text-black">
              <Layers size={14} className="text-[#051448]" />
              <span>Product Groups</span>
              <span className="text-[11px] font-normal text-black/55">
                ({totalGroupsCount} created)
              </span>
            </div>
            <span className="text-[10px] text-black/50">
              Assigned print position
            </span>
          </div>

          {/* Right Scrollable Groups List */}
          <div
            ref={rightListRef}
            onScroll={handleRightScroll}
            className="p-2 space-y-2 max-h-[310px] overflow-y-auto"
          >
            {allGroupsWithPosition.length === 0 ? (
              /* Helpful Empty State */
              <div className="py-10 px-4 text-center flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-300 rounded-md bg-white">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                  <Sparkles size={16} />
                </div>
                <p className="font-bold text-xs text-black/80">No Product Groups Created Yet</p>
                <p className="text-[11px] text-black/55 max-w-xs leading-relaxed">
                  Search similar SKUs on the left or check their boxes to group them together into a unified printing position.
                </p>
              </div>
            ) : (
              allGroupsWithPosition.map(({ group, position, globalIndex }) => {
                const isExpanded = expandedGroupIds.has(group.id);
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
                    onMouseEnter={() => {
                      setHoveredGroupId(group.id);
                      setActiveGroupId(group.id);
                      scrollToLeftGroupSlot(group.id, true);
                    }}
                    onMouseLeave={() => setHoveredGroupId(null)}
                    onClick={() => {
                      setActiveGroupId(group.id);
                      scrollToLeftGroupSlot(group.id, true);
                    }}
                    className={`rounded-md border bg-white transition-all overflow-hidden cursor-pointer ${
                      isConnected
                        ? "border-indigo-400 ring-1 ring-indigo-200 shadow-xs"
                        : "border-slate-200 hover:border-slate-300 shadow-2xs"
                    }`}
                  >
                    {/* Clean Compact Group Header */}
                    <div className="p-2 flex items-center justify-between gap-2 bg-indigo-50/25">
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
                              className="text-[10px] bg-indigo-700 text-white px-1.5 py-0.5 rounded font-bold hover:bg-indigo-800 cursor-pointer"
                            >
                              Go
                            </button>
                            <button
                              type="button"
                              onClick={() => setJumpItemIndex(null)}
                              className="text-black/50 hover:text-black text-xs px-0.5 cursor-pointer"
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
                            className="text-xs font-bold text-indigo-950 px-1.5 py-0.5 rounded bg-indigo-100/80 hover:bg-indigo-200 border border-indigo-200 text-center shrink-0 cursor-pointer transition-colors"
                            title={`Position #${position}. Click to change position`}
                          >
                            #{position}
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
                              className="text-xs font-bold bg-white border border-indigo-400 rounded px-1.5 py-0.5 text-black flex-1 min-w-0"
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
                              className="p-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer"
                            >
                              <Check size={11} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 min-w-0 flex-1">
                            <Layers size={13} className="text-indigo-600 shrink-0" />
                            <span className="font-bold text-xs text-indigo-950 truncate" title={group.name}>
                              {group.name}
                            </span>
                            {autoGroupedSet.has(group.id) && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0" title="Automatically grouped from saved storage">
                                <Sparkles size={9} />
                                Auto
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setEditingGroupId(group.id);
                                setGroupNameInput(group.name);
                              }}
                              className="text-slate-400 hover:text-indigo-700 p-0.5 cursor-pointer"
                              title="Rename group"
                            >
                              <Edit2 size={11} />
                            </button>
                          </div>
                        )}

                        <span className="text-[11px] font-medium text-black/60 shrink-0">
                          {totalGroupLabels} labels • {group.skus.length} SKUs
                        </span>
                      </div>

                      {/* Group Action Tools */}
                      <div className="flex items-center gap-0.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleUngroup(group.id)}
                          className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 cursor-pointer"
                          title="Ungroup into individual separate SKUs"
                        >
                          <Split size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setExpandedGroupIds((prev) => {
                              const copy = new Set(prev);
                              if (copy.has(group.id)) copy.delete(group.id);
                              else copy.add(group.id);
                              return copy;
                            });
                          }}
                          className="p-1 rounded hover:bg-slate-100 text-slate-500 cursor-pointer"
                          title={isExpanded ? "Collapse group members" : "View group members"}
                        >
                          {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        </button>
                      </div>
                    </div>

                    {/* Member SKUs list (Expanded) */}
                    {isExpanded && (
                      <div className="p-2 space-y-1 bg-white border-t border-slate-200 text-xs">
                        <p className="text-[10px] font-semibold text-black/60 mb-1">
                          Grouped SKUs (printed at Position #{position}):
                        </p>
                        {group.skus.map((sku, subIdx) => {
                          const count = pageCounts[sku] || 0;
                          return (
                            <div
                              key={sku}
                              className="flex items-center justify-between gap-2 px-2 py-1 rounded bg-slate-50 border border-slate-200"
                            >
                              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                <span className="text-[10px] font-bold text-indigo-600 w-3">
                                  {subIdx + 1}
                                </span>
                                <span className="font-semibold text-black truncate" title={sku}>
                                  {sku}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-[10px] font-bold text-black/60 bg-slate-200 px-1.5 py-0.2 rounded-full">
                                  {count} labels
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSkuFromGroup(group.id, sku)}
                                  className="p-0.5 rounded hover:bg-red-50 text-black/40 hover:text-red-600 cursor-pointer"
                                  title="Remove SKU from this group back to left list"
                                >
                                  <X size={11} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ── Compact Footer: Confirm & Download ── */}
      <div className="px-3.5 sm:px-4 py-2.5 border-t border-[#051448]/15 bg-white rounded-b-md flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={handleConfirmAndDownload}
          disabled={isBuilding}
          className={`flex items-center justify-center gap-1.5 text-xs font-bold px-4 py-2 rounded-md transition-all cursor-pointer disabled:cursor-not-allowed ${
            confirmed
              ? "bg-emerald-700 hover:bg-emerald-800 text-white"
              : "bg-[#051448] hover:bg-[#071a5e] text-white shadow-xs"
          } disabled:opacity-60`}
        >
          {isBuilding ? (
            <>
              <Loader2 size={13} className="animate-spin" />
              Building PDF...
            </>
          ) : confirmed ? (
            <>
              <CheckCircle size={13} />
              Download Again
            </>
          ) : (
            <>
              <Download size={13} />
              Confirm &amp; Download PDF
            </>
          )}
        </button>
      </div>

      {/* ── Bulk Paste Order Modal ── */}
      {showBulkPasteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-lg border border-[#051448] shadow-2xl w-full max-w-lg flex flex-col overflow-hidden max-h-[85vh]">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardPaste size={16} className="text-[#051448]" />
                <h3 className="font-bold text-sm text-[#051448]">
                  Bulk Paste SKU Packing Order
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBulkPasteModal(false)}
                className="p-1 rounded hover:bg-slate-200 text-black/60 hover:text-black cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-4 flex flex-col gap-2.5 overflow-y-auto">
              <p className="text-xs text-black/70 leading-relaxed">
                Paste your prioritized SKU list below (one per line, directly from <strong>Excel</strong>, <strong>Google Sheets</strong>, or warehouse ERP).
                Labels matching your list will be grouped in this exact sequence, and any remaining labels will follow afterward.
              </p>

              <textarea
                rows={12}
                value={bulkPasteText}
                onChange={(e) => setBulkPasteText(e.target.value)}
                placeholder="Paste SKU list here (one per line)..."
                className="w-full text-xs font-mono p-2.5 bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-hidden focus:border-[#051448] text-black"
              />

              {bulkPasteFeedback && (
                <div className="text-xs text-red-600 font-medium">
                  {bulkPasteFeedback}
                </div>
              )}
            </div>

            <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
              <span className="text-xs text-black/60">
                {bulkPasteText.split(/\r?\n/).filter((l) => l.trim().length > 0).length} lines pasted
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowBulkPasteModal(false)}
                  className="px-3 py-1.5 rounded text-xs font-medium text-black/70 hover:text-black border border-slate-300 bg-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyBulkPaste}
                  className="px-4 py-1.5 rounded text-xs font-bold text-white bg-[#051448] hover:bg-[#071a5e] cursor-pointer shadow-xs"
                >
                  Apply Reorder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
