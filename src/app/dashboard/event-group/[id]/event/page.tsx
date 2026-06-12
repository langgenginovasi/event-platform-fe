"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import {
  Search,
  Plus,
  Import,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Eye,
  Mail,
  Loader2,
  ArrowUpDown,
  Edit3,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePermissions } from "@/hooks/usePermissions";
import { cn } from "@/lib/utils";
import { StatCard } from "@/components/dashboard/StatCard";
import { TableToolbar } from "@/components/dashboard/TableToolbar";
import { PaginationFooter } from "@/components/dashboard/PaginationFooter";
import { Checkbox } from "@/components/ui/checkbox";
import { CardContent } from "@/components/ui/card";
import { TableCard } from "@/components/dashboard/CustomCards";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { GET_EVENTS } from "@/lib/api-endpoints";

// ─── Types ──────────────────────────────────────────────────────────────────
interface EventItem {
  id: string;
  name: string;
  start_datetime: string;
  end_datetime: string;
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function EventPage() {
  const { id } = useParams() as { id: string };
  const [keyword, setKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { can } = usePermissions();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    start_datetime: "",
    end_datetime: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // SWR fetch
  const { data, error, isLoading, mutate } = useSWR<{ data: EventItem[]; meta: any }>(
    GET_EVENTS(id, currentPage, 10, keyword)
  );

  const handleOpenModal = (event?: EventItem) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        name: event.name,
        // Remove 'Z' if present to format for datetime-local input
        start_datetime: new Date(event.start_datetime).toISOString().slice(0, 16),
        end_datetime: new Date(event.end_datetime).toISOString().slice(0, 16),
      });
    } else {
      setEditingEvent(null);
      setFormData({ name: "", start_datetime: "", end_datetime: "" });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        start_datetime: new Date(formData.start_datetime).toISOString(),
        end_datetime: new Date(formData.end_datetime).toISOString(),
      };

      if (editingEvent) {
        await api.put(`/events/${editingEvent.id}`, payload);
        toast.success("Event berhasil diupdate");
      } else {
        await api.post("/events", { ...payload, event_group_id: id });
        toast.success("Event berhasil ditambahkan");
      }
      setIsModalOpen(false);
      mutate();
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus event ini?")) return;
    try {
      await api.delete(`/events/${eventId}`);
      toast.success("Event berhasil dihapus");
      mutate();
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus event");
    }
  };

  return (
    <div className="flex flex-col space-y-7 md:space-y-10 pb-20 md:pb-0">
      {/* ── Summary Card ─────────────────────────────────────────────── */}
      <div className="flex flex-col space-y-3 md:space-x-4 md:flex-row md:space-y-0">
        <div className="w-full md:w-1/4 lg:w-1/5">
          <StatCard title="Total Event" value={data?.meta?.total || 0} />
        </div>
      </div>

      {/* ── Sort + Table ─────────────────────────────────────────────── */}
      <TableCard>
        <TableToolbar
          title="Daftar Event"
          keyword={keyword}
          setKeyword={setKeyword}
          searchPlaceholder="Cari event..."
          actionButton={
            can("eventCreate") && (
              <Button
                onClick={() => handleOpenModal()}
                className="whitespace-nowrap w-full"
                style={{ backgroundColor: "var(--brand-primary)" }}
              >
                <Plus className="w-4 h-4 mr-1" />
                Tambah Event
              </Button>
            )
          }
        />

        {/* Data Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-12 text-center">
                  <Checkbox />
                </TableHead>
                <TableHead>
                  <div className="flex items-center cursor-pointer group">Nama <ArrowUpDown className="ml-2 h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" /></div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center cursor-pointer group">Waktu Mulai <ArrowUpDown className="ml-2 h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" /></div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center cursor-pointer group">Waktu Selesai <ArrowUpDown className="ml-2 h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" /></div>
                </TableHead>
                <TableHead className="text-right">Opsi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              )}

              {!isLoading &&
                data?.data?.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="text-center">
                      <Checkbox />
                    </TableCell>
                    <TableCell className="font-semibold text-foreground">{event.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(event.start_datetime).toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(event.end_datetime).toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {can("eventEdit") && (
                          <Button variant="outline" size="sm" onClick={() => handleOpenModal(event)}>
                            <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                            Edit
                          </Button>
                        )}
                        {can("eventDelete") && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => handleDelete(event.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                            Hapus
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

              {!isLoading && (!data?.data || data.data.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground text-sm">
                    Tidak ada data event
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <PaginationFooter
          currentPage={currentPage}
          totalPage={data?.meta?.total_pages || 1}
          totalData={data?.meta?.total || 0}
          onPrev={() => setCurrentPage((p) => Math.max(1, p - 1))}
          onNext={() => setCurrentPage((p) => Math.min(data?.meta?.total_pages || 1, p + 1))}
        />
      </TableCard>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingEvent ? "Edit Event" : "Tambah Event"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nama Event</label>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Masukkan nama event"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Waktu Mulai</label>
              <Input
                required
                type="datetime-local"
                value={formData.start_datetime}
                onChange={(e) => setFormData({ ...formData, start_datetime: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Waktu Selesai</label>
              <Input
                required
                type="datetime-local"
                value={formData.end_datetime}
                onChange={(e) => setFormData({ ...formData, end_datetime: e.target.value })}
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
