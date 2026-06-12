"use client";

import { useState, useRef, useEffect } from "react";
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
import { CardContent } from "@/components/ui/card";
import { AnalyticCard, TableCard } from "@/components/dashboard/CustomCards";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/hooks/usePermissions";
import useSWR, { mutate } from "swr";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { PaginationFooter } from "@/components/dashboard/PaginationFooter";

import { GET_PARTICIPANTS, GET_EVENT_GROUPS, GET_PARTICIPANT_HISTORY } from "@/lib/api-endpoints";
import { api } from "@/lib/api";

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
  const [currentPage, setCurrentPage] = useState(1);
  const { can } = usePermissions();
  const { data: session } = useSession();

  const { data: getParticipant, isLoading, mutate: refreshList } = useSWR(
    GET_PARTICIPANTS(currentPage, 10, keyword)
  );
  
  const participant: Participant[] = getParticipant?.data ?? [];
  const meta = getParticipant?.meta;

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

  // ── STATE UNTUK BULK SELECTION ────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // ── STATE UNTUK TAMBAH KE EVENT GROUP ──────────────────────────────
  const [openEventGroupModal, setOpenEventGroupModal] = useState(false);
  const [selectedEventGroupId, setSelectedEventGroupId] = useState("");
  const [loadingAddToGroup, setLoadingAddToGroup] = useState(false);

  // Fetch Event Groups for the modal dropdown
  const { data: eventGroupsRes } = useSWR<{ data: any[] }>(
    openEventGroupModal ? GET_EVENT_GROUPS(1, 100, "") : null
  );
  const eventGroups = eventGroupsRes?.data || [];

  // ── STATE UNTUK DETAIL MODAL ───────────────────────────────────────
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);

  const { data: detailRes, isLoading: isLoadingDetail } = useSWR<{ data: any }>(
    isDetailModalOpen && selectedParticipantId ? GET_PARTICIPANT_HISTORY(selectedParticipantId) : null
  );
  const participantDetail = detailRes?.data;

  // Reset selection when page/keyword changes
  useEffect(() => {
    setSelectedIds([]);
  }, [currentPage, keyword]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(participant.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleAddToEventGroup = async () => {
    if (!selectedEventGroupId) {
      toast.error("Silakan pilih Event Group terlebih dahulu");
      return;
    }

    setLoadingAddToGroup(true);
    let successCount = 0;

    try {
      for (const id of selectedIds) {
        const payload = {
          event_group_id: selectedEventGroupId,
          participant_id: id,
        };
        try {
          await api.post("/registrations", payload);
          successCount++;
        } catch (e: any) {
          // Abaikan jika sudah terdaftar
        }
      }

      if (successCount > 0) {
        toast.success(`Berhasil menambahkan ${successCount} peserta ke Event Group.`);
      } else {
        toast.error("Semua peserta yang dipilih mungkin sudah terdaftar di Event Group tersebut.");
      }
      
      setOpenEventGroupModal(false);
      setSelectedIds([]);
      setSelectedEventGroupId("");
    } catch (error) {
      toast.error("Terjadi kesalahan sistem saat menambahkan peserta.");
    } finally {
      setLoadingAddToGroup(false);
    }
  };

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

      await refreshList();
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
      await refreshList(); // Refresh tabel utama
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
          <AnalyticCard className="w-full sm:w-1/3 lg:w-1/4 shadow-sm">
            <CardContent className="p-4 sm:p-5">
              <p className="font-semibold text-gray-500 text-sm">
                Total Peserta Master
              </p>
              <h3
                className="text-xl sm:text-2xl font-bold mt-1"
                style={{ color: "var(--brand-primary)" }}
              >
                {meta?.total || 0}
              </h3>
            </CardContent>
          </AnalyticCard>
        </div>
      </div>

      {/* ── Sort + Table ─────────────────────────────────────────────── */}
      <TableCard>
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
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Cari peserta..."
                className="pl-9 bg-slate-50 focus-visible:ring-primary h-10 w-full"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>

            {can("participantCreate") && (
              <Button
                onClick={() => setOpenCreateModal(true)}
                className="whitespace-nowrap w-full sm:w-auto"
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

        {/* Bulk Action Bar */}
        {selectedIds.length > 0 && (
          <div className="bg-blue-50/50 border-b border-blue-100 px-5 py-3 flex items-center justify-between animate-in slide-in-from-top-2">
            <span className="text-sm font-medium text-blue-800">
              {selectedIds.length} peserta dipilih
            </span>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                onClick={() => setOpenEventGroupModal(true)}
              >
                Tambahkan ke Event Group
              </Button>
              <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                Hapus
              </Button>
            </div>
          </div>
        )}

        {/* Data Table Utama */}
        <div className="relative overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-12 text-center">
                  <Checkbox 
                    checked={!!(participant.length > 0 && selectedIds.length === participant.length)}
                    onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                  />
                </TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Jenis Kelamin</TableHead>
                <TableHead>Perusahaan</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Opsi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              )}

              {!isLoading &&
                participant.map((p) => {
                  const isSelected = selectedIds.includes(p.id);
                  return (
                    <TableRow 
                      key={p.id}
                      className={cn(isSelected && "bg-blue-50/50 hover:bg-blue-50/70")}
                    >
                      <TableCell className="text-center">
                        <Checkbox 
                          checked={isSelected}
                          onCheckedChange={(checked) => handleSelectOne(p.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell className="font-semibold" style={{ color: "var(--brand-primary)" }}>
                        {p.name}
                      </TableCell>
                    <TableCell className="text-muted-foreground">
                      {p.gender === "L" ? "Laki-laki" : "Perempuan"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {p.company}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {p.email}
                    </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedParticipantId(p.id);
                            setIsDetailModalOpen(true);
                          }}
                        >
                          <Eye className="w-3.5 h-3.5 mr-1.5" /> Detail
                        </Button>
                      </TableCell>
                  </TableRow>
                )})}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination */}
        <PaginationFooter
          currentPage={currentPage}
          totalPage={meta?.total_pages || 1}
          totalData={meta?.total || 0}
          onPrev={() => setCurrentPage((p) => Math.max(1, p - 1))}
          onNext={() => setCurrentPage((p) => Math.min(meta?.total_pages || 1, p + 1))}
          onPageChange={(p) => setCurrentPage(p)}
        />
      </TableCard>

      {/* ── INTERFACES BARU: POP-UP IMPORT EXCEL + PREVIEW TABLE ────────────────── */}
      <Dialog open={openImportModal} onOpenChange={setOpenImportModal}>
        <DialogContent className="sm:max-w-3xl max-h-[85vh] flex flex-col p-0">
          {/* Header Modal */}
          <DialogHeader className="p-5 border-b flex flex-row items-center justify-between bg-slate-50">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-green-600" />
                Import Data Peserta via Excel
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Format kolom wajib: Nama, Email, Jenis Kelamin (L/P), Perusahaan
              </p>
            </div>
          </DialogHeader>

          {/* Konten Utama Modal */}
          <div className="p-6 flex-1 overflow-y-auto space-y-6">
            {/* Slot Upload File */}
            <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer relative group">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".xlsx, .xls"
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center gap-2">
                <Import className="w-8 h-8 text-muted-foreground group-hover:text-green-600 transition-colors" />
                <p className="text-sm font-medium text-foreground">
                  {fileName ? `File terpilih: ${fileName}` : "Klik atau seret file Excel ke sini"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Mendukung ekstensi .xlsx, .xls
                </p>
              </div>
            </div>

            {/* Preview Tabel Data Excel */}
            {excelData.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-foreground">
                    Pratinjau Data ({excelData.length} Baris ditemukan):
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setExcelData([]);
                      setFileName("");
                    }}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Bersihkan
                  </Button>
                </div>

                <div className="border rounded-xl overflow-hidden max-h-[350px] overflow-y-auto">
                  <Table>
                    <TableHeader className="bg-slate-50 sticky top-0">
                      <TableRow>
                        <TableHead>No</TableHead>
                        <TableHead>Nama</TableHead>
                        <TableHead>Jenis Kelamin</TableHead>
                        <TableHead>Perusahaan</TableHead>
                        <TableHead>Email</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {excelData.map((row, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="text-muted-foreground font-mono text-xs">{idx + 1}</TableCell>
                          <TableCell className="font-medium text-foreground">
                            {row.name || <span className="text-destructive italic">Kosong</span>}
                          </TableCell>
                          <TableCell>{row.gender === "L" ? "Laki-laki" : "Perempuan"}</TableCell>
                          <TableCell>{row.company || <span className="text-muted-foreground italic">-</span>}</TableCell>
                          <TableCell>{row.email || <span className="text-destructive italic">Kosong</span>}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>

          {/* Footer Modal Action */}
          <DialogFooter className="p-4 border-t bg-slate-50">
            <Button variant="outline" onClick={handleCloseImportModal} disabled={loadingImport}>
              Batal
            </Button>
            <Button onClick={handleSaveImportedData} disabled={loadingImport || excelData.length === 0}>
              {loadingImport ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan ({excelData.length} data)...
                </>
              ) : (
                "Konfirmasi & Simpan Ke Database"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Create Manual */}
      <Dialog open={openCreateModal} onOpenChange={setOpenCreateModal}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle>Tambah Participant</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Nama</label>
              <input
                type="text"
                className="w-full border rounded-xl h-10 px-3"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Email</label>
              <input
                type="email"
                className="w-full border rounded-xl h-10 px-3"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Jenis Kelamin</label>
              <select
                className="w-full border rounded-xl h-10 px-3"
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
              >
                <option value="">Pilih Gender</option>
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
              {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Perusahaan</label>
              <input
                type="text"
                className="w-full border rounded-xl h-10 px-3"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
              />
              {errors.company && <p className="text-red-500 text-xs mt-1">{errors.company}</p>}
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setOpenCreateModal(false)}>
              Batal
            </Button>
            <Button onClick={handleCreateParticipant}>
              {loadingCreate ? "Memproses..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Tambahkan ke Event Group */}
      <Dialog open={openEventGroupModal} onOpenChange={setOpenEventGroupModal}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle>Tambahkan ke Event Group</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col space-y-4">
            <p className="text-sm text-gray-500">
              Pilih Event Group untuk mendaftarkan {selectedIds.length} peserta yang dipilih.
            </p>
            <div>
              <label className="text-sm font-medium mb-1 block">Event Group</label>
              <select
                className="w-full border rounded-xl h-10 px-3"
                value={selectedEventGroupId}
                onChange={(e) => setSelectedEventGroupId(e.target.value)}
              >
                <option value="">-- Pilih Event Group --</option>
                {eventGroups.map((eg: any) => (
                  <option key={eg.id} value={eg.id}>
                    {eg.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setOpenEventGroupModal(false)} disabled={loadingAddToGroup}>
              Batal
            </Button>
            <Button onClick={handleAddToEventGroup} disabled={loadingAddToGroup || !selectedEventGroupId}>
              {loadingAddToGroup ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Detail Participant */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col p-0">
          <DialogHeader className="p-6 border-b pb-4">
            <DialogTitle>Detail Peserta & Riwayat Kehadiran</DialogTitle>
          </DialogHeader>
          <div className="p-6 overflow-y-auto space-y-6">
            {isLoadingDetail ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : participantDetail ? (
              <>
                {/* Informasi Profil */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div>
                    <p className="text-sm text-muted-foreground">Nama Peserta</p>
                    <p className="font-semibold text-foreground">{participantDetail.participant?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-semibold text-foreground">{participantDetail.participant?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Perusahaan</p>
                    <p className="font-medium text-foreground">{participantDetail.participant?.company}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Jenis Kelamin</p>
                    <p className="font-medium text-foreground">
                      {participantDetail.participant?.gender === "L" ? "Laki-laki" : "Perempuan"}
                    </p>
                  </div>
                </div>

                {/* Riwayat Event Group & Kehadiran */}
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-4" style={{ color: "var(--brand-primary)" }}>Riwayat Event</h3>
                  {participantDetail.history && participantDetail.history.length > 0 ? (
                    <div className="space-y-4">
                      {participantDetail.history.map((reg: any, idx: number) => (
                        <div key={idx} className="border rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-bold text-md">{reg.event_group?.name}</h4>
                              <p className="text-xs text-muted-foreground">Tiket ID: {reg.qr_code}</p>
                            </div>
                            <span className={cn(
                              "text-xs px-2 py-1 rounded-full font-semibold",
                              reg.status === "REGISTERED" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
                            )}>
                              {reg.status}
                            </span>
                          </div>

                          {/* Sub Events / Attendances */}
                          {reg.events_attended && reg.events_attended.length > 0 ? (
                            <div className="space-y-2 mt-4">
                              <p className="text-sm font-semibold text-gray-600 border-b pb-1">Sub-Event yang diikuti:</p>
                              {reg.events_attended.map((eventAtt: any, eIdx: number) => (
                                <div key={eIdx} className="bg-slate-50 p-3 rounded-lg flex flex-col md:flex-row md:items-center justify-between text-sm">
                                  <div className="font-medium text-foreground mb-2 md:mb-0">
                                    {eventAtt.event?.name}
                                  </div>
                                  <div className="flex gap-4">
                                    <div>
                                      <span className="text-xs text-muted-foreground block">Check In</span>
                                      <span className="font-mono">{eventAtt.checkin_at ? new Date(eventAtt.checkin_at).toLocaleTimeString("id-ID") : "-"}</span>
                                    </div>
                                    <div>
                                      <span className="text-xs text-muted-foreground block">Check Out</span>
                                      <span className="font-mono">{eventAtt.checkout_at ? new Date(eventAtt.checkout_at).toLocaleTimeString("id-ID") : "-"}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground mt-2 italic">Belum ada data kehadiran (check-in/out).</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Peserta ini belum mengikuti event apapun.</p>
                  )}
                </div>
              </>
            ) : (
              <p className="text-sm text-center text-muted-foreground">Gagal memuat detail peserta.</p>
            )}
          </div>
          <DialogFooter className="p-4 border-t bg-slate-50">
            <Button onClick={() => setIsDetailModalOpen(false)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
