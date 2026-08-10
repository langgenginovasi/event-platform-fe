"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { extractApiError } from "@/lib/error";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface SessionFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}

export function SessionFormModal({ open, onOpenChange, onSaved }: SessionFormModalProps) {
  const [newSession, setNewSession] = useState({ name: "", start_datetime: "", end_datetime: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      onOpenChange(false);
      setNewSession({ name: "", start_datetime: "", end_datetime: "" });
      onSaved?.();
    } catch (error: any) {
      toast.error(extractApiError(error, "Gagal menambahkan sesi."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button onClick={handleAddSession} disabled={isSubmitting}>
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
