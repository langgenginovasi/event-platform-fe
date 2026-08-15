"use client";

import { useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { extractApiError } from "@/lib/error";
import type { BulkMoveItem } from "@/components/shared/BulkMoveModal";

export interface TypeMoveConfig {
  entityType: "participants" | "registrations";
  listKey: (sourceId: string, search: string) => string;
  bulkEndpoint: string;
  idKey: "participant_ids" | "registration_ids";
  targetKey: "membership_type_id" | "participation_status_id";
  targetLabel: string;
  affectedLabel: string;
}

interface UseTypeCrudConfig {
  endpoint: string;
  swrKey: string;
  entityName: string;
  moveConfig?: TypeMoveConfig;
}

export function useTypeCrud({ endpoint, swrKey, entityName, moveConfig }: UseTypeCrudConfig) {
  const { data, isLoading, mutate } = useSWR(swrKey);
  const items = data?.data || [];

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [saving, setSaving] = useState(false);

  // ── Delete confirmation (ConfirmationDialog, bukan window.confirm) ──
  const [deleteItem, setDeleteItem] = useState<any>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Move & delete (pindahkan peserta ke opsi lain lalu hapus) ──
  const [isMoveDeleteOpen, setIsMoveDeleteOpen] = useState(false);
  const [moveDeleteItem, setMoveDeleteItem] = useState<any>(null);
  const [moveTargetId, setMoveTargetId] = useState("");

  // ── Bulk move (pindahkan peserta/registrasi ke opsi lain, tanpa hapus) ──
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [moveItem, setMoveItem] = useState<any>(null);
  const [moveSearch, setMoveSearch] = useState("");
  const [moveSelectedIds, setMoveSelectedIds] = useState<string[]>([]);
  const [bulkMoveTargetId, setBulkMoveTargetId] = useState("");
  const [isMoving, setIsMoving] = useState(false);

  // ── Fetch list peserta/registrasi untuk bulk move ───────────────────
  const moveListKey =
    isMoveModalOpen && moveItem && moveConfig
      ? moveConfig.listKey(moveItem.id, moveSearch)
      : null;
  const { data: moveListRes, isLoading: isMoveListLoading } = useSWR(moveListKey);
  const moveItems: BulkMoveItem[] = (moveListRes?.data || []).map((r: any) =>
    moveConfig?.entityType === "registrations"
      ? {
          id: r.id,
          name: r.participant?.name || "",
          email: r.participant?.email || "",
          company: r.participant?.company || "",
          groupName: r.event_group?.name || "",
        }
      : {
          id: r.id,
          name: r.name || "",
          email: r.email || "",
          company: r.company || "",
        }
  );

  const openDialog = (item?: any) => {
    if (item) {
      setEditingItem(item);
      setName(item.name);
      setSlug(item.slug);
      setSortOrder(item.sort_order);
    } else {
      setEditingItem(null);
      setName("");
      setSlug("");
      setSortOrder(0);
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!name || !slug) {
      toast.error("Nama dan slug wajib diisi");
      return;
    }

    setSaving(true);
    try {
      const payload = { name, slug, sort_order: sortOrder };
      if (editingItem) {
        await api.put(`${endpoint}/${editingItem.id}`, payload);
        toast.success(`${entityName} berhasil diperbarui`);
      } else {
        await api.post(endpoint, payload);
        toast.success(`${entityName} berhasil ditambahkan`);
      }
      setIsDialogOpen(false);
      mutate();
    } catch (error: any) {
      toast.error(extractApiError(error, "Gagal menyimpan"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: any, deleteCheck: (item: any) => boolean, deleteMessage?: string) => {
    if (deleteCheck(item)) {
      const moveOptions = items.filter((i: any) => i.id !== item.id);
      if (moveOptions.length > 0) {
        setMoveDeleteItem(item);
        setMoveTargetId("");
        setIsMoveDeleteOpen(true);
        return;
      }
      toast.error(deleteMessage || `Tidak bisa menghapus: type sedang digunakan`);
      return;
    }

    setDeleteItem(item);
    setIsDeleteOpen(true);
  };

  const confirmMoveDelete = async () => {
    if (!moveDeleteItem) return;

    if (!moveTargetId) {
      toast.error("Pilih opsi tujuan pemindahan terlebih dahulu");
      return;
    }

    setIsDeleting(true);
    try {
      await api.delete(`${endpoint}/${moveDeleteItem.id}`, { move_to_id: moveTargetId });
      toast.success("Berhasil dihapus, peserta dipindahkan ke opsi tujuan");
      mutate();
      setIsMoveDeleteOpen(false);
      setMoveDeleteItem(null);
    } catch (error: any) {
      toast.error(extractApiError(error, "Gagal menghapus"));
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteItem) return;

    setIsDeleting(true);
    try {
      await api.delete(`${endpoint}/${deleteItem.id}`);
      toast.success("Berhasil dihapus");
      mutate();
      setIsDeleteOpen(false);
      setDeleteItem(null);
    } catch (error: any) {
      toast.error(extractApiError(error, "Gagal menghapus"));
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Bulk move handlers ─────────────────────────────────────────────
  const handleOpenMoveModal = (item: any) => {
    setMoveItem(item);
    setMoveSearch("");
    setMoveSelectedIds([]);
    setBulkMoveTargetId("");
    setIsMoveModalOpen(true);
  };

  const handleToggleMoveItem = (id: string) => {
    setMoveSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleToggleAllMoveItems = (checked: boolean) => {
    if (checked) {
      setMoveSelectedIds(moveItems.map((i) => i.id));
    } else {
      setMoveSelectedIds([]);
    }
  };

  const confirmBulkMove = async () => {
    if (!moveItem || !moveConfig) return;

    if (moveSelectedIds.length === 0) {
      toast.warning("Pilih peserta terlebih dahulu");
      return;
    }
    if (!bulkMoveTargetId) {
      toast.error("Pilih opsi tujuan pemindahan terlebih dahulu");
      return;
    }

    setIsMoving(true);
    try {
      await api.put(moveConfig.bulkEndpoint, {
        [moveConfig.idKey]: moveSelectedIds,
        [moveConfig.targetKey]: bulkMoveTargetId,
      });
      toast.success(`${moveSelectedIds.length} ${moveConfig.affectedLabel} berhasil dipindahkan`);
      setIsMoveModalOpen(false);
      setMoveItem(null);
      setMoveSelectedIds([]);
      setBulkMoveTargetId("");
      mutate();
    } catch (error: any) {
      toast.error(extractApiError(error, "Gagal memindahkan"));
    } finally {
      setIsMoving(false);
    }
  };

  return {
    items,
    isLoading,
    isDialogOpen,
    setIsDialogOpen,
    editingItem,
    name,
    setName,
    slug,
    setSlug,
    sortOrder,
    setSortOrder,
    saving,
    openDialog,
    handleSave,
    handleDelete,
    // Delete confirmation state
    isDeleteOpen,
    setIsDeleteOpen,
    isDeleting,
    deleteItemName: deleteItem?.name,
    confirmDelete,
    // Move & delete state
    isMoveDeleteOpen,
    setIsMoveDeleteOpen,
    moveDeleteItemName: moveDeleteItem?.name,
    moveDeleteCount: moveDeleteItem?._count,
    moveDeleteOptions: items.filter((i: any) => i.id !== moveDeleteItem?.id),
    confirmMoveDelete,
    moveTargetId,
    setMoveTargetId,
    // Bulk move state
    isMoveModalOpen,
    setIsMoveModalOpen,
    handleOpenMoveModal,
    moveConfig,
    moveItemName: moveItem?.name,
    moveSearch,
    setMoveSearch,
    moveItems,
    isMoveListLoading,
    moveSelectedIds,
    handleToggleMoveItem,
    handleToggleAllMoveItems,
    bulkMoveTargetId,
    setBulkMoveTargetId,
    isMoving,
    confirmBulkMove,
    moveTargetOptions: items.filter((i: any) => i.id !== moveItem?.id),
  };
}
