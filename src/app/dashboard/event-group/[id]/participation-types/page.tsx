"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { extractApiError } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TableCard } from "@/components/shared/CustomCards";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  GET_EVENT_GROUP_PARTICIPATION_TYPES,
  GET_PARTICIPATION_TYPES,
} from "@/lib/api-endpoints";
import { Plus, Trash2, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { TableBodyStates } from "@/components/shared/TableBodyStates";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TableToolbar } from "@/components/shared/TableToolbar";

interface ParticipationType {
  id: string;
  name: string;
  slug: string;
}

interface Assignment {
  id: string;
  participation_type_id: string;
  is_active: boolean;
  participation_type: ParticipationType;
}

export default function EventGroupParticipationTypesPage() {
  const params = useParams();
  const eventGroupId = params.id as string;

  const { data: assignmentsData, isLoading: assignmentsLoading, mutate: mutateAssignments } = useSWR(
    GET_EVENT_GROUP_PARTICIPATION_TYPES(eventGroupId)
  );
  const { data: allTypesData } = useSWR(GET_PARTICIPATION_TYPES());

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTypeId, setSelectedTypeId] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const assignments: Assignment[] = assignmentsData?.data || [];
  const allTypes: ParticipationType[] = allTypesData?.data || [];

  const availableTypes = allTypes.filter(
    (type) => !assignments.some((a) => a.participation_type_id === type.id)
  );

  const handleAssign = async () => {
    if (!selectedTypeId) {
      toast.error("Pilih tipe partisipasi");
      return;
    }

    setSaving(true);
    try {
      await api.post(`/event-groups/${eventGroupId}/participation-types`, {
        participation_type_id: selectedTypeId,
      });
      toast.success("Tipe partisipasi berhasil ditambahkan");
      setIsDialogOpen(false);
      setSelectedTypeId("");
      mutateAssignments();
    } catch (error: any) {
      toast.error(extractApiError(error, "Gagal menambahkan"));
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (assignment: Assignment) => {
    if (!confirm(`Hapus "${assignment.participation_type.name}" dari event group ini?`)) return;

    try {
      await api.delete(`/event-groups/${eventGroupId}/participation-types/${assignment.id}`);
      toast.success("Berhasil dihapus");
      mutateAssignments();
    } catch (error: any) {
      toast.error(extractApiError(error, "Gagal menghapus"));
    }
  };

  const handleToggleActive = async (assignment: Assignment) => {
    try {
      await api.put(`/event-groups/${eventGroupId}/participation-types/${assignment.id}`, {
        is_active: !assignment.is_active,
      });
      toast.success(assignment.is_active ? "Type dinonaktifkan" : "Type diaktifkan");
      mutateAssignments();
    } catch (error: any) {
      toast.error(extractApiError(error, "Gagal mengubah status"));
    }
  };

  return (
    <div className="flex flex-col space-y-7 md:space-y-10 pb-20 md:pb-0">
      <TableCard>
        <TableToolbar
          title="Tipe Partisipasi"
          keyword=""
          setKeyword={() => {}}
          searchPlaceholder=""
          actionButton={
            <Button
              onClick={() => setIsDialogOpen(true)}
              disabled={availableTypes.length === 0}
              className="whitespace-nowrap w-full"
            >
              <Plus className="w-4 h-4 mr-1" />
              Tambah
            </Button>
          }
        />

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>No</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableBodyStates
                isLoading={assignmentsLoading}
                isEmpty={assignments.length === 0}
                colSpan={5}
                emptyMessage="Belum ada tipe partisipasi yang ditugaskan"
              />

              {!assignmentsLoading &&
                assignments.map((assignment, idx) => (
                  <TableRow key={assignment.id}>
                    <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                    <TableCell className="font-semibold text-foreground">{assignment.participation_type.name}</TableCell>
                    <TableCell className="text-muted-foreground">{assignment.participation_type.slug}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          assignment.is_active
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-gray-50 text-gray-500 border border-gray-200"
                        }`}
                      >
                        {assignment.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleActive(assignment)}
                        >
                          {assignment.is_active ? (
                            <XCircle className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
                          )}
                          {assignment.is_active ? "Nonaktifkan" : "Aktifkan"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemove(assignment)}
                          className="text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                          Hapus
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </TableCard>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Tipe Partisipasi</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Pilih Tipe</label>
              <Select value={selectedTypeId} onValueChange={(v) => setSelectedTypeId(v as string)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tipe partisipasi" />
                </SelectTrigger>
                <SelectContent>
                  {availableTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={saving}>
              Batal
            </Button>
            <Button onClick={handleAssign} disabled={saving || !selectedTypeId}>
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Tambahkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
