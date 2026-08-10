"use client";

import { useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import {
  Trash2,
  Users,
  ClipboardList,
  AlertTriangle,
  Search,
  Loader2,
  Database,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { GlassCard } from "@/components/shared/CustomCards";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import { extractApiError } from "@/lib/error";
import { isDev } from "@/lib/env";
import { GET_EVENT_GROUPS, GET_REGISTRATIONS, GET_PARTICIPANTS } from "@/lib/api-endpoints";

// Halaman dev-only: menghapus data secara CASCADE (melewati proteksi delete
// normal di API). Tidak tersedia di production.

export default function CascadeDeleteDevPage() {
  // ── Registrasi ──────────────────────────────────────────────────
  const [selectedEventGroupId, setSelectedEventGroupId] = useState("");
  const [regSelected, setRegSelected] = useState<string[]>([]);

  // ── Peserta ─────────────────────────────────────────────────────
  const [participantKeyword, setParticipantKeyword] = useState("");
  const [partSelected, setPartSelected] = useState<string[]>([]);

  // ── Dialog konfirmasi ───────────────────────────────────────────
  const [confirmType, setConfirmType] = useState<"registration" | "participant" | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: eventGroupsRes } = useSWR<{ data: any[] }>(GET_EVENT_GROUPS(1, 100, ""));
  const eventGroups = eventGroupsRes?.data || [];

  const { data: registrationsRes, isLoading: regLoading, mutate: mutateRegistrations } = useSWR<{
    data: any[];
    meta?: any;
  }>(selectedEventGroupId ? GET_REGISTRATIONS(selectedEventGroupId, 1, 9999) : null);
  const registrations = registrationsRes?.data || [];

  const { data: participantsRes, isLoading: partLoading, mutate: mutateParticipants } = useSWR<{
    data: any[];
    meta?: any;
  }>(GET_PARTICIPANTS(1, 200, participantKeyword));
  const participants = participantsRes?.data || [];

  if (!isDev) {
    return (
      <div className="p-10">
        <GlassCard className="p-8">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
            <h2 className="text-lg font-bold text-gray-900">Tidak Tersedia</h2>
          </div>
          <p className="text-sm text-gray-500">
            Halaman ini hanya tersedia dalam mode development dan tidak terdaftar di production.
          </p>
        </GlassCard>
      </div>
    );
  }

  const selectAllReg = (checked: boolean) => {
    setRegSelected(checked ? registrations.map((r) => r.id) : []);
  };

  const toggleReg = (id: string, checked: boolean) => {
    setRegSelected((prev) =>
      checked ? [...prev, id] : prev.filter((i) => i !== id)
    );
  };

  const selectAllPart = (checked: boolean) => {
    setPartSelected(checked ? participants.map((p) => p.id) : []);
  };

  const togglePart = (id: string, checked: boolean) => {
    setPartSelected((prev) =>
      checked ? [...prev, id] : prev.filter((i) => i !== id)
    );
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      if (confirmType === "registration") {
        const res = await api.delete<{ message: string }>("/dev/registrations/bulk", {
          registration_ids: regSelected,
        });
        toast.success(res?.message || `${regSelected.length} registrasi berhasil dihapus`);
        setRegSelected([]);
        await mutateRegistrations();
      } else if (confirmType === "participant") {
        const res = await api.delete<{ message: string }>("/dev/participants/bulk", {
          participant_ids: partSelected,
        });
        toast.success(res?.message || `${partSelected.length} peserta berhasil dihapus`);
        setPartSelected([]);
        await mutateParticipants();
      }
      setConfirmType(null);
    } catch (err: any) {
      toast.error(extractApiError(err, "Gagal menghapus data"));
    } finally {
      setIsDeleting(false);
    }
  };

  const regAllChecked = registrations.length > 0 && regSelected.length === registrations.length;
  const partAllChecked = participants.length > 0 && partSelected.length === participants.length;

  return (
    <div className="flex flex-col space-y-7 md:space-y-10 pb-20 md:pb-0">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Bulk Delete (Cascade)</h1>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-1">
            <Database className="w-3.5 h-3.5" />
            Dev Only
          </span>
        </div>
        <p className="text-gray-500 text-sm mt-1">
          Khusus development. Menghapus data secara cascade ({`attendance → registration → participant`}),
          melewati proteksi delete normal. JANGAN digunakan di production.
        </p>
      </div>

      {/* ⚠️ Peringatan */}
      <GlassCard className="p-4 border-amber-200">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-700">
            Data yang dihapus TIDAK dapat dikembalikan. Semua registrasi & catatan kehadiran terkait
            akan ikut terhapus (cascade).
          </p>
        </div>
      </GlassCard>

      {/* ── Hapus Registrasi ─────────────────────────────────────── */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <ClipboardList className="w-5 h-5 text-red-600" />
          <h2 className="text-lg font-bold text-gray-900">Hapus Registrasi (Cascade)</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Pilih grup event, lalu hapus registrasi terpilih beserta catatan kehadirannya.
        </p>

        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 block mb-1">Grup Event</label>
          <Select
            value={selectedEventGroupId}
            onValueChange={(v) => {
              setSelectedEventGroupId(v as string);
              setRegSelected([]);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="-- Pilih Grup Event --" />
            </SelectTrigger>
            <SelectContent>
              {eventGroups.map((eg: any) => (
                <SelectItem key={eg.id} value={eg.id}>
                  {eg.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedEventGroupId && (
          <>
            <div className="overflow-x-auto border rounded-lg">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="w-12 text-center">
                      <Checkbox checked={regAllChecked} onCheckedChange={(c) => selectAllReg(!!c)} />
                    </TableHead>
                    <TableHead>Nama Peserta</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-center">Kehadiran</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {regLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-400">
                        Memuat...
                      </TableCell>
                    </TableRow>
                  ) : registrations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-400">
                        Tidak ada registrasi pada grup event ini
                      </TableCell>
                    </TableRow>
                  ) : (
                    registrations.map((r) => {
                      const attCount = r._count?.attendances ?? r.attendances?.length ?? 0;
                      return (
                        <TableRow key={r.id}>
                          <TableCell className="text-center">
                            <Checkbox
                              checked={regSelected.includes(r.id)}
                              onCheckedChange={(c) => toggleReg(r.id, !!c)}
                            />
                          </TableCell>
                          <TableCell>
                            <span className="text-sm font-semibold">{r.participant?.name}</span>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {r.participant?.email}
                          </TableCell>
                          <TableCell className="text-center text-sm">
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                                attCount > 0
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {attCount}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{r.status}</TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-gray-500">
                {regSelected.length} dari {registrations.length} dipilih
              </span>
              <Button
                variant="destructive"
                disabled={regSelected.length === 0}
                onClick={() => setConfirmType("registration")}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Hapus Registrasi Terpilih
              </Button>
            </div>
          </>
        )}
      </GlassCard>

      {/* ── Hapus Peserta ────────────────────────────────────────── */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-red-600" />
          <h2 className="text-lg font-bold text-gray-900">Hapus Peserta (Cascade)</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Cari & hapus peserta terpilih beserta seluruh registrasi dan catatan kehadirannya di semua
          event group.
        </p>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Cari nama atau email peserta..."
            value={participantKeyword}
            onChange={(e) => {
              setParticipantKeyword(e.target.value);
              setPartSelected([]);
            }}
            className="pl-9"
          />
        </div>

        <div className="overflow-x-auto border rounded-lg">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-12 text-center">
                  <Checkbox checked={partAllChecked} onCheckedChange={(c) => selectAllPart(!!c)} />
                </TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Perusahaan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {partLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-400">
                    Memuat...
                  </TableCell>
                </TableRow>
              ) : participants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-400">
                    Tidak ada peserta ditemukan
                  </TableCell>
                </TableRow>
              ) : (
                participants.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="text-center">
                      <Checkbox
                        checked={partSelected.includes(p.id)}
                        onCheckedChange={(c) => togglePart(p.id, !!c)}
                      />
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-semibold">{p.name}</span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{p.email}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{p.company}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-gray-500">
            {partSelected.length} dari {participants.length} dipilih
          </span>
          <Button
            variant="destructive"
            disabled={partSelected.length === 0}
            onClick={() => setConfirmType("participant")}
          >
            <Users className="w-4 h-4 mr-2" />
            Hapus Peserta Terpilih
          </Button>
        </div>
      </GlassCard>

      {/* ── Dialog konfirmasi ────────────────────────────────────── */}
      <ConfirmationDialog
        open={confirmType !== null}
        onOpenChange={(open) => !open && setConfirmType(null)}
        title={confirmType === "registration" ? "Hapus Registrasi (Cascade)" : "Hapus Peserta (Cascade)"}
        description={
          confirmType === "registration"
            ? `Yakin menghapus ${regSelected.length} registrasi? Seluruh catatan kehadirannya akan ikut terhapus (cascade). Tindakan ini tidak dapat dibatalkan.`
            : `Yakin menghapus ${partSelected.length} peserta? Seluruh registrasi dan catatan kehadirannya di semua event group akan ikut terhapus (cascade). Tindakan ini tidak dapat dibatalkan.`
        }
        confirmText="Ya, Hapus Semua"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
