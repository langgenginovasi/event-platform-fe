"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { extractApiError } from "@/lib/error";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface AddUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}

const ROLE_OPTIONS = [
  { value: "OPERATOR", label: "Operator" },
  { value: "EVENT_ADMIN", label: "Admin Event" },
  { value: "SUPER_ADMIN", label: "Super Admin" },
];

export function AddUserModal({ open, onOpenChange, onSaved }: AddUserModalProps) {
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "OPERATOR" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast.warning("Semua field harus diisi.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/users", newUser);
      toast.success("Pengguna berhasil ditambahkan!");
      onOpenChange(false);
      setNewUser({ name: "", email: "", password: "", role: "OPERATOR" });
      onSaved?.();
    } catch (error: any) {
      toast.error(extractApiError(error, "Gagal menambahkan pengguna."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Pengguna Baru</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Masukkan detail pengguna baru. Password minimal 6 karakter.
          </p>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nama Lengkap</label>
            <Input
              placeholder="Contoh: John Doe"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              placeholder="john@example.com"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <Input
              type="password"
              placeholder="Minimal 6 karakter"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Peran</label>
            <Select
              items={ROLE_OPTIONS}
              value={newUser.role}
              onValueChange={(v) => setNewUser({ ...newUser, role: v as string })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Peran" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OPERATOR">Operator</SelectItem>
                <SelectItem value="EVENT_ADMIN">Admin Event</SelectItem>
                <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button onClick={handleAddUser} disabled={isSubmitting}>
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
