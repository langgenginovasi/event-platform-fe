# Design System — Synapse Event Platform

**Version:** 1.2  
**Last Updated:** 28 July 2026  
**Live Preview:** `/design-system` (accessible without authentication)

---

## Overview

Design system ini mendokumentasikan semua komponen UI yang digunakan di dalam
Synapse Event Platform. Terdiri dari dua lapisan:

1. **Shadcn UI Components** — komponen dasar dari shadcn/ui (button, input, dialog, dll)
2. **Shared Dashboard Components** — komponen kustom yang dibangun di atas shadcn (card wrappers, stat cards, table toolbar, dll)

---

## Color Palette

### CSS Variables

| Name | Variable | Hex | Usage |
|------|----------|-----|-------|
| **Primary** | `--brand-primary` | `#0F1E36` | Logo, tombol utama, teks heading, border aksen |
| **Secondary** | `--brand-secondary` | `#4A607A` | Sub-title, border halus, muted text |
| **Mid** | `--brand-mid` | `#2c4463` | Progress bar, batas tengah |
| **Light** | `--brand-light` | `#F8F9FA` | Background aplikasi, focus ring |

### Shadcn Tokens (mapped ke brand)

| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `#F8F9FA` | Page background |
| `--foreground` | `#0F1E36` | Teks utama |
| `--card` | `#ffffff` | Card background |
| `--primary` | `#0F1E36` | Tombol primer |
| `--muted` | `#F8F9FA` | Background sekunder |
| `--muted-foreground` | `#4A607A` | Teks sekunder |
| `--destructive` | `#ef4444` | Tombol hapus, error |
| `--border` | `#e2e8f0` | Border umum |
| `--input` | `#e2e8f0` | Input border |
| `--ring` | `#4A607A` | Focus ring |

### Status Colors

| Status | Background | Text | Border |
|--------|-----------|------|--------|
| Aktif | `bg-green-50` | `text-green-700` | `border-green-200` |
| Mendatang | `bg-blue-50` | `text-blue-700` | `border-blue-200` |
| Pending | `bg-amber-50` | `text-amber-700` | `border-amber-200` |
| Dibatalkan | `bg-red-50` | `text-red-700` | `border-red-200` |
| Selesai | `bg-gray-50` | `text-gray-700` | `border-gray-200` |

---

## Typography

| Name | Class | Usage |
|------|-------|-------|
| Page Title | `text-4xl font-extrabold` | Judul halaman utama |
| Section Title | `text-2xl font-extrabold` | Judul section di design system |
| Card Title | `text-lg font-bold` | Judul di dalam card |
| Body Bold | `text-base font-semibold` | Label, nama |
| Body | `text-base text-foreground` | Teks normal |
| Small | `text-sm text-gray-500` | Deskripsi, sub-label |
| Tiny | `text-xs text-gray-400` | Caption, footer |
| Mono | `text-xs font-mono text-gray-500` | QR Code ID, waktu |

### Accessibility

- Ukuran font utama: `text-sm` (14px) untuk kerapian data
- Label sub-informasi: `text-xs` (12px) atau `text-[10px]` dengan `uppercase` + `tracking-wider`
- Kontras: Teks di atas permukaan putih wajib minimal `slate-700` atau `--color-primary` (AA/AAA compliant)

---

## Glassmorphism & Micro-animations

Untuk mencapai estetika premium V2, antarmuka harus mematuhi prinsip **Glassmorphism**:

- **Backdrop Blur**: Gunakan `backdrop-blur-md` atau `backdrop-blur-lg` pada elemen melayang (Navbar, Modal, FAB) dengan latar belakang transparan.
- **Translucency**: Gunakan background dengan opasitas — `bg-white/10` untuk elemen di atas background gelap, `bg-black/20` untuk elemen di atas background terang.
- **Subtle Borders**: Garis batas tipis: `border border-white/20` (gelap) atau `border-slate-200/50` (terang).
- **Shadows**: Gunakan `shadow-xl` atau custom drop-shadow lembut, bukan bayangan hitam pekat tajam.
- **Micro-animations**: Efek interaktif saat hover/active: `transition-all duration-300 ease-in-out` + `hover:scale-[1.02]` atau perubahan warna halus.

---

## Layout Grid

Dashboard menggunakan Fixed Sidebar + Scrollable Main Content (desktop 1280px+).

| Element | Size | Notes |
|---------|------|-------|
| Sidebar Width | `w-64` (256px) | Background: `--color-primary` |
| Header Height | `h-20` (80px) | Background: `--color-surface-white`, border-b slate-100 |
| Main Content | `grid-cols-3` | `gap-6` (24px) antar elemen |

---

## Component Reference

### Shadcn UI (Base)

Lokasi: `src/components/ui/`

| Component | File | Props |
|-----------|------|-------|
| `Button` | `button.tsx` | `variant` (default/outline/destructive/ghost/secondary), `size` (sm/default/lg/icon), `disabled` |
| `Input` | `input.tsx` | `type`, `placeholder`, `disabled`, `className` |
| `Textarea` | `textarea.tsx` | `rows`, `placeholder`, `resize-none` |
| `Checkbox` | `checkbox.tsx` | `checked`, `onCheckedChange` |
| `Card` | `card.tsx` | Base card container |
| `DialogContent` | `dialog.tsx` | `className` (sm:max-w-md / sm:max-w-lg / sm:max-w-xl) |
| `Select` | `select.tsx` | `items` (required untuk label display), `defaultValue` |
| `Table` | `table.tsx` | `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` |
| `Sheet` | `sheet.tsx` | `side` (bottom/left/right), `open`, `onOpenChange` |

### Shared Components

Lokasi: `src/components/shared/`

#### `GlassCard`

Base card wrapper dengan estetika semi-transparan — background putih semi-transparan tanpa backdrop blur.

```tsx
import { GlassCard } from "@/components/shared/CustomCards";

<GlassCard className="p-6">
  <p>Konten di sini</p>
</GlassCard>
```

**Props:** Sama dengan `Card` (extends `React.ComponentProps<"div">`)

---

#### `StatCard`

Reusable stat card dengan border kiri, optional icon, dan warna value. Menggantikan `AnalyticCard` yang sudah dihapus.

```tsx
import { StatCard } from "@/components/shared/StatCard";

// Tanpa icon
<StatCard title="Total Registrasi" value={128} />

// Dengan icon
<StatCard
  title="Total Event"
  value={12}
  icon={Calendar}
/>

// Custom warna
<StatCard
  title="Total Hadir"
  value={85}
  icon={TrendingUp}
  borderLeftColorClass="border-l-emerald-500"
  valueColorClass="text-emerald-600"
  iconBg="rgba(16, 185, 129, 0.1)"
/>
```

**Props:**
| Prop | Type | Default |
|------|------|---------|
| `title` | `string` | required |
| `value` | `string \| number` | required |
| `icon` | `React.ComponentType<{ className?: string }>` | `undefined` |
| `iconBg` | `string` | `rgba(15, 30, 54, 0.08)` |
| `borderLeftColorClass` | `string` | `border-l-[var(--brand-primary)]` |
| `valueColorClass` | `string` | `text-[var(--brand-primary)]` |

---

#### `TableCard`

Card wrapper untuk tabel — overflow hidden + aksen border atas.

```tsx
import { TableCard } from "@/components/shared/CustomCards";

<TableCard>
  <TableToolbar ... />
  <Table>...</Table>
  <PaginationFooter ... />
</TableCard>
```

---

#### `ContentCard` + `ContentCardHeader` + `ContentCardBody`

Card generik untuk konten statis (email settings, chart, dll). Memiliki aksen border atas yang sama dengan `TableCard`.

```tsx
import { ContentCard, ContentCardHeader, ContentCardBody } from "@/components/shared/CustomCards";

<ContentCard>
  <ContentCardHeader icon={Settings} title="Pengaturan Email" />
  <ContentCardBody>
    <p>Konten form atau informasi</p>
  </ContentCardBody>
</ContentCard>
```

---

#### `AccentCard`

Card dengan background gelap (brand-primary) — untuk CTA, unduh laporan, dll. Berbasis GlassCard dengan decorative blur elements.

```tsx
import { AccentCard } from "@/components/shared/CustomCards";

<AccentCard className="p-6">
  <h3 className="text-base font-bold mb-1">Unduh Laporan</h3>
  <p className="text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
    Rekapitulasi kehadiran harian.
  </p>
  <button
    className="mt-4 w-full py-2.5 rounded-md text-sm font-semibold"
    style={{
      backgroundColor: "rgba(255,255,255,0.12)",
      border: "1px solid rgba(255,255,255,0.2)",
      color: "#fff",
    }}
  >
    Download
  </button>
</AccentCard>
```

---

#### `ScanCard` + `ScanStep`

Card untuk workflow berbasis step — QR scan, form multi-step, dll. GlassCard base dengan decorative blur elements.

```tsx
import { ScanCard, ScanStep } from "@/components/shared/ScanCard";

<ScanCard>
  <ScanStep step={1} title="Pilih Event">
    <Select>...</Select>
  </ScanStep>
  <ScanStep step={2} title="Pilih Tipe" active={!!selectedEventId}>
    <div className="grid grid-cols-2 gap-3">...</div>
  </ScanStep>
</ScanCard>
```

**ScanCard Props:** Sama dengan `GlassCard` (extends `React.ComponentProps<"div">`)

**ScanStep Props:**
| Prop | Type | Default |
|------|------|---------|
| `step` | `number` | required |
| `title` | `string` | required |
| `active` | `boolean` | `true` |

---

#### `TableToolbar`

Toolbar untuk tabel dengan judul, search, dan action button.

```tsx
import { TableToolbar } from "@/components/shared/TableToolbar";

<TableToolbar
  title="Daftar Peserta"
  keyword={keyword}
  setKeyword={setKeyword}
  searchPlaceholder="Cari peserta..."
  actionButton={<Button>Tambah</Button>}
/>
```

---

#### `PaginationFooter`

Footer pagination dengan info jumlah data.

```tsx
import { PaginationFooter } from "@/components/shared/PaginationFooter";

<PaginationFooter
  currentPage={1}
  totalPage={5}
  totalData={48}
  onPrev={() => {}}
  onNext={() => {}}
  onPageChange={(page) => {}}
/>
```

---

#### `PageHeader`

Wrapper untuk page-level stat cards.

```tsx
import { PageHeader } from "@/components/shared/CustomCards";

<PageHeader>
  <StatCard title="Total" value={100} />
  <StatCard title="Hadir" value={80} borderLeftColorClass="border-l-emerald-500" />
</PageHeader>
```

---

#### `StatGrid`

Responsive wrapper untuk stat cards — otomatis horizontal di desktop, vertical di mobile.

```tsx
import { StatGrid } from "@/components/shared/CustomCards";

<StatGrid>
  <StatCard title="A" value={1} />
  <StatCard title="B" value={2} />
</StatGrid>
```

---

#### `ConfirmationDialog`

Dialog konfirmasi dengan header merah (danger), ikon, dan tombol aksi. Digunakan untuk aksi destruktif seperti hapus.

```tsx
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";

// Default (danger variant)
<ConfirmationDialog
  open={isOpen}
  onOpenChange={setIsOpen}
  title="Hapus Event?"
  description="Apakah Anda yakin ingin menghapus event ini?"
  icon={<Trash2 className="h-5 w-5" />}
  confirmLabel="Hapus"
  onConfirm={handleDelete}
/>

// Warning variant
<ConfirmationDialog
  variant="warning"
  open={isOpen}
  onOpenChange={setIsOpen}
  title="Kirim Email?"
  description="Email akan dikirim ke semua peserta yang terdaftar."
  icon={<Mail className="h-5 w-5" />}
  confirmLabel="Kirim"
  onConfirm={handleSend}
/>
```

**Variants:**
| Variant | Header BG | Icon | Use Case |
|---------|-----------|------|----------|
| `danger` | `bg-red-50` | `Trash2` | Delete, hapus |
| `warning` | `bg-amber-50` | `AlertTriangle` | Caution, warning |
| `default` | `bg-blue-50` | `Info` | Neutral confirmation |

**Props:**
| Prop | Type | Default |
|------|------|---------|
| `variant` | `"danger" \| "warning" \| "default"` | `"danger"` |
| `open` | `boolean` | required |
| `onOpenChange` | `(open: boolean) => void` | required |
| `title` | `string` | required |
| `description` | `string` | required |
| `icon` | `ReactNode` | required |
| `confirmLabel` | `string` | required |
| `confirmVariant` | `"destructive" \| "default"` | `"destructive"` |
| `onConfirm` | `() => void \| Promise<void>` | required |
| `onCancel` | `() => void` | `undefined` |

---

## Date/Time Utility Functions

Lokasi: `src/lib/utils.ts`

Semua format tanggal dan waktu harus menggunakan utility functions ini untuk konsistensi.

### Fungsi yang tersedia:

```typescript
import { formatDate, formatTime, formatDateTime, formatDateRange } from "@/lib/utils";

// formatDate: "27 Jul 2026"
formatDate("2026-07-27") // string input
formatDate(new Date())     // Date input

// formatTime: "09:00 WIB"
formatTime("2026-07-27T09:00:00")
formatTime(new Date())

// formatDateTime: "27 Jul 2026, 09:00 WIB"
formatDateTime("2026-07-27T09:00:00")
formatDateTime(new Date())

// formatDateRange: "27 Jul 2026, 09:00 WIB - 17:00 WIB"
formatDateRange("2026-07-27T09:00:00", "2026-07-27T17:00:00")
```

### Aturan Penggunaan:
- Semua waktu **WAJIB** menampilkan suffix "WIB" (Asia/Jakarta)
- Jangan gunakan `toLocaleString()` atau `toLocaleDateString()` secara langsung di component
- Selalu gunakan utility functions agar format tanggal/waktu mudah diubah di masa depan
- Untuk tanggal saja (tanpa waktu): gunakan `formatDate()`
- Untuk waktu saja (tanpa tanggal): gunakan `formatTime()`
- Untuk tanggal + waktu: gunakan `formatDateTime()`

---

## Button Patterns

### Action Buttons (Outline with Color)

Gunakan warna berbeda untuk aksi berbeda:

| Action | Class |
|--------|-------|
| Check In | `text-emerald-600 border-emerald-200 hover:bg-emerald-50` |
| Check Out | `text-amber-600 border-amber-200 hover:bg-amber-50` |
| Email | `text-blue-600 border-blue-200 hover:bg-blue-50` |
| Hapus | `text-destructive border-destructive/20 hover:bg-destructive/10` |

### Primary Button

Selalu gunakan inline style untuk brand color:

```tsx
<Button style={{ backgroundColor: "var(--brand-primary)" }}>
  Label
</Button>
```

**Jangan** gunakan `bg-[var(--brand-primary)]` di className — gunakan inline style.

---

## Select (Dropdown)

Select menggunakan `@base-ui/react/select`. **Penting:** `items` prop harus di-pass ke `<Select.Root>` agar `Select.Value` menampilkan label bukan raw value.

```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

<Select
  items={[
    { value: "opt1", label: "Opsi 1" },
    { value: "opt2", label: "Opsi 2" },
  ]}
>
  <SelectTrigger>
    <SelectValue placeholder="Pilih opsi..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="opt1">Opsi 1</SelectItem>
    <SelectItem value="opt2">Opsi 2</SelectItem>
  </SelectContent>
</Select>
```

---

## Layout Patterns

### Standard Page Layout

```tsx
<div className="flex flex-col space-y-7 md:space-y-10 pb-20 md:pb-0">
  {/* 1. Stat Cards */}
  <PageHeader>
    <StatCard ... />
    <StatCard ... />
  </PageHeader>

  {/* 2. Table Card */}
  <TableCard>
    <TableToolbar ... />
    <Table>...</Table>
    <PaginationFooter ... />
  </TableCard>

  {/* 3. Dialogs (optional) */}
  <Dialog>...</Dialog>
</div>
```

### Bulk Action Bar

```tsx
{selectedIds.length > 0 && (
  <div className="bg-blue-50/50 border-b border-blue-100 px-5 py-3 flex items-center justify-between">
    <span className="text-sm font-medium text-blue-800">
      {selectedIds.length} item dipilih
    </span>
    <div className="flex gap-2">
      <Button size="sm" variant="outline" className="text-emerald-600 ...">Check In</Button>
      <Button size="sm" variant="outline" className="text-red-600 ...">Hapus</Button>
    </div>
  </div>
)}
```

---

## File Structure

```
src/
├── components/
│   ├── ui/                    # Shadcn UI base components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── checkbox.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── table.tsx
│   │   └── ...
│   └── shared/                # Shared reusable components
│       ├── CustomCards.tsx     # GlassCard, TableCard, ContentCard, AccentCard, PageHeader, StatGrid
│       ├── StatCard.tsx       # Reusable stat card (with icon support)
│       ├── ScanCard.tsx       # Multi-step workflow card (QR scan, forms)
│       ├── ConfirmationDialog.tsx # Confirmation dialog with danger/warning variants
│       ├── TableToolbar.tsx   # Table header with search + action
│       └── PaginationFooter.tsx
├── lib/
│   ├── api.ts                 # API wrapper (authFetch)
│   ├── api-endpoints.ts       # API endpoint constants
│   └── utils.ts               # cn(), formatDate(), formatTime(), formatDateTime(), formatDateRange()
├── app/
│   ├── design-system/         # Component showcase (dev only)
│   │   └── page.tsx
│   └── dashboard/
│       └── ...
└── globals.css                # CSS variables + brand tokens
```

---

## Guidelines

### Do's

- Selalu gunakan shared components (`GlassCard`, `StatCard`, `TableCard`, `ContentCard`, `ConfirmationDialog`) alih-alih menulis Card wrapper baru
- Gunakan `StatCard` untuk statistik — support icon, custom border, custom value color
- Gunakan `TableToolbar` untuk semua tabel — konsistenkan search + title + action button
- Gunakan `PaginationFooter` untuk semua tabel dengan data banyak
- Gunakan inline style `style={{ backgroundColor: "var(--brand-primary)" }}` untuk primary buttons
- Pass `items` prop ke `<Select>` agar label ditampilkan di trigger
- Gunakan `formatDate()`, `formatTime()`, `formatDateTime()` untuk semua tampilan tanggal/waktu
- Gunakan `ConfirmationDialog` untuk semua aksi destruktif (hapus, kirim email massal)

### Don'ts

- Jangan gunakan class `card-base`, `table-base`, `btn-primary` (sudah dihapus dari CSS)
- Jangan buat stat card inline — gunakan `StatCard`
- Jangan gunakan `fetch()` langsung — gunakan `api` wrapper dari `@/lib/api`
- Jangan hardcode warna brand — gunakan CSS variables
- Jangan gunakan `alert()` — gunakan `toast` dari sonner
- Jangan gunakan `toLocaleString()` atau `toLocaleDateString()` — gunakan utility functions
