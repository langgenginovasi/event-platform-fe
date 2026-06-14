"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: session } = useSession();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:3001/api/users", {
        // withCredentials: true,
        headers: {
          Authorization: `Bearer ${session?.user?.accessToken}`,
        },
      });
      setUsers(res.data.data);
    } catch (error) {
      console.error(error);
      toast.error(
        "Gagal memuat data pengguna. Pastikan Anda login sebagai Super Admin.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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
        <Button className="btn-primary gap-2 w-full md:w-auto shadow-md hover-lift">
          <Plus className="w-4 h-4" /> Tambah Pengguna
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-base p-6 border-t-4 border-t-blue-600 rounded-xl"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Cari nama atau email..."
              className="pl-9 bg-gray-50 border-gray-200 focus-visible:ring-blue-600"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="table-base w-full">
            <thead className="table-header bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-600">
                  Nama Lengkap
                </th>
                <th className="px-6 py-4 font-semibold text-gray-600">Email</th>
                <th className="px-6 py-4 font-semibold text-gray-600">Role</th>
                <th className="px-6 py-4 font-semibold text-gray-600 text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      Memuat data...
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Tidak ada pengguna ditemukan.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="table-row hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                          user.role === "SUPER_ADMIN"
                            ? "bg-purple-100 text-purple-700"
                            : user.role === "EVENT_ADMIN"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {user.role.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
