"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Plus,
  Trash2,
  Clock,
  Calendar as CalendarIcon,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";

export default function SessionPage({ params }: { params: { id: string } }) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  const fetchSessions = async () => {
    try {
      setLoading(true);
      // Ensure your backend has the ?event_group_id= filter or logic for sessions
      // const res = await axios.get(`http://localhost:3001/api/sessions`, {
      //   withCredentials: true,
      // });

      const res = await axios.get("http://localhost:3001/api/sessions", {
        headers: {
          Authorization: `Bearer ${session?.user?.accessToken}`,
        },
      });
      setSessions(res.data.data);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat sesi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Sesi</h1>
          <p className="text-gray-500 text-sm">
            Kelola jadwal sesi (rundown) dalam acara ini.
          </p>
        </div>
        <Button className="btn-primary gap-2 w-full md:w-auto shadow-md hover-lift">
          <Plus className="w-4 h-4" /> Tambah Sesi
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-base p-6 border-t-4 border-t-blue-600 rounded-xl"
      >
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="table-base w-full">
            <thead className="table-header bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-600">
                  Nama Sesi
                </th>
                <th className="px-6 py-4 font-semibold text-gray-600">Waktu</th>
                <th className="px-6 py-4 font-semibold text-gray-600">
                  Lokasi
                </th>
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
              ) : sessions.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-gray-500 flex flex-col items-center"
                  >
                    <Clock className="w-12 h-12 text-gray-300 mb-2" />
                    Belum ada sesi yang didaftarkan.
                  </td>
                </tr>
              ) : (
                sessions.map((session) => (
                  <tr
                    key={session.id}
                    className="table-row hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {session.name}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <div className="flex items-center gap-1.5 text-xs">
                        <CalendarIcon className="w-3.5 h-3.5" />
                        {new Date(session.start_time).toLocaleString("id-ID")}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <div className="flex items-center gap-1.5 text-xs">
                        <MapPin className="w-3.5 h-3.5" />
                        {session.location || "-"}
                      </div>
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
