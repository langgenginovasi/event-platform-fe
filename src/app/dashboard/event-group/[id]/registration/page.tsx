"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import {
  Search,
  Eye,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowUpDown,
  UserPlus,
  Loader2,
  Trash2,
  CheckCircle,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { TableCard } from "@/components/dashboard/CustomCards";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/hooks/usePermissions";
import { StatCard } from "@/components/dashboard/StatCard";
import { TableToolbar } from "@/components/dashboard/TableToolbar";
import { PaginationFooter } from "@/components/dashboard/PaginationFooter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { GET_REGISTRATIONS, GET_PARTICIPANTS, GET_EVENTS } from "@/lib/api-endpoints";

// ─── Types ──────────────────────────────────────────────────────────────────
interface RegistrationItem {
  id: string;
  status: string;
  participant: {
    id: string;
    name: string;
    email: string;
    company: string;
    gender: string;
  };
  attendances: any[];
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function RegistrationPage() {
  const { id } = useParams() as { id: string };
  const [keyword, setKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { can } = usePermissions();

  const [sortField, setSortField] = useState<string | undefined>();
  const [sortOrder, setSortOrder] = useState<string | undefined>();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [participantSearch, setParticipantSearch] = useState("");
  const [isExistingParticipant, setIsExistingParticipant] = useState(false);
  const [formData, setFormData] = useState({
    participant_id: "NEW",
    name: "",
    email: "",
    company: "",
    gender: "L",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── STATE UNTUK CHECK-IN EVENT MODAL ───────────────────────────────
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [checkInAction, setCheckInAction] = useState<{type: "manual" | "bulk", action: "checkin" | "checkout", registrationId?: string}>({type: "manual", action: "checkin"});
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  // ── STATE UNTUK BULK SELECTION ────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Reset selection when page/keyword changes
  useEffect(() => {
    setSelectedIds([]);
  }, [currentPage, keyword]);

  // SWR fetch
  const { data, error, isLoading, mutate } = useSWR<{ data: RegistrationItem[]; meta: any }>(
    GET_REGISTRATIONS(id, currentPage, 10, keyword, sortField, sortOrder)
  );

  const handleSort = (field: string) => {
    if (sortField === field) {
      if (sortOrder === "asc") setSortOrder("desc");
      else {
        setSortField(undefined);
        setSortOrder(undefined);
      }
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked && data?.data) {
      setSelectedIds(data.data.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  // Fetch unregistered participants for autocomplete
  const { data: unregisteredData } = useSWR<{ data: any[] }>(
    isModalOpen ? GET_PARTICIPANTS(1, 5, participantSearch, id) : null
  );
  const unregisteredParticipants = unregisteredData?.data || [];

  // Fetch events (sub-events) for the modal
  const { data: eventsData } = useSWR<{ data: any[] }>(
    isEventModalOpen ? GET_EVENTS(id, 1, 100) : null
  );
  const events = eventsData?.data || [];

  const handleOpenModal = () => {
    setFormData({ participant_id: "NEW", name: "", email: "", company: "", gender: "L" });
    setParticipantSearch("");
    setIsExistingParticipant(false);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload: any = {
        event_group_id: id,
      };

      if (formData.participant_id !== "NEW") {
        payload.participant_id = formData.participant_id;
      } else {
        payload.name = formData.name;
        payload.email = formData.email;
        payload.company = formData.company;
        payload.gender = formData.gender;
      }

      await api.post("/registrations", payload);
      toast.success("Registrasi berhasil ditambahkan");
      setIsModalOpen(false);
      mutate();
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (registrationId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus registrasi ini?")) return;
    try {
      await api.delete(`/registrations/${registrationId}`);
      toast.success("Registrasi berhasil dihapus");
      mutate();
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus registrasi");
    }
  };

  const handleManualCheckIn = (registrationId: string) => {
    setCheckInAction({ type: "manual", action: "checkin", registrationId });
    setIsEventModalOpen(true);
  };

  const handleManualCheckOut = (registrationId: string) => {
    setCheckInAction({ type: "manual", action: "checkout", registrationId });
    setIsEventModalOpen(true);
  };

  const handleBulkCheckIn = () => {
    setCheckInAction({ type: "bulk", action: "checkin" });
    setIsEventModalOpen(true);
  };

  const handleBulkCheckOut = () => {
    setCheckInAction({ type: "bulk", action: "checkout" });
    setIsEventModalOpen(true);
  };

  const executeCheckIn = async () => {
    if (!selectedEventId) {
      toast.error("Pilih event terlebih dahulu");
      return;
    }
    setIsCheckingIn(true);
    try {
      if (checkInAction.type === "manual") {
        await api.post("/attendances/manual", {
          registration_id: checkInAction.registrationId,
          event_id: selectedEventId,
          type: checkInAction.action
        });
        toast.success(checkInAction.action === "checkin" ? "Check-in berhasil" : "Check-out berhasil");
      } else {
        await api.post("/attendances/bulk", {
          registration_ids: selectedIds,
          event_id: selectedEventId,
          type: checkInAction.action
        });
        toast.success(`${selectedIds.length} peserta berhasil di-${checkInAction.action === "checkin" ? "Check-in" : "Check-out"}`);
        if (checkInAction.action === "checkin" || checkInAction.action === "checkout") {
          setSelectedIds([]);
        }
      }
      mutate();
      setIsEventModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Gagal melakukan proses");
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Apakah Anda yakin ingin menghapus ${selectedIds.length} registrasi ini?`)) return;
    try {
      for (const regId of selectedIds) {
        await api.delete(`/registrations/${regId}`);
      }
      toast.success(`${selectedIds.length} registrasi berhasil dihapus`);
      setSelectedIds([]);
      mutate();
    } catch (err: any) {
      toast.error(err.message || "Gagal melakukan bulk hapus");
    }
  };

  const getCheckInTime = (attendances: any[]) => {
    const cin = attendances.find((a) => a.type === "checkin");
    return cin ? new Date(cin.scanned_at).toLocaleTimeString("id-ID") : null;
  };

  const getCheckOutTime = (attendances: any[]) => {
    const cout = attendances.find((a) => a.type === "checkout");
    return cout ? new Date(cout.scanned_at).toLocaleTimeString("id-ID") : null;
  };

  const hasCheckedIn = (attendances: any[]) => attendances.some((a) => a.type === "checkin");
  const hasCheckedOut = (attendances: any[]) => attendances.some((a) => a.type === "checkout");

  return (
    <div className="flex flex-col space-y-7 md:space-y-10 pb-20 md:pb-0">
      {/* ── Filters + Summary Cards ──────────────────────────────────── */}
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-3 sm:space-x-4 sm:flex-row sm:space-y-0">
          <div className="w-full sm:w-1/3 lg:w-1/4">
            <StatCard title="Total Registrasi" value={data?.meta?.total || 0} />
          </div>
          <div className="w-full sm:w-1/3 lg:w-1/4">
            <StatCard 
              title="Total Check In" 
              value={data?.data?.filter((p) => hasCheckedIn(p.attendances)).length || 0} 
              borderLeftColorClass="border-l-emerald-500"
              valueColorClass="text-emerald-600"
            />
          </div>
          <div className="w-full sm:w-1/3 lg:w-1/4">
            <StatCard 
              title="Total Check Out" 
              value={data?.data?.filter((p) => hasCheckedOut(p.attendances)).length || 0} 
              borderLeftColorClass="border-l-rose-500"
              valueColorClass="text-rose-600"
            />
          </div>
        </div>
      </div>

      {/* ── Data Table ─────────────────────────────────────────────── */}
      <TableCard>
        <TableToolbar
          title={`Registrasi Peserta (Event Group #${id})`}
          keyword={keyword}
          setKeyword={setKeyword}
          searchPlaceholder="Cari peserta (nama / email)..."
          actionButton={
            can("registrationManage") && (
              <Button
                onClick={() => handleOpenModal()}
                className="whitespace-nowrap w-full"
                style={{ backgroundColor: "var(--brand-primary)" }}
              >
                <UserPlus className="w-4 h-4 mr-1" />
                Tambah Peserta
              </Button>
            )
          }
        />

        {/* Bulk Action Bar */}
        {selectedIds.length > 0 && (
          <div className="bg-blue-50/50 border-b border-blue-100 px-5 py-3 flex items-center justify-between animate-in slide-in-from-top-2">
            <span className="text-sm font-medium text-blue-800">
              {selectedIds.length} peserta dipilih
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200" onClick={handleBulkCheckIn}>
                Check In
              </Button>
              <Button size="sm" variant="outline" className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 border-amber-200" onClick={handleBulkCheckOut}>
                Check Out
              </Button>
              <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200" onClick={handleBulkDelete}>
                Hapus
              </Button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-12 text-center">
                  <Checkbox 
                    checked={!!(data?.data && data.data.length > 0 && selectedIds.length === data.data.length)}
                    onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                  />
                </TableHead>
                <TableHead onClick={() => handleSort('name')} className="cursor-pointer group">
                  <div className="flex items-center">
                    Nama Peserta{" "}
                    <ArrowUpDown className={cn("ml-2 h-3.5 w-3.5 transition-opacity", sortField === "name" ? "opacity-100" : "opacity-0 group-hover:opacity-100")} />
                  </div>
                </TableHead>
                <TableHead onClick={() => handleSort('gender')} className="cursor-pointer group">
                  <div className="flex items-center">
                    L/P{" "}
                    <ArrowUpDown className={cn("ml-2 h-3.5 w-3.5 transition-opacity", sortField === "gender" ? "opacity-100" : "opacity-0 group-hover:opacity-100")} />
                  </div>
                </TableHead>
                <TableHead onClick={() => handleSort('company')} className="cursor-pointer group">
                  <div className="flex items-center">
                    Perusahaan{" "}
                    <ArrowUpDown className={cn("ml-2 h-3.5 w-3.5 transition-opacity", sortField === "company" ? "opacity-100" : "opacity-0 group-hover:opacity-100")} />
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center text-muted-foreground">
                    Check In
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center text-muted-foreground">
                    Check Out
                  </div>
                </TableHead>
                <TableHead className="text-right">
                  Opsi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              )}

              {!isLoading && (!data?.data || data.data.length === 0) && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-32 text-center text-muted-foreground text-sm"
                  >
                    Tidak ada data peserta terdaftar
                  </TableCell>
                </TableRow>
              )}

              {!isLoading &&
                data?.data?.map((reg) => {
                  const checkIn = getCheckInTime(reg.attendances);
                  const checkOut = getCheckOutTime(reg.attendances);
                  const isSelected = selectedIds.includes(reg.id);

                  return (
                    <TableRow 
                      key={reg.id}
                      className={cn(isSelected && "bg-blue-50/50 hover:bg-blue-50/70")}
                    >
                      <TableCell className="text-center">
                        <Checkbox 
                          checked={isSelected}
                          onCheckedChange={(checked) => handleSelectOne(reg.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-foreground">
                            {reg.participant.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {reg.participant.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground capitalize">
                        {reg.participant.gender}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {reg.participant.company}
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono">
                        {checkIn || "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono">
                        {checkOut || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1.5" />
                            Detail
                          </Button>
                          {can("registrationManage") && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                                onClick={() => handleManualCheckIn(reg.id)}
                                title="Check In Manual"
                              >
                                <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                                Check In
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700"
                                onClick={() => handleManualCheckOut(reg.id)}
                                title="Check Out Manual"
                              >
                                <LogOut className="w-3.5 h-3.5 mr-1.5" />
                                Check Out
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => handleDelete(reg.id)}
                                title="Hapus Registrasi"
                              >
                                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                                Hapus
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
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
            <DialogTitle>Tambah Registrasi Peserta</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2 relative">
              <label className="text-sm font-medium">Cari Peserta Terdaftar (Opsional)</label>
              <Input
                placeholder="Ketik nama atau email..."
                value={participantSearch}
                onChange={(e) => {
                  setParticipantSearch(e.target.value);
                  if (isExistingParticipant) {
                    setIsExistingParticipant(false);
                    setFormData({ participant_id: "NEW", name: "", email: "", company: "", gender: "L" });
                  }
                }}
              />
              {participantSearch && !isExistingParticipant && unregisteredParticipants.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
                  {unregisteredParticipants.map((p: any) => (
                    <div
                      key={p.id}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                      onClick={() => {
                        setParticipantSearch(p.name);
                        setFormData({
                          participant_id: p.id,
                          name: p.name,
                          email: p.email,
                          company: p.company,
                          gender: p.gender,
                        });
                        setIsExistingParticipant(true);
                      }}
                    >
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-gray-500">{p.email} • {p.company}</div>
                    </div>
                  ))}
                </div>
              )}
              {participantSearch && !isExistingParticipant && unregisteredParticipants.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 px-3 py-2 text-sm text-gray-500 text-center">
                  Tidak ditemukan. Peserta akan dibuat baru.
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Nama Peserta</label>
              <Input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Masukkan nama"
                readOnly={isExistingParticipant}
                className={isExistingParticipant ? "bg-gray-100 text-gray-500" : ""}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                required
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Masukkan email"
                readOnly={isExistingParticipant}
                className={isExistingParticipant ? "bg-gray-100 text-gray-500" : ""}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Perusahaan / Instansi</label>
              <Input
                required
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Masukkan nama perusahaan"
                readOnly={isExistingParticipant}
                className={isExistingParticipant ? "bg-gray-100 text-gray-500" : ""}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Jenis Kelamin</label>
              {isExistingParticipant ? (
                <Input
                  value={formData.gender === "L" ? "Laki-laki (L)" : "Perempuan (P)"}
                  readOnly
                  className="bg-gray-100 text-gray-500"
                />
              ) : (
                <Select
                  value={formData.gender}
                  onValueChange={(val) => setFormData({ ...formData, gender: val || "L" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Jenis Kelamin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L">Laki-laki (L)</SelectItem>
                    <SelectItem value="P">Perempuan (P)</SelectItem>
                  </SelectContent>
                </Select>
              )}
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
      <Dialog open={isEventModalOpen} onOpenChange={setIsEventModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Pilih Sub-Event</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Pilih Event (Sub-Event)</label>
              <Select
                value={selectedEventId}
                onValueChange={setSelectedEventId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih event..." />
                </SelectTrigger>
                <SelectContent>
                  {events.map((ev: any) => (
                    <SelectItem key={ev.id} value={ev.id}>
                      {ev.name}
                    </SelectItem>
                  ))}
                  {events.length === 0 && (
                    <SelectItem value="none" disabled>
                      Tidak ada sub-event tersedia
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEventModalOpen(false)}>
              Batal
            </Button>
            <Button onClick={executeCheckIn} disabled={isCheckingIn || !selectedEventId || selectedEventId === "none"}>
              {isCheckingIn ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Proses
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
