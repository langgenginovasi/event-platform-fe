"use client";

import { useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import {
  Mail,
  QrCode,
  Users,
  Activity,
  Send,
  Loader2,
  CheckCircle2,
  XCircle,
  Database,
  Server,
  Shield,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GlassCard } from "@/components/shared/CustomCards";
import { api } from "@/lib/api";
import { extractApiError } from "@/lib/utils";
import {
  GET_EVENT_GROUPS,
  GET_PARTICIPANTS,
  GET_MEMBERSHIP_TYPES,
  GET_PARTICIPATION_TYPES,
} from "@/lib/api-endpoints";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface HealthCheckResult {
  name: string;
  status: "loading" | "success" | "error";
  message: string;
  latency?: number;
}

export default function TestingPage() {
  // ── State ──────────────────────────────────────────────────────────
  const [healthResults, setHealthResults] = useState<HealthCheckResult[]>([]);
  const [isHealthChecking, setIsHealthChecking] = useState(false);

  const [testEmail, setTestEmail] = useState("");
  const [testEmailSubject, setTestEmailSubject] = useState("Uji Sistem Event Platform");
  const [testEmailBody, setTestEmailBody] = useState("Ini adalah email uji dari sistem Event Platform.\n\nJika Anda menerima email ini, berarti konfigurasi SMTP sudah benar.");
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const [bulkTestCount, setBulkTestCount] = useState(5);
  const [isBulkCreating, setIsBulkCreating] = useState(false);
  const [bulkResults, setBulkResults] = useState<{ success: number; failed: number } | null>(null);

  const [selectedEventGroupId, setSelectedEventGroupId] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  // ── Fetch data for dropdowns ─────────────────────────────────────
  const { data: eventGroupsRes } = useSWR<{ data: any[] }>(GET_EVENT_GROUPS(1, 100, ""));
  const eventGroups = eventGroupsRes?.data || [];

  const { data: participantsRes, isLoading: participantsLoading } = useSWR<{ data: any[]; meta?: any }>(GET_PARTICIPANTS(1, 1));
  const totalParticipants = participantsRes?.meta?.total ?? 0;

  const { data: membershipTypesRes } = useSWR<{ data: any[] }>(GET_MEMBERSHIP_TYPES());
  const totalMembershipTypes = membershipTypesRes?.data?.length ?? 0;

  const { data: participationTypesRes } = useSWR<{ data: any[] }>(GET_PARTICIPATION_TYPES());
  const totalParticipationTypes = participationTypesRes?.data?.length ?? 0;

  // ── Health Check ──────────────────────────────────────────────────
  const runHealthCheck = async () => {
    setIsHealthChecking(true);
    const checks: HealthCheckResult[] = [
      { name: "Koneksi API", status: "loading", message: "Memeriksa..." },
      { name: "Database", status: "loading", message: "Memeriksa..." },
      { name: "Autentikasi", status: "loading", message: "Memeriksa..." },
      { name: "Data Master", status: "loading", message: "Memeriksa..." },
    ];
    setHealthResults(checks);

    // Check API Connection
    const start1 = Date.now();
    try {
      await api.get("/event-groups?limit=1");
      checks[0] = {
        name: "Koneksi API",
        status: "success",
        message: "API terhubung",
        latency: Date.now() - start1,
      };
    } catch {
      checks[0] = {
        name: "Koneksi API",
        status: "error",
        message: "Gagal terhubung ke API",
        latency: Date.now() - start1,
      };
    }
    setHealthResults([...checks]);

    // Check Database
    const start2 = Date.now();
    try {
      await api.get("/users");
      checks[1] = {
        name: "Database",
        status: "success",
        message: "Database dapat diakses",
        latency: Date.now() - start2,
      };
    } catch {
      checks[1] = {
        name: "Database",
        status: "error",
        message: "Database tidak dapat diakses",
        latency: Date.now() - start2,
      };
    }
    setHealthResults([...checks]);

    // Check Auth
    const start3 = Date.now();
    try {
      await api.get("/profile/me");
      checks[2] = {
        name: "Autentikasi",
        status: "success",
        message: "Autentikasi berfungsi",
        latency: Date.now() - start3,
      };
    } catch {
      checks[2] = {
        name: "Autentikasi",
        status: "error",
        message: "Autentikasi gagal",
        latency: Date.now() - start3,
      };
    }
    setHealthResults([...checks]);

    // Check Master Data
    const start4 = Date.now();
    try {
      const [mtRes, ptRes]: any = await Promise.all([
        api.get("/membership-types"),
        api.get("/participation-types"),
      ]);
      checks[3] = {
        name: "Data Master",
        status: "success",
        message: `Tipe keanggotaan: ${mtRes.data?.length ?? 0}, Tipe partisipasi: ${ptRes.data?.length ?? 0}`,
        latency: Date.now() - start4,
      };
    } catch {
      checks[3] = {
        name: "Data Master",
        status: "error",
        message: "Gagal memuat data master",
        latency: Date.now() - start4,
      };
    }
    setHealthResults([...checks]);

    setIsHealthChecking(false);
    toast.success("Pemeriksaan kesehatan sistem selesai");
  };

  // ── Test Email ────────────────────────────────────────────────────
  const handleSendTestEmail = async () => {
    if (!testEmail) {
      toast.error("Masukkan alamat email tujuan");
      return;
    }

    setIsSendingEmail(true);
    try {
      await api.post("/test/email", {
        to: testEmail,
        subject: testEmailSubject,
        body: testEmailBody,
      });
      toast.success(`Email uji berhasil dikirim ke ${testEmail}`);
    } catch (error) {
      toast.error(extractApiError(error, "Gagal mengirim email uji"));
    } finally {
      setIsSendingEmail(false);
    }
  };

  // ── Bulk Create Test Participants ─────────────────────────────────
  const handleBulkCreate = async () => {
    setIsBulkCreating(true);
    setBulkResults(null);
    let success = 0;
    let failed = 0;

    for (let i = 0; i < bulkTestCount; i++) {
      try {
        const suffix = Date.now() + i;
        await api.post("/participants", {
          name: `Peserta Uji ${i + 1}`,
          email: `test-uji-${suffix}@example.com`,
          gender: i % 2 === 0 ? "L" : "P",
          company: "Perusahaan Uji",
        });
        success++;
      } catch {
        failed++;
      }
    }

    setBulkResults({ success, failed });
    setIsBulkCreating(false);
    toast.success(`Selesai: ${success} berhasil, ${failed} gagal`);
  };

  // ── Reset Test Data ───────────────────────────────────────────────
  const handleResetTestData = async () => {
    if (!selectedEventGroupId) {
      toast.error("Pilih grup event terlebih dahulu");
      return;
    }

    setIsResetting(true);
    try {
      await api.delete(`/event-groups/${selectedEventGroupId}/test-data`);
      toast.success("Data uji berhasil direset");
      setSelectedEventGroupId("");
    } catch (error) {
      toast.error(extractApiError(error, "Gagal mereset data uji"));
    } finally {
      setIsResetting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col space-y-7 md:space-y-10 pb-20 md:pb-0">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Zap className="w-6 h-6 text-amber-500" />
          Pusat Pengujian
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Fitur pengujian khusus untuk Super Admin. Gunakan untuk memverifikasi konfigurasi sistem.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Peserta</p>
              <p className="text-lg font-bold text-gray-900">{totalParticipants}</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <Activity className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Grup Event</p>
              <p className="text-lg font-bold text-gray-900">{eventGroups.length}</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Shield className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Tipe Keanggotaan</p>
              <p className="text-lg font-bold text-gray-900">{totalMembershipTypes}</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-50 rounded-lg">
              <QrCode className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Tipe Partisipasi</p>
              <p className="text-lg font-bold text-gray-900">{totalParticipationTypes}</p>
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Health Check ────────────────────────────────────────────── */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Server className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">Pemeriksaan Sistem</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Periksa koneksi API, database, autentikasi, dan data master.
          </p>
          <Button
            onClick={runHealthCheck}
            disabled={isHealthChecking}
            className="w-full mb-4"
          >
            {isHealthChecking ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Activity className="w-4 h-4 mr-2" />
            )}
            {isHealthChecking ? "Memeriksa..." : "Jalankan Pemeriksaan"}
          </Button>

          {healthResults.length > 0 && (
            <div className="space-y-2">
              {healthResults.map((result, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100"
                >
                  <div className="flex items-center gap-2">
                    {result.status === "loading" && (
                      <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    )}
                    {result.status === "success" && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    )}
                    {result.status === "error" && (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-sm font-medium text-gray-700">{result.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {result.latency !== undefined && (
                      <span className="text-xs text-gray-400">{result.latency}ms</span>
                    )}
                    <span
                      className={`text-xs font-medium ${
                        result.status === "success"
                          ? "text-emerald-600"
                          : result.status === "error"
                          ? "text-red-600"
                          : "text-gray-400"
                      }`}
                    >
                      {result.message}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* ── Test Email ──────────────────────────────────────────────── */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">Uji Email</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Kirim email uji untuk memverifikasi konfigurasi SMTP.
          </p>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Email Tujuan</label>
              <Input
                type="email"
                placeholder="admin@perusahaan.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Subjek</label>
              <Input
                value={testEmailSubject}
                onChange={(e) => setTestEmailSubject(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Pesan</label>
              <Textarea
                value={testEmailBody}
                onChange={(e) => setTestEmailBody(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
            <Button
              onClick={handleSendTestEmail}
              disabled={isSendingEmail || !testEmail}
              className="w-full"
            >
              {isSendingEmail ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Kirim Email Uji
            </Button>
          </div>
        </GlassCard>

        {/* ── Bulk Create Test Participants ────────────────────────────── */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-bold text-gray-900">Buat Peserta Uji</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Buat beberapa peserta uji secara otomatis untuk pengujian.
          </p>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Jumlah Peserta</label>
              <Input
                type="number"
                min={1}
                max={50}
                value={bulkTestCount}
                onChange={(e) => setBulkTestCount(parseInt(e.target.value) || 5)}
              />
            </div>
            <Button
              onClick={handleBulkCreate}
              disabled={isBulkCreating}
              className="w-full"
              variant="outline"
            >
              {isBulkCreating ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Users className="w-4 h-4 mr-2" />
              )}
              {isBulkCreating ? "Membuat..." : `Buat ${bulkTestCount} Peserta Uji`}
            </Button>

            {bulkResults && (
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-100 text-sm">
                <p className="text-gray-700">
                  <span className="text-emerald-600 font-semibold">{bulkResults.success} berhasil</span>
                  {" · "}
                  <span className="text-red-600 font-semibold">{bulkResults.failed} gagal</span>
                </p>
              </div>
            )}
          </div>
        </GlassCard>

        {/* ── Reset Test Data ─────────────────────────────────────────── */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-5 h-5 text-red-600" />
            <h2 className="text-lg font-bold text-gray-900">Hapus Data Uji</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Hapus semua data uji dari grup event tertentu.
          </p>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Grup Event</label>
              <Select
                items={eventGroups.map((eg: any) => ({ value: eg.id, label: eg.name }))}
                value={selectedEventGroupId}
                onValueChange={(v) => setSelectedEventGroupId(v as string)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="-- Pilih Grup Event --" />
                </SelectTrigger>
                <SelectContent>
                  {eventGroups.map((eg: any) => (
                    <SelectItem key={eg.id} value={eg.id}>
                      {eg.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleResetTestData}
              disabled={isResetting || !selectedEventGroupId}
              className="w-full"
              variant="destructive"
            >
              {isResetting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Database className="w-4 h-4 mr-2" />
              )}
              {isResetting ? "Menghapus..." : "Hapus Data Uji"}
            </Button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
