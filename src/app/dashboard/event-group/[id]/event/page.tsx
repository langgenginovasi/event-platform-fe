"use client";

import { useState } from "react";
import useSWR from "swr";
import { useParams } from "next/navigation";
import { Plus, Loader2, ArrowUpDown, Eye, Edit3, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { usePermissions } from "@/hooks/usePermissions";
import { StatCard } from "@/components/dashboard/StatCard";
import { TableToolbar } from "@/components/dashboard/TableToolbar";
import { PaginationFooter } from "@/components/dashboard/PaginationFooter";
import { GET_EVENTS_ALL } from "@/lib/api-endpoints";
import DynamicModal, { DynamicField } from "@/components/ui/Dynamic-Modal";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ─── Types & Constants ──────────────────────────────────────────────────────
interface EventItem {
  id: string | number;
  name: string;
  description: string;
  start_datetime: string;
  end_datetime: string;
}

interface FormState {
  name: string;
  start_date: string;
  end_date: string;
}

const fieldsGrupEvent: DynamicField[] = [
  {
    name: "name",
    label: "Nama Event",
    placeholder: "Masukkan nama event",
    type: "text",
  },
];

const initialFormState: FormState = {
  name: "",
  start_date: "",
  end_date: "",
};

const initialErrors = {
  name: "",
  start_date: "",
  end_date: "",
  api: "",
};

// ─── DIUBAH: Menghapus field deskripsi dari detail modal ───────────────────
const detailFields: DynamicField[] = [
  { name: "name", label: "Nama Event", type: "text" },
  { name: "event_group_name", label: "Grup Event", type: "text" },
  { name: "start_date", label: "Waktu Mulai", type: "datetime-local" },
  { name: "end_date", label: "Waktu Selesai", type: "datetime-local" },
  { name: "attendances_count", label: "Total Peserta Hadir", type: "number" },
];

export default function EventPage() {
  const { can } = usePermissions();
  const params = useParams();
  const eventGroupId = params.id as string;
  const { data: session } = useSession();

  const {
    data: eventsRes,
    isLoading,
    mutate,
  } = useSWR(eventGroupId ? GET_EVENTS_ALL(eventGroupId) : null);

  // ─── States Paging & Filter ─────────────────────────────────────────────────
  const [keyword, setKeyword] = useState("");

  // ─── States Modal Delete (selectedId dipakai bersama untuk Edit & Delete) ────
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal Toggles Form Create/Edit
  const [openCreateEventModal, setOpenCreateEventModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);

  // Loading States Form
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  // Form & Validation States
  const [form, setForm] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState(initialErrors);

  // Detail State
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailForm, setDetailForm] = useState({
    name: "",
    event_group_name: "",
    start_date: "",
    end_date: "",
    attendances_count: "",
  });

  // ─── Computed Data ──────────────────────────────────────────────────────────
  const events: EventItem[] = eventsRes?.data ?? [];
  const filteredEvents = events.filter((item: EventItem) => {
    const search = keyword.toLowerCase();
    return (
      item.name?.toLowerCase().includes(search) ||
      item.description?.toLowerCase().includes(search)
    );
  });

  // ─── Helper Functions ───────────────────────────────────────────────────────
  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleString("id-ID");
    } catch {
      return "-";
    }
  };

  const validateForm = (currentForm: FormState) => {
    const newErrors = { ...initialErrors };

    if (!currentForm.name.trim()) newErrors.name = "Nama event wajib diisi";
    if (!currentForm.start_date)
      newErrors.start_date = "Tanggal mulai wajib diisi";
    if (!currentForm.end_date)
      newErrors.end_date = "Tanggal selesai wajib diisi";

    if (currentForm.start_date && currentForm.end_date) {
      if (new Date(currentForm.start_date) >= new Date(currentForm.end_date)) {
        newErrors.end_date = "Tanggal selesai harus setelah tanggal mulai";
      }
    }

    return newErrors;
  };

  const handleFormChange = (updatedForm: FormState) => {
    setForm(updatedForm);
    setErrors(validateForm(updatedForm));
  };

  const handleSetFormState = (callbackOrValue: any) => {
    if (typeof callbackOrValue === "function") {
      setForm((prev) => {
        const nextState = callbackOrValue(prev);
        setErrors(validateForm(nextState));
        return nextState;
      });
    } else {
      handleFormChange(callbackOrValue);
    }
  };

  const resetFormAndErrors = () => {
    setForm(initialFormState);
    setErrors(initialErrors);
  };

  // ─── API Handlers ───────────────────────────────────────────────────────────
  const handleCreateEventGroup = async () => {
    const newErrors = validateForm(form);
    setErrors(newErrors);
    if (newErrors.name || newErrors.start_date || newErrors.end_date) return;

    try {
      setLoadingCreate(true);
      const payload = {
        event_group_id: eventGroupId,
        name: form.name,
        start_datetime: new Date(form.start_date).toISOString(),
        end_datetime: new Date(form.end_date).toISOString(),
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user?.accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      const response = await res.json();
      if (!res.ok) {
        setErrors((prev) => ({
          ...prev,
          api: response?.message || "Gagal membuat event",
        }));
        return;
      }

      await mutate();
      toast.success("Event berhasil dibuat!");
      setOpenCreateEventModal(false);
      resetFormAndErrors();
    } catch (error: any) {
      setErrors((prev) => ({
        ...prev,
        api: error?.message || "Terjadi kesalahan",
      }));
    } finally {
      setLoadingCreate(false);
    }
  };

  const handleOpenEdit = (event: EventItem) => {
    setSelectedId(String(event.id));
    setForm({
      name: event.name,
      start_date: event.start_datetime
        ? new Date(event.start_datetime).toISOString().slice(0, 16)
        : "",
      end_date: event.end_datetime
        ? new Date(event.end_datetime).toISOString().slice(0, 16)
        : "",
    });
    setOpenEditModal(true);
  };

  const handleUpdateEvent = async () => {
    const newErrors = validateForm(form);
    setErrors(newErrors);
    if (newErrors.name || newErrors.start_date || newErrors.end_date) return;

    try {
      setLoadingUpdate(true);
      const payload = {
        name: form.name,
        start_datetime: new Date(form.start_date).toISOString(),
        end_datetime: new Date(form.end_date).toISOString(),
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/events/${selectedId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user?.accessToken}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const response = await res.json();
      if (!res.ok) {
        setErrors((prev) => ({
          ...prev,
          api: response?.message || "Gagal update event",
        }));
        return;
      }

      await mutate();
      toast.success("Event berhasil diupdate!");
      setOpenEditModal(false);
      setSelectedId(null);
      resetFormAndErrors();
    } catch (err: any) {
      setErrors((prev) => ({
        ...prev,
        api: err?.message || "Terjadi kesalahan",
      }));
    } finally {
      setLoadingUpdate(false);
    }
  };

  const handleOpenDetail = async (eventId: number | string) => {
    try {
      setLoadingDetail(true);
      setOpenDetailModal(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/events/${eventId}`,
        {
          headers: { Authorization: `Bearer ${session?.user?.accessToken}` },
        },
      );

      const response = await res.json();
      if (!res.ok) {
        toast.error(response?.message || "Gagal mengambil detail event");
        setOpenDetailModal(false);
        return;
      }

      const event = response?.data;
      setDetailForm({
        name: event?.name || "",
        event_group_name: event?.event_group?.name || "-",
        start_date: event?.start_datetime || "",
        end_date: event?.end_datetime || "",
        attendances_count:
          event?._count?.attendances !== undefined
            ? `${event._count.attendances} Orang`
            : "0 Orang",
      });
    } catch (err: any) {
      toast.error(err?.message || "Terjadi kesalahan");
      setOpenDetailModal(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;

    setOpenDelete(false);

    try {
      setIsDeleting(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/events/${selectedId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session?.user?.accessToken}`,
          },
        },
      );

      if (!res.ok) {
        toast.error("Gagal menghapus event");
        return;
      }

      await mutate();
      toast.success("Event berhasil dihapus.");
    } catch (err) {
      toast.error("Terjadi masalah saat menghubungi server.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col space-y-7 md:space-y-10 pb-20 md:pb-0">
      {/* Summary Card */}
      <div className="flex flex-col space-y-3 md:space-x-4 md:flex-row md:space-y-0">
        <div className="w-full md:w-1/4 lg:w-1/5">
          <StatCard title="Total Event" value={events.length} />
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card-base card-border-primary overflow-hidden">
        <TableToolbar
          title="Daftar Event"
          keyword={keyword}
          setKeyword={setKeyword}
          searchPlaceholder="Cari event..."
          actionButton={
            can("eventCreate") && (
              <Button
                onClick={() => setOpenCreateEventModal(true)}
                className="whitespace-nowrap w-full"
                style={{ backgroundColor: "var(--brand-primary)" }}
              >
                <Plus className="w-4 h-4 mr-1" /> Tambah Event
              </Button>
            )
          }
        />

        <div className="relative overflow-x-auto">
          <table className="table-base w-full border-none">
            <thead className="table-header bg-gray-50/50">
              <tr>
                <th className="px-5 py-4 w-12 border-b">
                  <Checkbox />
                </th>
                <th className="px-5 py-4 whitespace-nowrap text-xs uppercase tracking-wider text-gray-500 font-semibold border-b">
                  Nama
                </th>
                <th className="px-5 py-4 whitespace-nowrap text-xs uppercase tracking-wider text-gray-500 font-semibold border-b">
                  Deskripsi
                </th>
                <th className="px-5 py-4 whitespace-nowrap text-xs uppercase tracking-wider text-gray-500 font-semibold border-b">
                  Waktu Mulai
                </th>
                <th className="px-5 py-4 whitespace-nowrap text-xs uppercase tracking-wider text-gray-500 font-semibold border-b">
                  Waktu Selesai
                </th>
                <th className="px-5 py-4 whitespace-nowrap text-xs uppercase tracking-wider text-gray-500 font-semibold border-b text-right">
                  Opsi
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {isLoading && (
                <tr>
                  <td colSpan={6} className="h-32 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                  </td>
                </tr>
              )}

              {!isLoading &&
                filteredEvents.map((event) => (
                  <tr
                    key={event.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-5 py-4 border-b">
                      <Checkbox />
                    </td>
                    <td
                      className="px-5 py-4 text-sm font-semibold"
                      style={{ color: "var(--brand-primary)" }}
                    >
                      {event.name}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {event.description || "-"}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {formatDateTime(event.start_datetime)}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {formatDateTime(event.end_datetime)}
                    </td>
                    <td className="px-5 py-4 text-sm text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 border-gray-200"
                          onClick={() => handleOpenDetail(event.id)}
                        >
                          <Eye className="w-3.5 h-3.5 mr-1.5" /> Detail
                        </Button>

                        {can("eventEdit") && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 border-gray-200"
                            onClick={() => handleOpenEdit(event)}
                          >
                            <Edit3 className="w-3.5 h-3.5 mr-1.5" /> Edit
                          </Button>
                        )}

                        {can("eventDelete") && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                            onClick={() => {
                              setSelectedId(String(event.id));
                              setOpenDelete(true);
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Hapus
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

              {!isLoading && filteredEvents.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="h-32 text-center text-gray-500 text-sm"
                  >
                    Tidak ada data event
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <PaginationFooter
          currentPage={1}
          totalPage={1}
          totalData={filteredEvents.length}
          onPrev={() => {}}
          onNext={() => {}}
        />
      </div>

      {/* Create Modal */}
      <DynamicModal
        title="Tambah Event"
        confirmLabel="Simpan"
        showDates
        fields={fieldsGrupEvent}
        formState={form}
        setFormState={handleSetFormState}
        errors={errors}
        isOpen={openCreateEventModal}
        isLoading={loadingCreate}
        onClose={() => {
          setOpenCreateEventModal(false);
          resetFormAndErrors();
        }}
        onConfirm={handleCreateEventGroup}
      />

      {/* Edit Modal */}
      <DynamicModal
        title="Edit Event"
        confirmLabel="Update"
        showDates
        fields={fieldsGrupEvent}
        formState={form}
        setFormState={handleSetFormState}
        errors={errors}
        isOpen={openEditModal}
        isLoading={loadingUpdate}
        onClose={() => {
          setOpenEditModal(false);
          setSelectedId(null);
          resetFormAndErrors();
        }}
        onConfirm={handleUpdateEvent}
      />

      {/* Detail Modal */}
      <DynamicModal
        mode="detail"
        title="Detail Event"
        confirmLabel=""
        showDates={false}
        fields={detailFields}
        formState={detailForm}
        setFormState={() => {}}
        errors={{}}
        isOpen={openDetailModal}
        isLoading={loadingDetail}
        onClose={() => {
          setOpenDetailModal(false);
          setDetailForm({
            name: "",
            event_group_name: "",
            start_date: "",
            end_date: "",
            attendances_count: "",
          });
        }}
        onConfirm={() => {}}
      />

      {/* Popup Konfirmasi Delete */}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Hapus Event</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus data event ini? Tindakan ini
              tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setOpenDelete(false);
                setSelectedId(null);
              }}
              disabled={isDeleting}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menghapus...
                </>
              ) : (
                "Hapus"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
