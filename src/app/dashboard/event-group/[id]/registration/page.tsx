"use client";

import { useState } from "react";
import {
  Search,
  Eye,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowUpDown,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";
import { usePermissions } from "@/hooks/usePermissions";
import { StatCard } from "@/components/dashboard/StatCard";
import { TableToolbar } from "@/components/dashboard/TableToolbar";
import { PaginationFooter } from "@/components/dashboard/PaginationFooter";

// ─── Types & Mock Data ──────────────────────────────────────────────────────

type ParticipantItem = {
  id: number;
  fullname: string;
  jenis_kelamin: string;
  company: string;
  email: string;
  check_in?: string; // Optional: e.g. "10:00"
  check_out?: string; // Optional: e.g. "16:00"
};

const mockParticipants: ParticipantItem[] = [
  {
    id: 1,
    fullname: "Aditya Pratama",
    jenis_kelamin: "L",
    company: "PT Maju Mundur",
    email: "aditya@example.com",
    check_in: "08:15",
  },
  {
    id: 2,
    fullname: "Budi Santoso",
    jenis_kelamin: "L",
    company: "Startup Asia",
    email: "budi.s@example.com",
    check_in: "08:30",
    check_out: "17:00",
  },
  {
    id: 3,
    fullname: "Citra Kirana",
    jenis_kelamin: "P",
    company: "CV Karya Bangsa",
    email: "citra@example.com",
  },
];

// ─── Page ───────────────────────────────────────────────────────────────────

export default function RegistrationPage() {
  const [keyword, setKeyword] = useState("");
  const [order, setOrder] = useState("fullname:ASC");
  const params = useParams();
  const eventGroupId = params.id as string;
  const isLoading = false;
  const { can } = usePermissions();

  const data = {
    data: mockParticipants,
    total: mockParticipants.length,
    totalPage: 1,
  };

  return (
    <div className="flex flex-col space-y-7 md:space-y-10 pb-20 md:pb-0">
      {/* ── Filters + Summary Cards ──────────────────────────────────── */}
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-3 sm:space-x-4 sm:flex-row sm:space-y-0">
          <div className="w-full sm:w-1/3 lg:w-1/4">
            <StatCard title="Total Registrasi" value={data?.total || 0} />
          </div>
          <div className="w-full sm:w-1/3 lg:w-1/4">
            <StatCard 
              title="Total Check In" 
              value={data.data.filter(p => p.check_in).length} 
              borderLeftColorClass="border-l-emerald-500"
              valueColorClass="text-emerald-600"
            />
          </div>
          <div className="w-full sm:w-1/3 lg:w-1/4">
            <StatCard 
              title="Total Check Out" 
              value={data.data.filter(p => p.check_out).length} 
              borderLeftColorClass="border-l-rose-500"
              valueColorClass="text-rose-600"
            />
          </div>
        </div>
      </div>

      {/* ── Data Table ─────────────────────────────────────────────── */}
      <div className="card-base card-border-primary overflow-hidden">
        <TableToolbar
          title={`Registrasi Peserta (Event Group #${eventGroupId})`}
          keyword={keyword}
          setKeyword={setKeyword}
          searchPlaceholder="Cari peserta..."
          actionButton={
            can("registrationManage") && (
              <Button
                onClick={() => {/* TODO: add participant to event */}}
                className="whitespace-nowrap w-full"
                style={{ backgroundColor: "var(--brand-primary)" }}
              >
                <UserPlus className="w-4 h-4 mr-1" />
                Tambah Registrasi
              </Button>
            )
          }
        />

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="w-12 px-5 py-4 border-b">
                  <Checkbox />
                </th>
                <th className="px-5 py-4 whitespace-nowrap text-xs uppercase tracking-wider text-gray-500 font-semibold border-b cursor-pointer hover:bg-gray-100 transition-colors group">
                  <div className="flex items-center">
                    Nama Peserta{" "}
                    <ArrowUpDown className="ml-2 h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </th>
                <th className="px-5 py-4 whitespace-nowrap text-xs uppercase tracking-wider text-gray-500 font-semibold border-b cursor-pointer hover:bg-gray-100 transition-colors group">
                  <div className="flex items-center">
                    L/P{" "}
                    <ArrowUpDown className="ml-2 h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </th>
                <th className="px-5 py-4 whitespace-nowrap text-xs uppercase tracking-wider text-gray-500 font-semibold border-b cursor-pointer hover:bg-gray-100 transition-colors group">
                  <div className="flex items-center">
                    Perusahaan{" "}
                    <ArrowUpDown className="ml-2 h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </th>
                <th className="px-5 py-4 whitespace-nowrap text-xs uppercase tracking-wider text-gray-500 font-semibold border-b cursor-pointer hover:bg-gray-100 transition-colors group">
                  <div className="flex items-center">
                    Check In{" "}
                    <ArrowUpDown className="ml-2 h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </th>
                <th className="px-5 py-4 whitespace-nowrap text-xs uppercase tracking-wider text-gray-500 font-semibold border-b cursor-pointer hover:bg-gray-100 transition-colors group">
                  <div className="flex items-center">
                    Check Out{" "}
                    <ArrowUpDown className="ml-2 h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </th>
                <th className="px-5 py-4 whitespace-nowrap text-xs uppercase tracking-wider text-gray-500 font-semibold border-b text-right">
                  Opsi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading && (
                <tr>
                  <td colSpan={7} className="h-32 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--brand-primary)]"></div>
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && (!data?.data || data.data.length === 0) && (
                <tr>
                  <td
                    colSpan={7}
                    className="h-32 text-center text-gray-500 text-sm"
                  >
                    Tidak ada data peserta terdaftar
                  </td>
                </tr>
              )}

              {!isLoading &&
                data?.data?.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <Checkbox />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-800">
                          {p.fullname}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 capitalize">
                      {p.jenis_kelamin}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {p.company}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 font-mono">
                      {p.check_in || "-"}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 font-mono">
                      {p.check_out || "-"}
                    </td>
                    <td className="px-5 py-4 text-sm text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 border-gray-200"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1.5" />
                          Detail
                        </Button>
                        <Button
                          size="sm"
                          className={cn(
                            "h-8 text-white",
                            !p.check_in
                              ? "bg-green-500 hover:bg-green-600"
                              : "bg-gray-300 cursor-not-allowed",
                          )}
                          disabled={!!p.check_in}
                        >
                          <ArrowDownToLine className="w-3.5 h-3.5 mr-1.5" />
                          In
                        </Button>
                        <Button
                          size="sm"
                          className={cn(
                            "h-8 text-white",
                            !p.check_out
                              ? "bg-red-500 hover:bg-red-600"
                              : "bg-gray-300 cursor-not-allowed",
                          )}
                          disabled={!!p.check_out}
                        >
                          <ArrowUpFromLine className="w-3.5 h-3.5 mr-1.5" />
                          Out
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Skeleton */}
        <PaginationFooter
          currentPage={1}
          totalPage={1}
          totalData={data?.total || 0}
          onPrev={() => {}}
          onNext={() => {}}
        />
      </div>
    </div>
  );
}
