"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { extractApiError } from "@/lib/utils";
import { Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableCard } from "@/components/shared/CustomCards";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { useDeleteConfirmation } from "@/hooks/useDeleteConfirmation";
import { TableBodyStates } from "@/components/shared/TableBodyStates";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "OPERATOR" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Delete ──────────────────────────────────────────────────────
  const [deleteTargetName, setDeleteTargetName] = useState("");
  const deleteConfirmation = useDeleteConfirmation({
    onDelete: async (id) => {
      await api.delete(`/users/${id}`);
      fetchUsers();
    },
    successMessage: "Pengguna berhasil dihapus!",
    errorMessage: "Gagal menghapus pengguna.",
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get<{ data: User[] }>("/users");
      setUsers(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat data pengguna. Pastikan Anda login sebagai Super Admin.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast.warning("Semua field harus diisi.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/users", newUser);
      toast.success("Pengguna berhasil ditambahkan!");
      setShowAddModal(false);
      setNewUser({ name: "", email: "", password: "", role: "OPERATOR" });
      fetchUsers();
    } catch (error: any) {
      const message = extractApiError(error, "Gagal menambahkan pengguna.");
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    setDeleteTargetName(userName);
    deleteConfirmation.openDelete(userId);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Pengguna</h1>
          <p className="text-gray-500 text-sm">Kelola admin dan operator sistem.</p>
        </div>
        <Button className="gap-2 w-full md:w-auto" onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4" /> Tambah Pengguna
        </Button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <TableCard className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Cari nama atau email..."
                className="pl-9 bg-slate-50 focus-visible:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Nama Lengkap</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableBodyStates isLoading={loading} isEmpty={filteredUsers.length === 0} colSpan={4} emptyMessage="Tidak ada pengguna ditemukan." />

                {!loading && filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium text-foreground">{user.name}</TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell>
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-700' :
                          user.role === 'EVENT_ADMIN' ? 'bg-blue-100 text-blue-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {user.role.replace('_', ' ')}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteUser(user.id, user.name)}
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

      {/* Add User Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
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
              <label className="text-sm font-medium">Role</label>
              <Select
                items={[
                  { value: "OPERATOR", label: "OPERATOR" },
                  { value: "EVENT_ADMIN", label: "EVENT_ADMIN" },
                  { value: "SUPER_ADMIN", label: "SUPER_ADMIN" },
                ]}
                value={newUser.role}
                onValueChange={(v) => setNewUser({ ...newUser, role: v as string })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPERATOR">OPERATOR</SelectItem>
                  <SelectItem value="EVENT_ADMIN">EVENT_ADMIN</SelectItem>
                  <SelectItem value="SUPER_ADMIN">SUPER_ADMIN</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>Batal</Button>
            <Button onClick={handleAddUser} disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Confirmation Dialog: Hapus Pengguna ────────────────── */}
      <ConfirmationDialog
        open={deleteConfirmation.isOpen}
        onOpenChange={deleteConfirmation.setIsOpen}
        title="Hapus Pengguna"
        description={`Apakah Anda yakin ingin menghapus pengguna "${deleteTargetName}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        variant="danger"
        isLoading={deleteConfirmation.isDeleting}
        onConfirm={deleteConfirmation.confirmDelete}
      />
    </div>
  );
}
