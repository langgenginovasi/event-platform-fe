"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  Search,
  Plus,
  Import,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  ArrowUpDown,
  FileSpreadsheet,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/hooks/usePermissions";
import useSWR, { mutate } from "swr";
import * as XLSX from "xlsx";
import { toast } from "sonner";

import { GET_PARTICIPANTS } from "@/lib/api-endpoints";

interface Participant {
  id: string;
  name: string;
  gender: string;
  company: string;
  email: string;
}

// Interface untuk menampung pratinjau data Excel
interface ExcelPreviewData {
  name: string;
  email: string;
  gender: string;
  company: string;
}

export default function ParticipantPage() {
  const [keyword, setKeyword] = useState("");
  const { can } = usePermissions();
  const { data: session } = useSession();

  const { data: getParticipant, isLoading } = useSWR(GET_PARTICIPANTS());
  const participant: Participant[] = getParticipant?.data ?? [];

  const filteredParticipant = participant.filter((item) =>
    [item.name, item.email, item.company]
      .join(" ")
      .toLowerCase()
      .includes(keyword.toLowerCase()),
  );

  const data = {
    data: filteredParticipant,
    total: filteredParticipant.length,
    totalPage: 1,
  };

  // State untuk Modal Create Manual
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    gender: "",
    company: "",
  });
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    gender: "",
    company: "",
    api: "",
  });

  // ── STATE BARU UNTUK IMPORT EXCEL ───────────────────────────────────
  const [openImportModal, setOpenImportModal] = useState(false);
  const [excelData, setExcelData] = useState<ExcelPreviewData[]>([]);
  const [loadingImport, setLoadingImport] = useState(false);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  {
    /* ── create participant integrasi ──────────────────────────────────── */
  }
  const handleCreateParticipant = async () => {
    const newErrors = { name: "", email: "", gender: "", company: "", api: "" };
    if (!form.name.trim()) newErrors.name = "Nama wajib diisi";
    if (!form.email.trim()) newErrors.email = "Email wajib diisi";
    if (!form.gender) newErrors.gender = "Jenis kelamin wajib dipilih";
    if (!form.company.trim()) newErrors.company = "Perusahaan wajib diisi";

    setErrors(newErrors);
    if (
      newErrors.name ||
      newErrors.email ||
      newErrors.gender ||
      newErrors.company
    )
      return;

    try {
      setLoadingCreate(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/participants`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user?.accessToken}`,
          },
          body: JSON.stringify(form),
        },
      );

      const response = await res.json();
      if (!res.ok) {
        setErrors((prev) => ({
          ...prev,
          api:
            response?.error ||
            response?.message ||
            "Gagal menambahkan participant",
        }));
        return;
      }

      await mutate(GET_PARTICIPANTS());
      setForm({ name: "", email: "", gender: "", company: "" });
      setErrors({ name: "", email: "", gender: "", company: "", api: "" });
      setOpenCreateModal(false);
    } catch (error: any) {
      setErrors((prev) => ({
        ...prev,
        api: error?.message || "Terjadi kesalahan",
      }));
    } finally {
      setLoadingCreate(false);
    }
  };

  {
    /* ── Import data excel ─────────────── */
  }
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];

        const rawData = XLSX.utils.sheet_to_json(ws) as any[];

        // Pemetaan Header Excel ke State Preview (Mendukung Bahasa Indonesia & Inggris)
        const formatted = rawData.map((row) => ({
          name: row["Nama"] || row["name"] || "",
          email: row["Email"] || row["email"] || "",
          gender:
            row["Jenis Kelamin"] === "Laki-laki" ||
            row["gender"] === "L" ||
            row["Jenis Kelamin"] === "L"
              ? "L"
              : "P",
          company: row["Perusahaan"] || row["company"] || "",
        }));

        if (formatted.length === 0) {
          toast.warning("File Excel terbaca namun tidak ada data di dalamnya.");
          return;
        }

        setExcelData(formatted);
        toast.info(
          `Berhasil memuat ${formatted.length} baris dari file Excel.`,
        );
      } catch (err) {
        toast.error("Gagal membaca file Excel. Pastikan formatnya benar.");
      }
    };
    reader.readAsBinaryString(file);
  };

  {
    /* ── Send Ke API ────────────────── */
  }
  const handleSaveImportedData = async () => {
    if (excelData.length === 0) {
      alert("Tidak ada data untuk disimpan.");
      return;
    }

    setLoadingImport(true);
    let successCount = 0;

    try {
      for (const item of excelData) {
        if (!item.name || !item.email) continue;

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/participants`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session?.user?.accessToken}`,
            },
            body: JSON.stringify(item),
          },
        );

        if (res.ok) successCount++;
      }

      alert(`Berhasil menyimpan ${successCount} data peserta ke database.`);
      await mutate(GET_PARTICIPANTS()); // Refresh tabel utama
      handleCloseImportModal();
    } catch (error) {
      alert("Terjadi kesalahan saat mengunggah data.");
    } finally {
      setLoadingImport(false);
    }
  };

  // Bersihkan state saat modal di-close
  const handleCloseImportModal = () => {
    setOpenImportModal(false);
    setExcelData([]);
    setFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="flex flex-col space-y-7 md:space-y-10 pb-20 md:pb-0">
      {/* ── Filters + Summary Cards ──────────────────────────────────── */}
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-3 sm:space-x-4 sm:flex-row sm:space-y-0">
          <Card className="w-full sm:w-1/3 lg:w-1/4 border-l-4 border-l-[var(--brand-primary)] shadow-sm">
            <CardContent className="p-4 sm:p-5">
              <p className="font-semibold text-gray-500 text-sm">
                Total Peserta Master
              </p>
              <h3
                className="text-xl sm:text-2xl font-bold mt-1"
                style={{ color: "var(--brand-primary)" }}
              >
                {data?.total || 0}
              </h3>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Sort + Table ─────────────────────────────────────────────── */}
      <div className="card-base card-border-primary overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-white flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2
            className="text-lg font-bold"
            style={{ color: "var(--brand-primary)" }}
          >
            Daftar Participant
          </h2>

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

            {can("participantCreate") && (
              <Button
                onClick={() => setOpenCreateModal(true)}
                className="whitespace-nowrap w-full sm:w-auto"
                style={{ backgroundColor: "var(--brand-primary)" }}
              >
                <Plus className="w-4 h-4 mr-1" />
                Tambah Peserta
              </Button>
            )}

            {/* Tombol Import memicu Modal Pop-up */}
            <Button
              variant="outline"
              onClick={() => setOpenImportModal(true)}
              className="whitespace-nowrap w-full sm:w-auto text-green-700 border-green-300 hover:bg-green-50"
            >
              <Import className="w-4 h-4 mr-1" />
              Import Excel
            </Button>
          </div>
        </div>

        {/* Data Table Utama */}
        <div className="relative overflow-x-auto">
          <table className="table-base w-full border-none">
            <thead className="table-header bg-gray-50/50">
              <tr>
                <th className="px-5 py-4 w-12 border-b">
                  <Checkbox />
                </th>
                <th className="px-5 py-4 whitespace-nowrap text-xs uppercase tracking-wider text-gray-500 font-semibold border-b">
                  Nama
                </th>
                <th className="px-5 py-4 whitespace-nowrap text-xs uppercase tracking-wider text-gray-500 font-semibold border-b">
                  Jenis Kelamin
                </th>
                <th className="px-5 py-4 whitespace-nowrap text-xs uppercase tracking-wider text-gray-500 font-semibold border-b">
                  Perusahaan
                </th>
                <th className="px-5 py-4 whitespace-nowrap text-xs uppercase tracking-wider text-gray-500 font-semibold border-b">
                  Email
                </th>
                <th className="px-5 py-4 whitespace-nowrap text-xs uppercase tracking-wider text-gray-500 font-semibold border-b text-right">
                  Opsi
                </th>
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
                data?.data?.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <Checkbox />
                    </td>
                    <td
                      className="px-5 py-4 text-sm font-semibold"
                      style={{ color: "var(--brand-primary)" }}
                    >
                      {p.name}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {p.gender === "L" ? "Laki-laki" : "Perempuan"}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {p.company}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {p.email}
                    </td>
                    <td className="px-5 py-4 text-sm text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 border-gray-200"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1.5" /> Detail
                      </Button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── INTERFACES BARU: POP-UP IMPORT EXCEL + PREVIEW TABLE ────────────────── */}
      {openImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header Modal */}
            <div className="p-5 border-b flex items-center justify-between bg-gray-50">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-green-600" />
                  Import Data Peserta via Excel
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Format kolom wajib: Nama, Email, Jenis Kelamin (L/P),
                  Perusahaan
                </p>
              </div>
              <button
                onClick={handleCloseImportModal}
                className="p-1.5 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Konten Utama Modal */}
            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              {/* Slot Upload File */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50/70 transition-colors cursor-pointer relative group">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".xlsx, .xls"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center gap-2">
                  <Import className="w-8 h-8 text-gray-400 group-hover:text-green-600 transition-colors" />
                  <p className="text-sm font-medium text-gray-700">
                    {fileName
                      ? `File terpilih: ${fileName}`
                      : "Klik atau seret file Excel ke sini"}
                  </p>
                  <p className="text-xs text-gray-400">
                    Mendukung ekstensi .xlsx, .xls
                  </p>
                </div>
              </div>

              {/* Preview Tabel Data Excel */}
              {excelData.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-700">
                      Pratinjau Data ({excelData.length} Baris ditemukan):
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setExcelData([]);
                        setFileName("");
                      }}
                      className="text-red-600 hover:bg-red-50 text-xs h-8"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" /> Bersihkan
                    </Button>
                  </div>

                  <div className="border rounded-lg overflow-hidden max-h-[350px] overflow-y-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead className="bg-gray-100 text-gray-600 sticky top-0 border-b font-semibold text-xs uppercase tracking-wider">
                        <tr>
                          <th className="p-3">No</th>
                          <th className="p-3">Nama</th>
                          <th className="p-3">Jenis Kelamin</th>
                          <th className="p-3">Perusahaan</th>
                          <th className="p-3">Email</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y text-gray-700">
                        {excelData.map((row, idx) => (
                          <tr
                            key={idx}
                            className="hover:bg-gray-50/80 transition-colors"
                          >
                            <td className="p-3 text-gray-400 text-xs font-mono">
                              {idx + 1}
                            </td>
                            <td className="p-3 font-medium text-gray-900">
                              {row.name || (
                                <span className="text-red-400 italic">
                                  Kosong
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-xs">
                              {row.gender === "L" ? "Laki-laki" : "Perempuan"}
                            </td>
                            <td className="p-3">
                              {row.company || (
                                <span className="text-gray-400 italic">-</span>
                              )}
                            </td>
                            <td className="p-3 text-xs">
                              {row.email || (
                                <span className="text-red-400 italic">
                                  Kosong
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Modal Action */}
            <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={handleCloseImportModal}
                disabled={loadingImport}
              >
                Batal
              </Button>
              <Button
                onClick={handleSaveImportedData}
                disabled={loadingImport || excelData.length === 0}
                className="text-white"
                style={{ backgroundColor: "var(--brand-primary)" }}
              >
                {loadingImport ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Menyimpan ({excelData.length} data)...
                  </>
                ) : (
                  "Konfirmasi & Simpan Ke Database"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Create Manual Anda tetap berada utuh di sini */}
      {openCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h2 className="text-lg font-bold mb-4">Tambah Participant</h2>
            {/* ... form fields seperti kode awal Anda ... */}
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setOpenCreateModal(false)}
                className="px-4 py-2 text-gray-600 rounded"
              >
                Batal
              </button>
              <button
                onClick={handleCreateParticipant}
                className="px-4 py-2 text-white rounded"
                style={{ backgroundColor: "var(--brand-primary)" }}
              >
                {loadingCreate ? "Memproses..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
