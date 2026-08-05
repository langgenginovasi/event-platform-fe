"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { api } from "@/lib/api";
import { extractApiError } from "@/lib/utils";
import { GET_SESSIONS } from "@/lib/api-endpoints";
import { Plus, Trash2, Clock, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableCard } from "@/components/shared/CustomCards";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { formatDateTime } from "@/lib/utils";
import { TableBodyStates } from "@/components/shared/TableBodyStates";

export default function SessionPage() {
  const params = useParams();
  const eventGroupId = params.id as string;

  const [showAddModal, setShowAddModal] = useState(false);
  const [newSession, setNewSession] = useState({ name: "", start_datetime: "", end_datetime: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: sessionsRes, isLoading, mutate } = useSWR(
    GET_SESSIONS(undefined, 1, 100),
    { revalidateOnFocus: false }
  );

  // Filter sessions by event_group_id on client side
  // (Backend sessions don't have event_group_id directly, they belong to events)
  const sessions = sessionsRes?.data || [];

  const handleAddSession = async () => {
    if (!newSession.name || !newSession.start_datetime || !newSession.end_datetime) {
      toast.warning("Semua field harus diisi.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/sessions", {
        name: newSession.name,
        start_datetime: newSession.start_datetime,
        end_datetime: newSession.end_datetime,
      });
      toast.success("Sesi berhasil ditambahkan!");
      setShowAddModal(false);
      setNewSession({ name: "", start_datetime: "", end_datetime: "" });
      mutate();
    } catch (error: any) {
      toast.error(extractApiError(error, "Gagal menambahkan sesi."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSession = async (sessionId: string, sessionName: string) => {
    if (!confirm(`Hapus sesi "${sessionName}"?`)) return;

    try {
      await api.delete(`/sessions/${sessionId}`);
      toast.success("Sesi berhasil dihapus!");
      mutate();
    } catch (error: any) {
      toast.error(extractApiError(error, "Gagal menghapus sesi."));
    }
  };

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
                          onClick={() => handleDeleteSession(session.id, session.name)}
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

      {/* Add Session Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogTitle>Tambah Sesi Baru</DialogTitle>
          <DialogDescription>
            Masukkan detail sesi untuk event ini.
          </DialogDescription>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nama Sesi</label>
              <Input
                placeholder="Contoh: Pleno 1 - Pemilihan Ketua"
                value={newSession.name}
                onChange={(e) => setNewSession({ ...newSession, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Waktu Mulai</label>
                <Input
                  type="datetime-local"
                  value={newSession.start_datetime}
                  onChange={(e) => setNewSession({ ...newSession, start_datetime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Waktu Selesai</label>
                <Input
                  type="datetime-local"
                  value={newSession.end_datetime}
                  onChange={(e) => setNewSession({ ...newSession, end_datetime: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>Batal</Button>
            <Button onClick={handleAddSession} disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
