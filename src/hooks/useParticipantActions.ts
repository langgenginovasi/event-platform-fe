"use client";

import { useState, useRef, useEffect } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { api } from "@/lib/api";
import { extractApiError } from "@/lib/utils";
import { useBulkSelection } from "./useBulkSelection";
import {
  GET_PARTICIPANTS,
  GET_EVENT_GROUPS,
  GET_PARTICIPANT_HISTORY,
  GET_MEMBERSHIP_TYPES,
  UPDATE_PARTICIPANT,
} from "@/lib/api-endpoints";

export interface Participant {
  id: string;
  name: string;
  gender: string;
  company: string;
  email: string;
  membership_type?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export interface ExcelPreviewData {
  name: string;
  email: string;
  gender: string;
  company: string;
}

export function useParticipantActions() {
  const [keyword, setKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: getParticipant, isLoading, mutate: refreshList } = useSWR(
    GET_PARTICIPANTS(currentPage, 10, keyword)
  );

  const participant: Participant[] = getParticipant?.data ?? [];
  const meta = getParticipant?.meta;

  // ── Create Modal State ──────────────────────────────────────────────
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    gender: "",
    company: "",
    membership_type_id: "",
  });
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    gender: "",
    company: "",
    api: "",
  });

  // ── Membership Types ───────────────────────────────────────────────
  const { data: membershipTypesRes } = useSWR<{ data: any[] }>(GET_MEMBERSHIP_TYPES());
  const membershipTypes = membershipTypesRes?.data || [];

  // ── Edit Modal State ──────────────────────────────────────────────
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editingParticipantId, setEditingParticipantId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    gender: "",
    company: "",
    membership_type_id: "",
  });
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [editErrors, setEditErrors] = useState({
    name: "",
    email: "",
    gender: "",
    company: "",
    api: "",
  });

  // ── Import Excel State ─────────────────────────────────────────────
  const [openImportModal, setOpenImportModal] = useState(false);
  const [excelData, setExcelData] = useState<ExcelPreviewData[]>([]);
  const [loadingImport, setLoadingImport] = useState(false);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Bulk Selection State ───────────────────────────────────────────
  const { selectedIds, setSelectedIds, handleSelectAll, handleSelectOne, clearSelection } =
    useBulkSelection({ deps: [currentPage, keyword] });

  // ── Add to Event Group State ───────────────────────────────────────
  const [openEventGroupModal, setOpenEventGroupModal] = useState(false);
  const [selectedEventGroupId, setSelectedEventGroupId] = useState("");
  const [loadingAddToGroup, setLoadingAddToGroup] = useState(false);

  const { data: eventGroupsRes } = useSWR<{ data: any[] }>(
    openEventGroupModal ? GET_EVENT_GROUPS(1, 100, "") : null
  );
  const eventGroups = eventGroupsRes?.data || [];

  // ── Detail Modal State ─────────────────────────────────────────────
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Record<number, boolean>>({});

  const { data: detailRes, isLoading: isLoadingDetail } = useSWR<{ data: any }>(
    isDetailModalOpen && selectedParticipantId ? GET_PARTICIPANT_HISTORY(selectedParticipantId) : null
  );
  const participantDetail = detailRes?.data;

  // ── Effects ────────────────────────────────────────────────────────
  useEffect(() => {
    if (isDetailModalOpen) setExpandedGroups({});
  }, [isDetailModalOpen, selectedParticipantId]);

  // ── Handlers ───────────────────────────────────────────────────────
  const handleAddToEventGroup = async () => {
    if (!selectedEventGroupId) {
      toast.error("Silakan pilih Event Group terlebih dahulu");
      return;
    }

    setLoadingAddToGroup(true);
    let successCount = 0;

    try {
      for (const id of selectedIds) {
        const payload = {
          event_group_id: selectedEventGroupId,
          participant_id: id,
        };
        try {
          await api.post("/registrations", payload);
          successCount++;
        } catch (e: any) {
          // Abaikan jika sudah terdaftar
        }
      }

      if (successCount > 0) {
        toast.success(`Berhasil menambahkan ${successCount} peserta ke Event Group.`);
      } else {
        toast.error("Semua peserta yang dipilih mungkin sudah terdaftar di Event Group tersebut.");
      }

      setOpenEventGroupModal(false);
      setSelectedIds([]);
      setSelectedEventGroupId("");
    } catch (error) {
      toast.error("Terjadi kesalahan sistem saat menambahkan peserta.");
    } finally {
      setLoadingAddToGroup(false);
    }
  };

  const handleCreateParticipant = async () => {
    const newErrors = { name: "", email: "", gender: "", company: "", api: "" };
    if (!form.name.trim()) newErrors.name = "Nama wajib diisi";
    if (!form.email.trim()) newErrors.email = "Email wajib diisi";
    if (!form.gender) newErrors.gender = "Jenis kelamin wajib dipilih";
    if (!form.company.trim()) newErrors.company = "Perusahaan wajib diisi";

    setErrors(newErrors);
    if (newErrors.name || newErrors.email || newErrors.gender || newErrors.company) return;

    try {
      setLoadingCreate(true);
      await api.post("/participants", form);

      await refreshList();
      setForm({ name: "", email: "", gender: "", company: "", membership_type_id: "" });
      setErrors({ name: "", email: "", gender: "", company: "", api: "" });
      setOpenCreateModal(false);
    } catch (error: any) {
      const message = extractApiError(error, "Terjadi kesalahan");
      setErrors((prev) => ({ ...prev, api: message }));
    } finally {
      setLoadingCreate(false);
    }
  };

  const handleOpenEditModal = (participant: Participant) => {
    setEditingParticipantId(participant.id);
    setEditForm({
      name: participant.name,
      email: participant.email,
      gender: participant.gender,
      company: participant.company,
      membership_type_id: participant.membership_type?.id || "",
    });
    setEditErrors({ name: "", email: "", gender: "", company: "", api: "" });
    setOpenEditModal(true);
  };

  const handleUpdateParticipant = async () => {
    if (!editingParticipantId) return;

    const newErrors = { name: "", email: "", gender: "", company: "", api: "" };
    if (!editForm.name.trim()) newErrors.name = "Nama wajib diisi";
    if (!editForm.email.trim()) newErrors.email = "Email wajib diisi";
    if (!editForm.gender) newErrors.gender = "Jenis kelamin wajib dipilih";
    if (!editForm.company.trim()) newErrors.company = "Perusahaan wajib diisi";

    setEditErrors(newErrors);
    if (newErrors.name || newErrors.email || newErrors.gender || newErrors.company) return;

    try {
      setLoadingEdit(true);
      await api.put(UPDATE_PARTICIPANT(editingParticipantId), editForm);

      await refreshList();
      setOpenEditModal(false);
      setEditingParticipantId(null);
      toast.success("Data peserta berhasil diperbarui");
    } catch (error: any) {
      const message = extractApiError(error, "Terjadi kesalahan");
      setEditErrors((prev) => ({ ...prev, api: message }));
    } finally {
      setLoadingEdit(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawData = XLSX.utils.sheet_to_json(ws) as any[];

        const formatted = rawData.map((row) => ({
          name: row["Nama"] || row["name"] || "",
          email: row["Email"] || row["email"] || "",
          gender:
            row["Jenis Kelamin"] === "Laki-laki" || row["gender"] === "L" || row["Jenis Kelamin"] === "L"
              ? "L"
              : "P",
          company: row["Perusahaan"] || row["company"] || "",
        }));

        if (formatted.length === 0) {
          toast.warning("File Excel terbaca namun tidak ada data di dalamnya.");
          return;
        }

        setExcelData(formatted);
        toast.info(`Berhasil memuat ${formatted.length} baris dari file Excel.`);
      } catch (err) {
        toast.error("Gagal membaca file Excel. Pastikan formatnya benar.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleSaveImportedData = async () => {
    if (excelData.length === 0) {
      toast.warning("Tidak ada data untuk disimpan.");
      return;
    }

    setLoadingImport(true);
    let successCount = 0;

    try {
      for (const item of excelData) {
        if (!item.name || !item.email) continue;
        try {
          await api.post("/participants", item);
          successCount++;
        } catch {
          // Skip failed items silently
        }
      }

      toast.success(`Berhasil menyimpan ${successCount} data peserta ke database.`);
      await refreshList();
      handleCloseImportModal();
    } catch (error) {
      toast.error("Terjadi kesalahan saat mengunggah data.");
    } finally {
      setLoadingImport(false);
    }
  };

  const handleCloseImportModal = () => {
    setOpenImportModal(false);
    setExcelData([]);
    setFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return {
    // State
    keyword,
    setKeyword,
    currentPage,
    setCurrentPage,
    selectedIds,
    openCreateModal,
    setOpenCreateModal,
    form,
    setForm,
    loadingCreate,
    errors,
    setErrors,
    openEditModal,
    setOpenEditModal,
    editingParticipantId,
    editForm,
    setEditForm,
    loadingEdit,
    editErrors,
    setEditErrors,
    openImportModal,
    setOpenImportModal,
    excelData,
    setExcelData,
    loadingImport,
    fileName,
    fileInputRef,
    openEventGroupModal,
    setOpenEventGroupModal,
    selectedEventGroupId,
    setSelectedEventGroupId,
    loadingAddToGroup,
    isDetailModalOpen,
    setIsDetailModalOpen,
    selectedParticipantId,
    setSelectedParticipantId,
    expandedGroups,
    setExpandedGroups,

    // Data
    participant,
    meta,
    isLoading,
    refreshList,
    membershipTypes,
    eventGroups,
    participantDetail,
    isLoadingDetail,

    // Handlers
    handleSelectAll,
    handleSelectOne,
    handleAddToEventGroup,
    handleCreateParticipant,
    handleOpenEditModal,
    handleUpdateParticipant,
    handleFileChange,
    handleSaveImportedData,
    handleCloseImportModal,
  };
}
