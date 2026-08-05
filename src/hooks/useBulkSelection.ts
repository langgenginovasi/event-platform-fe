"use client";

import { useState, useEffect, useCallback } from "react";

interface UseBulkSelectionOptions {
  deps?: React.DependencyList;
}

export function useBulkSelection(options?: UseBulkSelectionOptions) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    setSelectedIds([]);
  }, options?.deps);

  const handleSelectAll = useCallback((items: { id: string }[], checked: boolean) => {
    if (checked) {
      setSelectedIds(items.map((item) => item.id));
    } else {
      setSelectedIds([]);
    }
  }, []);

  const handleSelectOne = useCallback((id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  return {
    selectedIds,
    setSelectedIds,
    handleSelectAll,
    handleSelectOne,
    clearSelection,
  };
}
