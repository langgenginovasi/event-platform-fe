"use client";

import { useState } from "react";
import useSWR from "swr";
import { api } from "@/lib/api";
import { GET_SESSIONS } from "@/lib/api-endpoints";
import { Plus, Trash2, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableCard } from "@/components/shared/CustomCards";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { formatDateTime } from "@/lib/utils";
import { TableBodyStates } from "@/components/shared/TableBodyStates";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { SessionFormModal } from "@/components/features/workspace/SessionFormModal";
import { useDeleteConfirmation } from "@/hooks/useDeleteConfirmation";

export default function SessionPage() {
  const [showAddModal, setShowAddModal] = useState(false);

  const { data: sessionsRes, isLoading, mutate } = useSWR(
    GET_SESSIONS(undefined, 1, 100),
    { revalidateOnFocus: false }
  );

  const sessions = sessionsRes?.data || [];

  const deleteConfirmation = useDeleteConfirmation({
    onDelete: async (id: string) => {
      await api.delete(`/sessions/${id}`);
    },
    onSuccess: () => mutate(),
    successMessage: "Sesi berhasil dihapus!",
    errorMessage: "Gagal menghapus sesi.",
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex-1" />
        <Button className="gap-2 w-full md:w-auto" onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4" /> Tambah Sesi
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <TableCard className="p-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Nama Sesi</TableHead>
                  <TableHead>Waktu Mulai</TableHead>
                  <TableHead>Waktu Selesai</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableBodyStates isLoading={isLoading} isEmpty={sessions.length === 0} colSpan={4} emptyMessage="Belum ada sesi yang didaftarkan." />

                {!isLoading && sessions.map((session: any) => (
                    <TableRow key={session.id}>
                      <TableCell className="font-medium text-foreground">{session.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        <div className="flex items-center gap-1.5 text-xs">
                          <CalendarIcon className="w-3.5 h-3.5" />
                          {formatDateTime(session.start_datetime || session.start_time)}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <div className="flex items-center gap-1.5 text-xs">
                          <CalendarIcon className="w-3.5 h-3.5" />
                          {formatDateTime(session.end_datetime || session.end_time)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => deleteConfirmation.openDelete(session.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </TableCard>
      </motion.div>

      <SessionFormModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSaved={() => mutate()}
      />

      <ConfirmationDialog
        open={deleteConfirmation.isOpen}
        onOpenChange={deleteConfirmation.setIsOpen}
        title="Hapus Sesi"
        description="Apakah Anda yakin ingin menghapus sesi ini?"
        confirmText="Hapus"
        variant="danger"
        isLoading={deleteConfirmation.isDeleting}
        onConfirm={deleteConfirmation.confirmDelete}
      />
    </div>
  );
}
