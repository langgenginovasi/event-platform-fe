"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  Import,
  ChevronLeft,
  ChevronRight,
  Eye,
  ArrowDownToLine,
  ArrowUpFromLine,
  Mail,
  Loader2,
  ArrowUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/hooks/usePermissions";

// ─── Types ──────────────────────────────────────────────────────────────────

interface Participant {
  id: number;
  fullname: string;
  jenis_kelamin: string;
  company: string;
  email: string;
  check_in?: string | null;
  check_out?: string | null;
}

// ─── Mock Data ──────────────────────────────────────────────────────────────

const mockParticipants: Participant[] = [
  { id: 1, fullname: "Ahmad Fadillah", jenis_kelamin: "Laki-laki", company: "PT Astra", email: "ahmad@astra.co.id", check_in: "2026-08-01 08:30", check_out: null },
  { id: 2, fullname: "Siti Rahmawati", jenis_kelamin: "Perempuan", company: "PT Telkom", email: "siti@telkom.co.id", check_in: "2026-08-01 08:15", check_out: "2026-08-01 17:00" },
  { id: 3, fullname: "Budi Santoso", jenis_kelamin: "Laki-laki", company: "PT PLN", email: "budi@pln.co.id", check_in: null, check_out: null },
  { id: 4, fullname: "Dewi Lestari", jenis_kelamin: "Perempuan", company: "PT BRI", email: "dewi@bri.co.id", check_in: "2026-08-01 09:00", check_out: null },
];

const mockEvents = [
  { label: "Kongres Nasional 2026", value: 1 },
  { label: "Tech Summit 2026", value: 2 },
];

const sortOptions = [
  { label: "Nama - ASC", value: "fullname:ASC" },
  { label: "Nama - DESC", value: "fullname:DESC" },
  { label: "Perusahaan - ASC", value: "company:ASC" },
  { label: "Perusahaan - DESC", value: "company:DESC" },
  { label: "Email - ASC", value: "email:ASC" },
  { label: "Email - DESC", value: "email:DESC" },
];

// ─── Page ───────────────────────────────────────────────────────────────────

export default function ParticipantPage() {
  const [keyword, setKeyword] = useState("");
  const [order, setOrder] = useState("fullname:ASC");
  const isLoading = false;
  const { can } = usePermissions();

  // TODO: replace with SWR — useSWR(GET_PARTICIPANTS(...))
  const data = { data: mockParticipants, total: mockParticipants.length, totalPage: 1 };

  return (
    <div className="flex flex-col space-y-7 md:space-y-10 pb-20 md:pb-0">
      {/* ── Filters + Summary Cards ──────────────────────────────────── */}
      <div className="flex flex-col space-y-6">
        {/* Summary Cards */}
        <div className="flex flex-col space-y-3 sm:space-x-4 sm:flex-row sm:space-y-0">
          <Card className="w-full sm:w-1/3 lg:w-1/4 border-l-4 border-l-[var(--brand-primary)] shadow-sm">
            <CardContent className="p-4 sm:p-5">
              <p className="font-semibold text-gray-500 text-sm">Total Peserta Master</p>
              <h3 className="text-xl sm:text-2xl font-bold mt-1" style={{ color: "var(--brand-primary)" }}>
                {data?.total || 0}
              </h3>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Sort + Table ─────────────────────────────────────────────── */}
      <div className="card-base card-border-primary overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-white flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-lg font-bold" style={{ color: "var(--brand-primary)" }}>
            Daftar Participant
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
                placeholder="Cari participant..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>

            {/* Sort Dropdown removed in favor of table headers */}

            {can("participantCreate") && (
              <Button
                onClick={() => {/* TODO: open add participant modal */}}
                className="whitespace-nowrap w-full sm:w-auto"
                style={{ backgroundColor: "var(--brand-primary)" }}
              >
                <Plus className="w-4 h-4 mr-1" />
                Tambah Peserta
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => {/* TODO: open import modal */}}
              className="whitespace-nowrap w-full sm:w-auto text-green-700 border-green-300 hover:bg-green-50"
            >
              <Import className="w-4 h-4 mr-1" />
              Import
            </Button>
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
                  <div className="flex items-center">Jenis Kelamin <ArrowUpDown className="ml-2 h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" /></div>
                </th>
                <th className="px-5 py-4 whitespace-nowrap text-xs uppercase tracking-wider text-gray-500 font-semibold border-b cursor-pointer hover:bg-gray-100 transition-colors group">
                  <div className="flex items-center">Perusahaan <ArrowUpDown className="ml-2 h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" /></div>
                </th>
                <th className="px-5 py-4 whitespace-nowrap text-xs uppercase tracking-wider text-gray-500 font-semibold border-b cursor-pointer hover:bg-gray-100 transition-colors group">
                  <div className="flex items-center">Email <ArrowUpDown className="ml-2 h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" /></div>
                </th>
                <th className="px-5 py-4 whitespace-nowrap text-xs uppercase tracking-wider text-gray-500 font-semibold border-b text-right">Opsi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading && (
                <tr>
                  <td colSpan={7} className="h-32 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                  </td>
                </tr>
              )}

              {!isLoading &&
                data?.data?.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <Checkbox />
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold" style={{ color: "var(--brand-primary)" }}>{p.fullname}</td>
                    <td className="px-5 py-4 text-sm text-gray-600 capitalize">{p.jenis_kelamin}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{p.company}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{p.email}</td>
                    <td className="px-5 py-4 text-sm text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button variant="outline" size="sm" className="h-8 border-gray-200">
                          <Eye className="w-3.5 h-3.5 mr-1.5" />
                          Detail
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}

              {!isLoading && (!data?.data || data.data.length === 0) && (
                <tr>
                  <td colSpan={7} className="h-32 text-center text-gray-500 text-sm">
                    Tidak ada data participant
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
