# Frontend Structure Rules

Dokumen aturan struktur folder, naming conventions, dan coding patterns untuk `event-platform-fe`.

---

## 1. Folder Structure

```
event-platform-fe/
├── public/                        # Static assets
├── src/
│   ├── app/                       # Next.js App Router (routing)
│   │   ├── layout.tsx             # Root layout (Server Component)
│   │   ├── page.tsx               # Login page
│   │   ├── globals.css            # Global styles
│   │   │
│   │   ├── api/auth/[...nextauth]/
│   │   │   └── route.ts           # NextAuth handler
│   │   │
│   │   └── dashboard/
│   │       ├── layout.tsx         # Dashboard shell (sidebar + navbar)
│   │       ├── template.tsx       # Page transitions
│   │       ├── page.tsx           # Dashboard home
│   │       └── {feature}/
│   │           └── page.tsx       # Feature page
│   │
│   ├── components/
│   │   ├── ui/                    # Layer 1: shadcn/ui primitives
│   │   ├── shared/                # Layer 2: App-wide reusable components
│   │   └── features/              # Layer 3: Domain-specific components
│   │       └── {feature}/
│   │
│   ├── hooks/                     # Custom React hooks
│   ├── lib/                       # Utilities, API client, helpers
│   └── types/                     # TypeScript type definitions
```

---

## 2. Component Hierarchy Rules

### Tiga Layer Komponen

```
components/
├── ui/           → Layer 1: Raw UI primitives
│                     Tidak ada business logic
│                     Reusable di seluruh aplikasi
│                     Source: shadcn/ui CLI
│
├── shared/       → Layer 2: App-wide patterns
│                     Cards, Pagination, Toolbar, Dialog
│                     Bisa dipakai di multiple features
│                     Tidak terikat ke domain tertentu
│
└── features/     → Layer 3: Domain-specific components
    └── {feature}/     Organized per fitur/feature
        ├── {Component}Modal.tsx
        ├── {Component}Table.tsx
        └── hooks/
            └── use{Feature}Actions.ts
```

### Aturan Layer

| Rule | Penjelasan |
|------|-----------|
| **ui/ tidak boleh di-modify** | Selalu update via shadcn CLI, jangan edit manual |
| **shared/ harus generic** | Tidak boleh ada import dari `features/` |
| **features/ boleh import shared & ui** | Tidak boleh import dari features lain |
| **features/ per feature** | Satu folder per domain/feature |

---

## 3. Feature Extraction Rules

### Kapan harus extract ke `components/features/`?

| Kondisi | Action |
|---------|--------|
| Page > 300 baris | Wajib extract |
| Ada 2+ modal di satu page | Wajib extract per modal |
| Ada table dengan复杂 logic | Wajib extract table component |
| Ada business logic yang bisa reusable | Extract ke custom hook |

### Folder Structure Target

```
components/features/
├── dashboard/
│   ├── DashboardStats.tsx
│   ├── RecentEventGroups.tsx
│   └── CreateEventGroupModal.tsx
│
├── event-group/
│   ├── EventGroupTable.tsx
│   └── CreateEventGroupModal.tsx
│
├── workspace/
│   ├── Overview/
│   │   ├── SummaryCards.tsx
│   │   ├── ChartSection.tsx
│   │   └── EmailSettings.tsx
│   │
│   ├── Registration/
│   │   ├── AddParticipantModal.tsx
│   │   ├── BulkActionBar.tsx
│   │   ├── CheckInEventModal.tsx
│   │   ├── DetailRegistrationModal.tsx
│   │   └── SendEmailModal.tsx
│   │
│   ├── Event/
│   │   ├── EventTable.tsx
│   │   └── EventFormModal.tsx
│   │
│   └── Scan/
│       └── QRScanner.tsx
│
├── participant/
│   ├── ParticipantTable.tsx
│   ├── BulkActionBar.tsx
│   ├── CreateParticipantModal.tsx
│   ├── ImportExcelModal.tsx
│   └── DetailParticipantModal.tsx
│
├── users/
│   ├── UserTable.tsx
│   └── CreateUserModal.tsx
│
└── settings/
    ├── AccountSettings.tsx
    ├── MembershipTypeTable.tsx
    └── ParticipationTypeTable.tsx
```

---

## 4. Page Composition Pattern

```typescript
// app/dashboard/{feature}/page.tsx
"use client";

import { useParams } from "next/navigation";
import { usePermissions } from "@/hooks/usePermissions";
import { use{Feature}Actions } from "@/hooks/use{Feature}Actions";
import { {Component}Table } from "@/components/features/{feature}/{Component}Table";
import { {Component}Modal } from "@/components/features/{feature}/{Component}Modal";

export default function {Feature}Page() {
  const { id } = useParams() as { id: string };
  const { can } = usePermissions();
  const actions = use{Feature}Actions({ id });

  return (
    <div className="flex flex-col space-y-7 md:space-y-10 pb-20 md:pb-0">
      {/* Stats Cards */}
      {/* Table */}
      <{Component}Table {...actions} can={can} />
      {/* Modals (at bottom) */}
      <{Component}Modal {...actions} />
    </div>
  );
}
```

### Aturan Page

| Rule | Keterangan |
|------|-----------|
| **Semua page harus `"use client"`** | Tidak ada Server Components di pages |
| **Root wrapper wajib** | `<div className="flex flex-col space-y-7 md:space-y-10 pb-20 md:pb-0">` |
| **Section order** | Stats → Table → Modals |
| **Page harus < 200 baris** | Jika lebih, extract ke features |
| **Tidak ada inline modals** | Semua modal harus di-extract |
| **Tidak ada inline business logic** | Extract ke custom hooks |

---

## 5. Data Fetching Rules

### Wajib menggunakan SWR

```typescript
// ✅ BENAR
import useSWR from "swr";
import { GET_EVENT_GROUPS } from "@/lib/api-endpoints";

const { data, isLoading, mutate } = useSWR(GET_EVENT_GROUPS());
const items = data?.data ?? [];

// ❌ SALAH - Jangan gunakan useEffect + api.get
const [items, setItems] = useState([]);
useEffect(() => {
  api.get("/event-groups").then((res) => setItems(res.data));
}, []);
```

### Aturan Data Fetching

| Rule | Keterangan |
|------|-----------|
| **Gunakan SWR untuk semua data fetching** | Bukan useEffect + api.get |
| **SWR key harus dari api-endpoints.ts** | Fungsi yang build URL string |
| **Conditional fetching** | `useSWR(condition ? URL : null)` |
| **Mutate setelah CRUD** | `mutate()` untuk revalidate data |
| **Tidak perlu `revalidateOnFocus: false`** | Sudah di-set global di SWRProvider |

---

## 6. Modal / Dialog Rules

### Wajib menggunakan Dialog component

```typescript
// ✅ BENAR
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/dialog";

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Judul</DialogTitle>
    </DialogHeader>
    <DialogBody className="space-y-4">
      {/* Form fields */}
    </DialogBody>
    <DialogFooter>
      <Button variant="outline" onClick={() => setIsOpen(false)}>Batal</Button>
      <Button onClick={handleSave}>Simpan</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

// ❌ SALAH - Jangan gunakan raw div overlay
{isOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div className="bg-white rounded-lg ...">
      {/* Content */}
    </div>
  </div>
)}
```

### Aturan Modal

| Rule | Keterangan |
|------|-----------|
| **Gunakan `<Dialog>` component** | Bukan raw div overlay |
| **Gunakan `<ConfirmationDialog>` untuk destructive actions** | Bukan `window.confirm()` |
| **Satu modal = satu file** | Extract ke `components/features/{feature}/` |
| **Modal harus accessible** | Gunakan `DialogHeader`, `DialogTitle`, `DialogDescription` |

---

## 7. Confirmation Dialog Rules

### Wajib menggunakan ConfirmationDialog

```typescript
// ✅ BENAR
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";

<ConfirmationDialog
  open={isDeleteModalOpen}
  onOpenChange={setIsDeleteModalOpen}
  title="Hapus Data"
  description="Apakah Anda yakin? Tindakan ini tidak dapat dibatalkan."
  confirmText="Hapus"
  variant="danger"
  isLoading={isDeleting}
  onConfirm={handleConfirmDelete}
/>

// ❌ SALAH - Jangan gunakan window.confirm
if (!confirm("Hapus data ini?")) return;
await api.delete(`/items/${id}`);
```

### Aturan Confirmation

| Rule | Keterangan |
|------|-----------|
| **Gunakan `<ConfirmationDialog>`** | Bukan `window.confirm()` |
| **variant wajib** | `"danger"`, `"warning"`, atau `"default"` |
| **isLoading wajib** | Untuk disable button saat proses |
| **description harus jelas** | Jelaskan konsekuensi tindakan |

---

## 8. Loading Spinner Rules

### Wajib menggunakan Loader2 dari lucide-react

```typescript
// ✅ BENAR
import { Loader2 } from "lucide-react";

<Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />

// ❌ SALAH - Jangan gunakan custom CSS spinner
<div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />

// ❌ SALAH - Jangan gunakan inline SVG
<svg className="animate-spin h-5 w-5" ...>
```

### Aturan Spinner

| Rule | Keterangan |
|------|-----------|
| **Gunakan `<Loader2>` dari lucide-react** | Konsisten di semua page |
| **Ukuran wajib** | `w-6 h-6` untuk table loading, `w-4 h-4` untuk button |
| **Class wajib** | `animate-spin mx-auto text-muted-foreground` |

---

## 9. Brand Color Rules

### Satu pendekatan: Tailwind arbitrary values

```typescript
// ✅ BENAR - Gunakan Tailwind arbitrary values
className="text-[var(--brand-primary)]"
className="bg-[var(--brand-primary)]"
className="border-[var(--brand-primary)]"

// ❌ SALAH - Jangan gunakan inline style
style={{ color: "var(--brand-primary)" }}
style={{ backgroundColor: "var(--brand-primary)" }}
```

### Aturan Brand Color

| Rule | Keterangan |
|------|-----------|
| **Gunakan Tailwind arbitrary values** | `[var(--brand-primary)]` |
| **Jangan gunakan inline `style={{}}`** | Kecuali untuk dynamic values |
| **CSS variables tersedia** | `--brand-primary`, `--brand-secondary`, `--brand-mid`, `--brand-light` |

---

## 10. Form Validation Rules

### Gunakan error state objects untuk forms

```typescript
// ✅ BENAR - Untuk forms dengan multiple fields
const [errors, setErrors] = useState({
  name: "",
  email: "",
  api: "",
});

const handleSubmit = async () => {
  const newErrors = { name: "", email: "", api: "" };

  if (!form.name.trim()) newErrors.name = "Nama wajib diisi";
  if (!form.email.trim()) newErrors.email = "Email wajib diisi";

  setErrors(newErrors);
  if (newErrors.name || newErrors.email) return;

  try {
    await api.post("/items", form);
    toast.success("Berhasil!");
  } catch (error: any) {
    const message = error.response?.data?.error || "Terjadi kesalahan";
    setErrors((prev) => ({ ...prev, api: message }));
  }
};

// ✅ BENAR - Untuk simple single-field validation
if (!selectedEventId) {
  toast.error("Pilih event terlebih dahulu");
  return;
}
```

### Aturan Form

| Rule | Keterangan |
|------|-----------|
| **Multi-field forms** | Gunakan error state objects |
| **Single-field checks** | Gunakan `toast.error()` atau `toast.warning()` |
| **API error handling** | Selalu `error.response?.data?.error \|\| "Default"` |
| **Reset errors** | Setiap kali user typing, clear error field tersebut |

---

## 11. Custom Hooks Rules

### Pattern untuk hooks

```typescript
// hooks/use{Feature}Actions.ts
"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { api } from "@/lib/api";

export function use{Feature}Actions(params: { id: string }) {
  // 1. State declarations
  const [keyword, setKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // 2. SWR data fetching
  const { data, isLoading, mutate } = useSWR(
    GET_ENDPOINT(params.id, currentPage, 10, keyword)
  );

  // 3. Side effects (useEffect)
  useEffect(() => {
    // reset selection, fetch attendance status, dll
  }, [dependency]);

  // 4. Handlers
  const handleAction = async () => {
    try {
      await api.post("/endpoint", payload);
      toast.success("Berhasil!");
      mutate();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Gagal");
    }
  };

  // 5. Return semua state + handlers
  return {
    // State
    keyword, setKeyword,
    currentPage, setCurrentPage,
    // Data
    data, isLoading, mutate,
    // Handlers
    handleAction,
  };
}
```

### Aturan Hooks

| Rule | Keterangan |
|------|-----------|
| **Naming** | `use{Feature}Actions` atau `use{Feature}Table` |
| **Export** | Named export, bukan default export |
| **State management** | `useState` untuk local state, `useSWR` untuk server state |
| **Return** | Flat object dengan semua state + handlers |
| **Max 500 baris** | Jika lebih, split ke beberapa hooks |

---

## 12. Import Rules

### Urutan import

```typescript
// 1. Next.js
import { useParams, useRouter } from "next/navigation";

// 2. React
import { useState, useEffect } from "react";

// 3. Third-party libraries
import useSWR from "swr";
import { toast } from "sonner";
import { Loader2, Search, Trash2 } from "lucide-react";

// 4. UI Components (ui/ → shared/ → features/)
import { Button } from "@/components/ui/button";
import { TableCard } from "@/components/shared/CustomCards";
import { BulkActionBar } from "@/components/features/workspace/Registration/BulkActionBar";

// 5. Hooks
import { usePermissions } from "@/hooks/usePermissions";

// 6. Lib
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
```

### Aturan Import

| Rule | Keterangan |
|------|-----------|
| **Gunakan `@/` alias** | `@/components/...`, `@/hooks/...`, `@/lib/...` |
| **Named exports** | Untuk components, hooks, lib |
| **Default exports** | Hanya untuk pages dan providers |
| ** alphabetical within groups** | Urutkan secara alphabetical dalam satu group |

---

## 13. Export Rules

| Item | Export Type | Contoh |
|------|------------|--------|
| Pages (`page.tsx`) | `export default function PageName()` | `export default function DashboardPage()` |
| Components | Named export | `export function StatCard({ ... })` |
| Hooks | Named export | `export function usePermissions()` |
| Lib utilities | Named export | `export const api = ...` |
| Providers | Default export | `export default function AuthProvider()` |
| Props interfaces | Named export | `export interface StatCardProps { ... }` |

---

## 14. Forbidden Patterns

### ❌ Jangan lakukan ini:

| Forbidden | Keterangan | Alternatif |
|-----------|-----------|-----------|
| `window.confirm()` | Tidak accessible, tidak konsisten | `<ConfirmationDialog>` |
| `useEffect` + `api.get()` untuk data fetching | Tidak ada caching, manual | `useSWR` |
| Custom CSS spinner | Tidak konsisten | `<Loader2>` dari lucide-react |
| Raw div overlay modal | Tidak accessible | `<Dialog>` component |
| Inline `style={{ color: "var(--brand-primary)" }}` | Tidak Tailwind-friendly | `[var(--brand-primary)]` |
| `console.log` di production | Tidak ada di codebase | Hapus atau gunakan DevTools |
| Barrel exports (`index.ts`) | Tidak dipakai di project ini | Import langsung ke file |
| axios | Tidak dipakai (sudah ada `lib/api.ts`) | Hapus dari package.json |

---

## 15. Checklist untuk Feature Baru

Saat membuat feature baru atau refactor:

### Folder & Files
- [ ] Buat folder `components/features/{feature}/`
- [ ] Extract semua modal ke file terpisah
- [ ] Extract table component jika ada
- [ ] Buat custom hook `hooks/use{Feature}Actions.ts`
- [ ] Buat helpers `lib/{feature}-helpers.ts` jika perlu

### Page
- [ ] Page < 200 baris
- [ ] Tidak ada inline modals
- [ ] Tidak ada inline business logic
- [ ] Root wrapper: `flex flex-col space-y-7 md:space-y-10 pb-20 md:pb-0`

### Components
- [ ] Semua modal pakai `<Dialog>`
- [ ] Semua delete confirmation pakai `<ConfirmationDialog>`
- [ ] Semua loading pakai `<Loader2>`
- [ ] Brand color pakai `[var(--brand-primary)]`
- [ ] Props interface bernama `{ComponentName}Props` dan di-export

### Data
- [ ] Data fetching pakai SWR
- [ ] SWR key dari `api-endpoints.ts`
- [ ] Error handling: `error.response?.data?.error || "Default"`

### Hooks
- [ ] Return flat object (bukan nested)
- [ ] Export named (bukan default)
- [ ] < 500 baris
