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
  Edit3,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePermissions } from "@/hooks/usePermissions";
import { cn } from "@/lib/utils";
import { StatCard } from "@/components/dashboard/StatCard";
import { TableToolbar } from "@/components/dashboard/TableToolbar";
import { PaginationFooter } from "@/components/dashboard/PaginationFooter";

// ─── Types ──────────────────────────────────────────────────────────────────

interface EventItem {
  id: number;
  name: string;
  description: string;
  date_start: string;
  date_end: string;
}

// ─── Mock Data (replace with SWR fetch) ──────────────────────────────────────

const mockEvents: EventItem[] = [
  {
    id: 1,
    name: "Registrasi",
    description: "Proses registrasi peserta",
    date_start: "2026-08-01 08:00",
    date_end: "2026-08-01 10:00",
  },
  {
    id: 2,
    name: "Hari 1 - Kongres",
    description: "Sesi pleno utama",
    date_start: "2026-08-01 10:00",
    date_end: "2026-08-01 17:00",
  },
  {
    id: 3,
    name: "Gala Dinner",
    description: "Makan malam bersama",
    date_start: "2026-08-01 19:00",
    date_end: "2026-08-01 22:00",
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

export default function EventPage() {
  const [keyword, setKeyword] = useState("");
  const [order, setOrder] = useState("date_start:DESC");
  const isLoading = false;
  const { can } = usePermissions();

  // TODO: replace with SWR — useSWR(GET_EVENTS(currentPage, 10, keyword, false, order))
  const data = { data: mockEvents, total: mockEvents.length, totalPage: 1 };

  return (
    <div className="flex flex-col space-y-7 md:space-y-10 pb-20 md:pb-0">
      {/* ── Summary Card ─────────────────────────────────────────────── */}
      <div className="flex flex-col space-y-3 md:space-x-4 md:flex-row md:space-y-0">
        <div className="w-full md:w-1/4 lg:w-1/5">
          <StatCard title="Total Event" value={data?.total || 0} />
        </div>
      </div>

      {/* ── Sort + Table ─────────────────────────────────────────────── */}
      <div className="card-base card-border-primary overflow-hidden">
        <TableToolbar
          title="Daftar Event"
          keyword={keyword}
          setKeyword={setKeyword}
          searchPlaceholder="Cari event..."
          actionButton={
            can("eventCreate") && (
              <Button
                onClick={() => {/* TODO: open add event modal */}}
                className="whitespace-nowrap w-full"
                style={{ backgroundColor: "var(--brand-primary)" }}
              >
                <Plus className="w-4 h-4 mr-1" />
                Tambah Event
              </Button>
            )
          }
        />

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
                  <div className="flex items-center">Waktu Mulai <ArrowUpDown className="ml-2 h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" /></div>
                </th>
                <th className="px-5 py-4 whitespace-nowrap text-xs uppercase tracking-wider text-gray-500 font-semibold border-b cursor-pointer hover:bg-gray-100 transition-colors group">
                  <div className="flex items-center">Waktu Selesai <ArrowUpDown className="ml-2 h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" /></div>
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
                  <tr key={event.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <Checkbox />
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold" style={{ color: "var(--brand-primary)" }}>{event.name}</td>
                    <td className="px-5 py-4 text-sm text-gray-600 max-w-xs truncate">{event.description}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{event.date_start}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{event.date_end}</td>
                    <td className="px-5 py-4 text-sm text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button variant="outline" size="sm" className="h-8 border-gray-200">
                          <Eye className="w-3.5 h-3.5 mr-1.5" />
                          Detail
                        </Button>
                        {can("eventEdit") && (
                          <Button variant="outline" size="sm" className="h-8 border-gray-200">
                            <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                            Edit
                          </Button>
                        )}
                        {can("eventDelete") && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                            Hapus
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

              {!isLoading && (!data?.data || data.data.length === 0) && (
                <tr>
                  <td colSpan={7} className="h-32 text-center text-gray-500 text-sm">
                    Tidak ada data event
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <PaginationFooter
          currentPage={1}
          totalPage={data?.totalPage || 1}
          totalData={data?.data?.length || 0}
          onPrev={() => {}}
          onNext={() => {}}
        />
      </div>
    </div>
  );
}
