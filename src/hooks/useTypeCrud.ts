"use client";

import { useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { extractApiError } from "@/lib/utils";

interface UseTypeCrudConfig {
  endpoint: string;
  swrKey: string;
  entityName: string;
}

export function useTypeCrud({ endpoint, swrKey, entityName }: UseTypeCrudConfig) {
  const { data, isLoading, mutate } = useSWR(swrKey);
  const items = data?.data || [];

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [saving, setSaving] = useState(false);

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
      toast.error(deleteMessage || `Tidak bisa menghapus: type sedang digunakan`);
      return;
    }

    if (!confirm(`Hapus "${item.name}"?`)) return;

    try {
      await api.delete(`${endpoint}/${item.id}`);
      toast.success("Berhasil dihapus");
      mutate();
    } catch (error: any) {
      toast.error(extractApiError(error, "Gagal menghapus"));
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
  };
}
