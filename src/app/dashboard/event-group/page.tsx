"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  Import,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Eye,
  Mail,
  Loader2,
  ArrowUpDown,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/hooks/usePermissions";

// ─── Types ──────────────────────────────────────────────────────────────────

interface EventItem {
  id: number;
  name: string;
  description: string;
  date_start: string;
  date_end: string;
  participants: number;
}

// ─── Mock Data (replace with SWR fetch) ──────────────────────────────────────

const mockEvents: EventItem[] = [
  {
    id: 1,
    name: "Kongres Nasional 2026",
    description: "Pertemuan tahunan anggota",
    date_start: "2026-08-01",
    date_end: "2026-08-03",
    participants: 80,
  },
  {
    id: 2,
    name: "Tech Summit 2026",
    description: "Forum teknologi & inovasi",
    date_start: "2026-10-10",
    date_end: "2026-10-12",
    participants: 48,
  },
  {
    id: 3,
    name: "Workshop AI & Data",
    description: "Pelatihan intensive AI",
    date_start: "2026-11-05",
    date_end: "2026-11-06",
    participants: 25,
  },
];

// ─── Sort options (from old project) ─────────────────────────────────────────

const sortOptions = [
  { label: "Nama - ASC", value: "name:ASC" },
  { label: "Nama - DESC", value: "name:DESC" },
  { label: "Tgl Mulai - ASC", value: "date_start:ASC" },
  { label: "Tgl Mulai - DESC", value: "date_start:DESC" },
];

// ─── Page ───────────────────────────────────────────────────────────────────

export default function EventGroupPage() {
  const [keyword, setKeyword] = useState("");
  const [order, setOrder] = useState("date_start:DESC");
  const isLoading = false;
  const router = useRouter();
  const { can } = usePermissions();

  // TODO: replace with SWR — useSWR(GET_EVENTS(currentPage, 10, keyword, false, order))
  const data = { data: mockEvents, total: mockEvents.length, totalPage: 1 };

  return (
    <div className="flex flex-col space-y-7 md:space-y-10 pb-20 md:pb-0">
      {/* ── Summary Card ─────────────────────────────────────────────── */}
      <div className="flex flex-col space-y-3 md:space-x-4 md:flex-row md:space-y-0">
        <Card className="w-full md:w-1/4 lg:w-1/5 border-l-4 border-l-[var(--brand-primary)]">
          <CardContent className="p-4">
            <p className="font-semibold text-gray-500 md:text-sm lg:text-base">Total Grup Event</p>
            <h3 className="text-lg font-bold md:text-xl" style={{ color: "var(--brand-primary)" }}>
              {data?.total || 0}
            </h3>
          </CardContent>
        </Card>
      </div>

      {/* ── Sort + Table ─────────────────────────────────────────────── */}
      <div className="card-base card-border-primary overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-white flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-lg font-bold" style={{ color: "var(--brand-primary)" }}>
            Daftar Grup Event
          </h2>
          
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="search"
                autoComplete="off"
                className="block w-full px-3 py-2 pl-9 text-sm text-gray-900 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-[var(--brand-light)] focus:border-[var(--brand-light)] outline-none transition-all"
                placeholder="Cari grup event..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>

            {/* Sort Dropdown removed in favor of table headers */}

            {can("eventGroupCreate") && (
              <Button
                onClick={() => {/* TODO: open add event group modal */}}
                className="whitespace-nowrap w-full sm:w-auto"
                style={{ backgroundColor: "var(--brand-primary)" }}
              >
                <Plus className="w-4 h-4 mr-1" />
                Tambah Grup Event
              </Button>
            )}
          </div>
        </div>

        {/* Data Table */}
        <div className="relative overflow-x-auto">
          <table className="table-base w-full border-none">
            <thead className="table-header bg-gray-50/50">
              <tr>
                <th className="px-5 py-4 w-12 border-b">
                  <Checkbox />
                </th>
                <th className="px-5 py-4 whitespace-nowrap text-xs uppercase tracking-wider text-gray-500 font-semibold border-b cursor-pointer hover:bg-gray-100 transition-colors group">
                  <div className="flex items-center">Nama <ArrowUpDown className="ml-2 h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" /></div>
                </th>
                <th className="px-5 py-4 whitespace-nowrap text-xs uppercase tracking-wider text-gray-500 font-semibold border-b cursor-pointer hover:bg-gray-100 transition-colors group">
                  <div className="flex items-center">Deskripsi <ArrowUpDown className="ml-2 h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" /></div>
                </th>
                <th className="px-5 py-4 whitespace-nowrap text-xs uppercase tracking-wider text-gray-500 font-semibold border-b cursor-pointer hover:bg-gray-100 transition-colors group">
                  <div className="flex items-center">Tgl Mulai <ArrowUpDown className="ml-2 h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" /></div>
                </th>
                <th className="px-5 py-4 whitespace-nowrap text-xs uppercase tracking-wider text-gray-500 font-semibold border-b cursor-pointer hover:bg-gray-100 transition-colors group">
                  <div className="flex items-center">Tgl Selesai <ArrowUpDown className="ml-2 h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" /></div>
                </th>
                <th className="px-5 py-4 whitespace-nowrap text-xs uppercase tracking-wider text-gray-500 font-semibold border-b text-center cursor-pointer hover:bg-gray-100 transition-colors group">
                  <div className="flex items-center justify-center">Peserta <ArrowUpDown className="ml-2 h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" /></div>
                </th>
                <th className="px-5 py-4 whitespace-nowrap text-xs uppercase tracking-wider text-gray-500 font-semibold border-b text-right">Opsi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading && (
                <tr>
                  <td colSpan={6} className="h-32 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                  </td>
                </tr>
              )}

              {!isLoading &&
                data?.data?.map((event) => (
                  <tr 
                    key={event.id} 
                    className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/dashboard/event-group/${event.id}`)}
                  >
                    <td className="px-5 py-4">
                      <Checkbox />
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold" style={{ color: "var(--brand-primary)" }}>{event.name}</td>
                    <td className="px-5 py-4 text-sm text-gray-600 max-w-xs truncate">{event.description}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{event.date_start}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{event.date_end}</td>
                    <td className="px-5 py-4 text-sm text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-medium bg-blue-50 text-blue-700">
                        {event.participants}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end space-x-2">
                        {can("eventGroupDelete") && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                            Hapus
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 border-gray-200"
                          onClick={() => router.push(`/dashboard/event-group/${event.id}`)}
                        >
                          <Eye className="w-3.5 h-3.5 mr-1.5" />
                          Masuk Workspace
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={event.participants === 0}
                          className={cn(
                            "h-8",
                            event.participants > 0
                              ? "text-blue-700 border-blue-200 hover:bg-blue-50"
                              : "text-gray-400 border-gray-200"
                          )}
                        >
                          <Mail className="w-3.5 h-3.5 mr-1.5" />
                          Email
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}

              {!isLoading && (!data?.data || data.data.length === 0) && (
                <tr>
                  <td colSpan={7} className="h-32 text-center text-gray-500 text-sm">
                    Tidak ada data grup event
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/30 flex items-center justify-between">
          <p className="text-sm text-gray-500 hidden sm:block">
            Menampilkan <span className="font-medium text-gray-900">{data?.data?.length || 0}</span> data
          </p>
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-center sm:justify-end">
            <Button variant="outline" size="sm" className="h-8 px-2 border-gray-200" disabled>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-gray-600 font-medium min-w-[3rem] text-center">1 / {data?.totalPage || 1}</span>
            <Button variant="outline" size="sm" className="h-8 px-2 border-gray-200" disabled={(data?.totalPage ?? 0) <= 1}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
