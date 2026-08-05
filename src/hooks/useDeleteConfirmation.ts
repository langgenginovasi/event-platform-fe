"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { extractApiError } from "@/lib/utils";

interface UseDeleteConfirmationOptions {
  onDelete: (id: string) => Promise<void>;
  onSuccess?: () => void;
  successMessage?: string;
  errorMessage?: string;
}

export function useDeleteConfirmation({
  onDelete,
  onSuccess,
  successMessage = "Berhasil dihapus",
  errorMessage = "Gagal menghapus",
}: UseDeleteConfirmationOptions) {
  const [isOpen, setIsOpen] = useState(false);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const openDelete = useCallback((id: string) => {
    setTargetId(id);
    setIsOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!targetId) return;
    setIsDeleting(true);
    try {
      await onDelete(targetId);
      toast.success(successMessage);
      onSuccess?.();
      setIsOpen(false);
      setTargetId(null);
    } catch (err: any) {
      const message = extractApiError(err, errorMessage);
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  }, [targetId, onDelete, onSuccess, successMessage, errorMessage]);

  const cancelDelete = useCallback(() => {
    setIsOpen(false);
    setTargetId(null);
  }, []);

  return {
    isOpen,
    setIsOpen,
    targetId,
    isDeleting,
    openDelete,
    confirmDelete,
    cancelDelete,
  };
}
