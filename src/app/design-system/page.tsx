"use client";

import { useState } from "react";
import {
  Calendar,
  Users,
  ScanLine,
  TrendingUp,
  Search,
  Plus,
  Eye,
  Mail,
  Loader2,
  Trash2,
  Settings,
  ChevronRight,
  Check,
  AlertTriangle,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  GlassCard,
  TableCard,
  ContentCard,
  ContentCardHeader,
  ContentCardBody,
  AccentCard,
  PageHeader,
  StatGrid,
} from "@/components/shared/CustomCards";
import { StatCard } from "@/components/shared/StatCard";
import { ScanCard, ScanStep } from "@/components/shared/ScanCard";
import { TableToolbar } from "@/components/shared/TableToolbar";
import { PaginationFooter } from "@/components/shared/PaginationFooter";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="pt-8 pb-4 border-b border-gray-200">
      <h2 className="text-2xl font-extrabold" style={{ color: "var(--brand-primary)" }}>
        {children}
      </h2>
    </div>
  );
}

function ComponentLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide", className)}>
      {children}
    </p>
  );
}

export default function DesignSystemPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-extrabold" style={{ color: "var(--brand-primary)" }}>
          Design System
        </h1>
        <p className="text-gray-500 mt-2">
          Referensi komponen UI untuk Synapse Event Platform. Halaman ini tidak
          termasuk dalam navigasi utama.
        </p>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 1. BRAND COLORS */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section>
        <SectionTitle>Brand Colors</SectionTitle>
        <ComponentLabel>CSS Variables</ComponentLabel>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { name: "Primary", var: "--brand-primary", hex: "#0F1E36" },
            { name: "Secondary", var: "--brand-secondary", hex: "#4A607A" },
            { name: "Mid", var: "--brand-mid", hex: "#2c4463" },
            { name: "Light", var: "--brand-light", hex: "#F8F9FA" },
          ].map((c) => (
            <div key={c.name} className="rounded-xl border border-gray-200 overflow-hidden">
              <div className="h-20" style={{ backgroundColor: `var(${c.var})` }} />
              <div className="p-3">
                <p className="font-bold text-sm">{c.name}</p>
                <p className="text-xs text-gray-400 font-mono">{c.hex}</p>
                <p className="text-xs text-gray-400 font-mono">{c.var}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 2. TYPOGRAPHY */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section>
        <SectionTitle>Typography</SectionTitle>
        <div className="space-y-3">
          <p className="text-4xl font-extrabold" style={{ color: "var(--brand-primary)" }}>
            Heading 1 — Extra Bold
          </p>
          <p className="text-2xl font-bold" style={{ color: "var(--brand-primary)" }}>
            Heading 2 — Bold
          </p>
          <p className="text-lg font-bold" style={{ color: "var(--brand-primary)" }}>
            Heading 3 — Section Title
          </p>
          <p className="text-base font-semibold text-foreground">
            Body — Semibold (label, nama)
          </p>
          <p className="text-sm text-gray-500">
            Small — Muted text (deskripsi, sub-label)
          </p>
          <p className="text-xs text-gray-400 font-mono">
            Mono — Code, QR Ticket ID
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 3. BUTTONS */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section>
        <SectionTitle>Buttons</SectionTitle>

        <ComponentLabel>Variants</ComponentLabel>
        <div className="flex flex-wrap gap-3 mb-6">
          <Button>
            <Plus className="w-4 h-4 mr-1.5" /> Primary
          </Button>
          <Button variant="outline">
            <Eye className="w-4 h-4 mr-1.5" /> Outline
          </Button>
          <Button variant="destructive">
            <Trash2 className="w-4 h-4 mr-1.5" /> Destructive
          </Button>
          <Button variant="ghost">
            <Info className="w-4 h-4 mr-1.5" /> Ghost
          </Button>
          <Button variant="secondary">
            <Mail className="w-4 h-4 mr-1.5" /> Secondary
          </Button>
        </div>

        <ComponentLabel>Sizes</ComponentLabel>
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <Button size="sm">Small</Button>
          <Button>Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <ComponentLabel>Colored Outline (Action Buttons)</ComponentLabel>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" size="sm" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50">
            <Check className="w-3.5 h-3.5 mr-1.5" /> Check In
          </Button>
          <Button variant="outline" size="sm" className="text-amber-600 border-amber-200 hover:bg-amber-50">
            <AlertTriangle className="w-3.5 h-3.5 mr-1.5" /> Check Out
          </Button>
          <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50">
            <Mail className="w-3.5 h-3.5 mr-1.5" /> Email
          </Button>
          <Button variant="outline" size="sm" className="text-destructive border-destructive/20 hover:bg-destructive/10">
            <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Hapus
          </Button>
        </div>

        <ComponentLabel>Disabled</ComponentLabel>
        <div className="flex flex-wrap gap-3">
          <Button disabled>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading...
          </Button>
          <Button variant="outline" disabled>Disabled Outline</Button>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 4. FORM CONTROLS */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section>
        <SectionTitle>Form Controls</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Input — Text</label>
            <Input placeholder="Masukkan teks..." />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Input — With Icon</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input placeholder="Cari data..." className="pl-9" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Input — Error</label>
            <Input className="border-red-500" placeholder="Field error" />
            <p className="text-xs text-red-500">Field ini wajib diisi</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Input — Disabled</label>
            <Input disabled value="Read only value" className="bg-gray-100 text-gray-500" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Textarea</label>
            <Textarea placeholder="Tulis pesan..." rows={3} className="resize-none" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Select</label>
            <Select
              items={[
                { value: "opt1", label: "Opsi 1" },
                { value: "opt2", label: "Opsi 2" },
                { value: "opt3", label: "Opsi 3" },
              ]}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih opsi..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="opt1">Opsi 1</SelectItem>
                <SelectItem value="opt2">Opsi 2</SelectItem>
                <SelectItem value="opt3">Opsi 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Checkbox</label>
            <div className="flex items-center space-x-2">
              <Checkbox id="check1" />
              <label htmlFor="check1" className="text-sm">Option A</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="check2" checked />
              <label htmlFor="check2" className="text-sm">Option B (checked)</label>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 5. CARDS */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section>
        <SectionTitle>Cards</SectionTitle>

        <ComponentLabel>GlassCard — Base wrapper</ComponentLabel>
        <GlassCard className="p-6">
          <p className="text-sm text-gray-600">
            GlassCard adalah base wrapper dengan estetika glassmorphism — background putih semi-transparan dengan backdrop blur.
          </p>
        </GlassCard>

        <ComponentLabel className="mt-6">StatCard — Stat/Angka (dengan icon)</ComponentLabel>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="Total Event" value={12} icon={Calendar} />
          <StatCard
            title="Total Peserta"
            value={458}
            icon={Users}
            borderLeftColorClass="border-l-amber-500"
            valueColorClass="text-amber-600"
            iconBg="rgba(245, 158, 11, 0.1)"
          />
          <StatCard
            title="Check-in"
            value={312}
            icon={TrendingUp}
            borderLeftColorClass="border-l-emerald-500"
            valueColorClass="text-emerald-600"
            iconBg="rgba(16, 185, 129, 0.1)"
          />
        </div>

        <ComponentLabel className="mt-6">StatCard — Tanpa icon</ComponentLabel>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="Stat Default" value={42} />
          <StatCard title="Stat Hijau" value="89%" borderLeftColorClass="border-l-emerald-500" valueColorClass="text-emerald-600" />
          <StatCard title="Stat Merah" value={7} borderLeftColorClass="border-l-rose-500" valueColorClass="text-rose-600" />
        </div>

        <ComponentLabel className="mt-6">TableCard — Table wrapper</ComponentLabel>
        <TableCard>
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-semibold">Event A</TableCell>
                <TableCell>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">Aktif</span>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm"><Eye className="w-3.5 h-3.5 mr-1.5" /> Lihat</Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">Event B</TableCell>
                <TableCell>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">Mendatang</span>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm"><Eye className="w-3.5 h-3.5 mr-1.5" /> Lihat</Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableCard>

        <ComponentLabel className="mt-6">ContentCard — Generic content</ComponentLabel>
        <ContentCard>
          <ContentCardHeader icon={Settings} title="Pengaturan" />
          <ContentCardBody>
            <p className="text-sm text-gray-600">Content card digunakan untuk konten statis seperti form pengaturan, chart, atau panel informasi.</p>
          </ContentCardBody>
        </ContentCard>

        <ComponentLabel className="mt-6">AccentCard — Dark CTA card</ComponentLabel>
        <AccentCard className="p-6">
          <h3 className="text-base font-bold mb-1">Unduh Laporan</h3>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
            Rekapitulasi kehadiran harian untuk semua event yang berjalan.
          </p>
          <button
            className="mt-4 w-full py-2.5 rounded-md text-sm font-semibold transition-colors"
            style={{
              backgroundColor: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "#fff",
            }}
          >
            Download CSV
          </button>
        </AccentCard>

        <ComponentLabel className="mt-6">ScanCard + ScanStep — Multi-step workflow</ComponentLabel>
        <ScanCard>
          <ScanStep step={1} title="Pilih Event">
            <div className="p-3 bg-gray-50 rounded-xl text-sm text-gray-500">
              Konten step 1 — misalnya select dropdown
            </div>
          </ScanStep>
          <ScanStep step={2} title="Pilih Tipe Absensi" active>
            <div className="grid grid-cols-2 gap-3">
              <div className="h-14 border-2 border-emerald-500 bg-emerald-50/80 text-emerald-700 rounded-xl flex items-center justify-center text-sm font-semibold">
                Check In
              </div>
              <div className="h-14 border-2 border-gray-200 bg-white/50 text-gray-600 rounded-xl flex items-center justify-center text-sm font-semibold">
                Check Out
              </div>
            </div>
          </ScanStep>
          <ScanStep step={3} title="Mulai Scan" active={false}>
            <div className="p-3 bg-gray-50 rounded-xl text-sm text-gray-400">
              Disabled — menunggu step sebelumnya
            </div>
          </ScanStep>
        </ScanCard>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 6. TABLE TOOLBAR & PAGINATION */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section>
        <SectionTitle>Table Toolbar & Pagination</SectionTitle>
        <TableCard>
          <TableToolbar
            title="Contoh Toolbar"
            keyword=""
            setKeyword={() => {}}
            searchPlaceholder="Cari data..."
            actionButton={
              <Button>
                <Plus className="w-4 h-4 mr-1" /> Tambah
              </Button>
            }
          />
          <div className="p-6 text-center text-gray-400 text-sm">
            Konten tabel di sini...
          </div>
          <PaginationFooter currentPage={2} totalPage={5} totalData={48} />
        </TableCard>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 7. DIALOGS */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section>
        <SectionTitle>Dialogs</SectionTitle>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => setDialogOpen(true)}>Buka Dialog</Button>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Contoh Dialog</DialogTitle>
              <DialogDescription>
                Ini adalah contoh dialog dengan konten form atau informasi.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nama</label>
                <Input placeholder="Masukkan nama..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input type="email" placeholder="email@contoh.com" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
              <Button onClick={() => { toast.success("Berhasil!"); setDialogOpen(false); }}>Simpan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 8. TOAST */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section>
        <SectionTitle>Toast Notifications</SectionTitle>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => toast.success("Data berhasil disimpan!")}>
            Success
          </Button>
          <Button variant="outline" onClick={() => toast.error("Terjadi kesalahan!")}>
            Error
          </Button>
          <Button variant="outline" onClick={() => toast.warning("Perhatian!")}>
            Warning
          </Button>
          <Button variant="outline" onClick={() => toast.info("Informasi tambahan")}>
            Info
          </Button>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 9. BADGES / STATUS */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section>
        <SectionTitle>Badges & Status</SectionTitle>
        <div className="flex flex-wrap gap-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
            Aktif
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            Mendatang
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Pending
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            Dibatalkan
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200">
            Selesai
          </span>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 10. LAYOUT PATTERNS */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section>
        <SectionTitle>Layout Patterns</SectionTitle>

        <ComponentLabel>PageHeader + StatGrid</ComponentLabel>
        <PageHeader>
          <StatCard title="Total Registrasi" value={128} />
          <StatCard title="Total Hadir" value={85} borderLeftColorClass="border-l-emerald-500" valueColorClass="text-emerald-600" />
          <StatCard title="Belum Hadir" value={43} borderLeftColorClass="border-l-rose-500" valueColorClass="text-rose-600" />
        </PageHeader>

        <ComponentLabel className="mt-6">Responsive Grid — Quick Actions</ComponentLabel>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 border rounded-xl bg-gray-50/50">
          <Button className="w-full justify-start h-12">
            <ScanLine className="mr-2 h-5 w-5" /> Buka Scanner
          </Button>
          <Button className="w-full justify-start h-12" variant="outline">
            <Users className="mr-2 h-5 w-5" /> Kelola Registrasi
          </Button>
          <Button className="w-full justify-start h-12" variant="outline">
            <Calendar className="mr-2 h-5 w-5" /> Kelola Event
          </Button>
          <Button className="w-full justify-start h-12" variant="outline">
            <TrendingUp className="mr-2 h-5 w-5" /> Lihat Laporan
          </Button>
        </div>

        <ComponentLabel className="mt-6">Bulk Action Bar</ComponentLabel>
        <div className="bg-blue-50/50 border border-blue-100 rounded-xl px-5 py-3 flex items-center justify-between">
          <span className="text-sm font-medium text-blue-800">3 peserta dipilih</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200">Check In</Button>
            <Button size="sm" variant="outline" className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 border-amber-200">Check Out</Button>
            <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">Hapus</Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="pt-8 border-t border-gray-200 text-center text-sm text-gray-400">
        Synapse Event Platform — Design System v1.0
      </div>
    </div>
  );
}
