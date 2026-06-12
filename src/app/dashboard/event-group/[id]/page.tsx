"use client";

import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { Users, ScanLine, ArrowLeft, CalendarDays, Settings, Eye, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import useSWR from "swr";
import { useEffect, useState } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";

import { GET_EVENT_GROUP_DETAIL } from "@/lib/api-endpoints";

export default function WorkspaceOverviewPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const eventGroupId = params.id as string;

  const { data: eventGroupRes, isLoading } = useSWR(
    GET_EVENT_GROUP_DETAIL(eventGroupId),
  );

  const eventGroup = eventGroupRes?.data;

  const [emailSubject, setEmailSubject] = useState("Tiket Acara Anda");
  const [emailBody, setEmailBody] = useState("Terima kasih telah mendaftar. Berikut adalah tiket Anda untuk akses masuk ke acara.");

  const totalSubEvents = eventGroup?.events?.length ?? 0;

  const totalRegistrations = eventGroup?._count?.registrations ?? 0;

  const totalAttendances =
    eventGroup?.events?.reduce(
      (total: number, event: any) => total + (event._count?.attendances ?? 0),
      0,
    ) ?? 0;

  const chartData = eventGroup?.events?.map((e: any) => ({
    name: e.name,
    Registrasi: e._count?.registrations || 0,
    Kehadiran: e._count?.attendances || 0,
  })) || [];

  useEffect(() => {
    console.log("===== EVENT GROUP DETAIL =====");
    console.log(eventGroupRes);

    console.log("===== EVENT GROUP =====");
    console.log(eventGroup);

    console.log("Total Sub Events:", totalSubEvents);
    console.log("Total Registrations:", totalRegistrations);
    console.log("Total Attendances:", totalAttendances);
  }, [
    eventGroupRes,
    eventGroup,
    totalSubEvents,
    totalRegistrations,
    totalAttendances,
  ]);
  return (
    <div className="flex flex-col space-y-7 md:space-y-10 pb-20 md:pb-0">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/dashboard/event-group")}
          className="h-10 w-10 shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          {/* Header information is now displayed in the global Layout header */}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-base p-6 border-l-4 border-l-[var(--brand-primary)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-500">
                Total Sub-Event
              </p>
              <h3
                className="text-2xl font-bold mt-1"
                style={{ color: "var(--brand-primary)" }}
              >
                {totalSubEvents}
              </h3>
            </div>
            <div className="p-3 bg-blue-50 rounded-full text-blue-900">
              <CalendarDays className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="card-base p-6 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-500">
                Total Registrasi
              </p>
              <h3 className="text-2xl font-bold mt-1 text-amber-600">
                {totalRegistrations}
              </h3>
            </div>
            <div className="p-3 bg-amber-50 rounded-full text-amber-600">
              <Users className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="card-base p-6 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-500">
                Total Kehadiran
              </p>
              <h3 className="text-2xl font-bold mt-1 text-emerald-600">
                {totalAttendances}
              </h3>
            </div>
            <div className="p-3 bg-emerald-50 rounded-full text-emerald-600">
              <ScanLine className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card-base overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gray-50/50">
          <h2
            className="text-lg font-bold"
            style={{ color: "var(--brand-primary)" }}
          >
            Aksi Cepat
          </h2>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Button
            className="w-full justify-start h-12"
            onClick={() =>
              router.push(`/dashboard/event-group/${eventGroupId}/scan`)
            }
            style={{ backgroundColor: "var(--brand-primary)" }}
          >
            <ScanLine className="mr-2 h-5 w-5" />
            Buka Scanner
          </Button>
          <Button
            className="w-full justify-start h-12"
            variant="outline"
            onClick={() =>
              router.push(`/dashboard/event-group/${eventGroupId}/registration`)
            }
          >
            <Users className="mr-2 h-5 w-5" />
            Kelola Registrasi
          </Button>
          <Button
            className="w-full justify-start h-12"
            variant="outline"
            onClick={() =>
              router.push(`/dashboard/event-group/${eventGroupId}/event`)
            }
          >
            <CalendarDays className="mr-2 h-5 w-5" />
            Kelola Sub-Event
          </Button>
        </div>
      </div>

      {/* Chart Section */}
      <div className="card-base overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gray-50/50">
          <h2
            className="text-lg font-bold"
            style={{ color: "var(--brand-primary)" }}
          >
            Statistik per Sub-Event
          </h2>
        </div>
        <div className="p-5 h-80">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Legend />
                <Bar dataKey="Registrasi" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Kehadiran" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              Belum ada data event
            </div>
          )}
        </div>
      </div>

      {/* Email Settings & Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Email Form */}
        <div className="card-base overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-bold" style={{ color: "var(--brand-primary)" }}>
              Pengaturan Email Tiket
            </h2>
          </div>
          <div className="p-6 flex-1 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Subjek Email</label>
              <Input 
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Masukkan subjek email"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Pesan Email</label>
              <Textarea 
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                placeholder="Tulis pesan untuk peserta..."
                rows={5}
                className="resize-none"
              />
              <p className="text-xs text-gray-500">
                Gunakan <code className="bg-gray-100 px-1 py-0.5 rounded">{`{name}`}</code> untuk menyapa nama peserta.
              </p>
            </div>
            <div className="pt-2">
              <Button style={{ backgroundColor: "var(--brand-primary)" }} className="w-full">
                <Check className="w-4 h-4 mr-2" />
                Simpan Pengaturan Email
              </Button>
            </div>
          </div>
        </div>

        {/* Email Preview */}
        <div className="card-base overflow-hidden flex flex-col bg-gray-50">
          <div className="p-5 border-b border-gray-200 bg-gray-100/50 flex items-center gap-2">
            <Eye className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-bold text-gray-700">
              Pratinjau Email
            </h2>
          </div>
          <div className="p-6 flex-1 flex items-center justify-center">
            <div className="w-full max-w-sm bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-800 text-white p-4 text-center">
                <h3 className="font-bold text-lg">{eventGroup?.name || "Nama Event Group"}</h3>
              </div>
              <div className="p-6 space-y-4">
                <p className="font-semibold text-gray-800">Halo [Nama Peserta],</p>
                <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
                  {emailBody.replace("{name}", "[Nama Peserta]")}
                </p>
                
                {/* Mock QR Code */}
                <div className="mt-6 flex flex-col items-center p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <div className="w-32 h-32 bg-white border border-gray-200 flex items-center justify-center p-2 mb-2">
                    <div className="w-full h-full bg-[url('https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=example')] bg-contain bg-no-repeat bg-center opacity-50" />
                  </div>
                  <p className="text-xs font-mono text-gray-500">TICKET-123456</p>
                </div>
                
                <div className="pt-4 flex justify-center">
                  <div className="px-6 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md opacity-90" style={{ backgroundColor: "var(--brand-primary)" }}>
                    Lihat Tiket
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 p-3 text-center text-xs text-gray-400 border-t border-gray-100">
                Email ini dikirim secara otomatis oleh sistem.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
