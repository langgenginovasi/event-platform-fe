"use client";

import { useState } from "react";
import useSWR from "swr";
import { api } from "@/lib/api";
import { GET_USERS } from "@/lib/api-endpoints";
import { Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableCard } from "@/components/shared/CustomCards";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { useDeleteConfirmation } from "@/hooks/useDeleteConfirmation";
import { TableBodyStates } from "@/components/shared/TableBodyStates";
import { AddUserModal } from "@/components/features/users/AddUserModal";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTargetName, setDeleteTargetName] = useState("");

  const { data, isLoading, mutate } = useSWR<{ data: User[] }>(GET_USERS());
  const users = data?.data ?? [];

  const deleteConfirmation = useDeleteConfirmation({
    onDelete: async (id) => {
      await api.delete(`/users/${id}`);
      mutate();
    },
    successMessage: "Pengguna berhasil dihapus!",
    errorMessage: "Gagal menghapus pengguna.",
  });

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleDeleteUser = (userId: string, userName: string) => {
    setDeleteTargetName(userName);
    deleteConfirmation.openDelete(userId);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Manajemen Pengguna
          </h1>
          <p className="text-gray-500 text-sm">
            Kelola admin dan operator sistem.
          </p>
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
                  <TableHead>Peran</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableBodyStates isLoading={isLoading} isEmpty={filteredUsers.length === 0} colSpan={4} emptyMessage="Tidak ada pengguna ditemukan." />

                {!isLoading && filteredUsers.map((user) => (
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

      <AddUserModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSaved={() => mutate()}
      />

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
