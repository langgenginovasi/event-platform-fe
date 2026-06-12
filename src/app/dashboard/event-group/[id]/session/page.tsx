"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Plus, Trash2, Clock, Calendar as CalendarIcon, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableCard } from "@/components/dashboard/CustomCards";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function SessionPage({ params }: { params: { id: string } }) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      // Fetch using the custom api wrapper that handles auth tokens
      const res = await api.get<{ data: any[] }>(`/sessions`);
      setSessions(res.data);
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
        {/* Header information is now displayed in the global Layout header */}
        <div className="flex-1" />
        <Button className="gap-2 w-full md:w-auto">
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
                  <TableHead>Waktu</TableHead>
                  <TableHead>Lokasi</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                      <div className="flex justify-center items-center gap-2">
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        Memuat data...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : sessions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                      <div className="flex flex-col items-center">
                        <Clock className="w-12 h-12 text-muted-foreground/50 mb-2" />
                        Belum ada sesi yang didaftarkan.
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  sessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell className="font-medium text-foreground">{session.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        <div className="flex items-center gap-1.5 text-xs">
                          <CalendarIcon className="w-3.5 h-3.5" />
                          {new Date(session.start_time).toLocaleString('id-ID')}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <div className="flex items-center gap-1.5 text-xs">
                          <MapPin className="w-3.5 h-3.5" />
                          {session.location || '-'}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TableCard>
      </motion.div>
    </div>
  );
}
