# Dokumentasi Frontend — Event Platform (Absensi HIPMI)

**Last Updated:** 15 August 2026  
**Tech Stack:** Next.js 15 + TypeScript + Tailwind CSS + SWR + NextAuth

---

## Daftar Isi

1. [Arsitektur](#arsitektur)
2. [Halaman & Rute](#halaman--rute)
3. [Fitur per Module](#fitur-per-module)
4. [Authentikasi & Otorisasi](#authentikasi--otorisasi)
5. [Integrasi API](#integrasi-api)
6. [Email System](#email-system)
7. [Import/Export](#importexport)
8. [Bulk Operations](#bulk-operations)
9. [Special Features](#special-features)

---

## Arsitektur

```
src/
├── app/                          # Next.js App Router
│   ├── api/auth/[...nextauth]/   # NextAuth credentials provider
│   ├── design-system/            # Component showcase
│   ├── dashboard/                # Main dashboard layout
│   │   ├── page.tsx              # Home (stats + recent groups)
│   │   ├── event-group/          # Event group management
│   │   ├── participant/          # Participant master data
│   │   ├── settings/             # App settings
│   │   ├── email-log/            # Global email log
│   │   ├── users/                # User management
│   │   ├── testing/              # Testing hub
│   │   └── dev-tools/            # Dev-only tools
│   └── page.tsx                  # Login page
├── components/
│   ├── features/                 # Feature-specific components
│   ├── shared/                   # Reusable components
│   └── ui/                       # Base UI components
├── hooks/                        # Custom React hooks
├── lib/                          # Utilities & API helpers
└── data/                         # CSV data files
```

---

## Halaman & Rute

| Rute | Halaman | Deskripsi |
|------|---------|-----------|
| `/` | Login | Form email/password, auto-redirect jika sudah login |
| `/dashboard` | Beranda | Statistik overview, recent event groups |
| `/dashboard/event-group` | Daftar Grup Event | CRUD grup event, search, pagination |
| `/dashboard/event-group/[id]` | Workspace Overview | Summary cards, chart, email settings |
| `/dashboard/event-group/[id]/event` | Manajemen Event | CRUD sub-event dalam grup |
| `/dashboard/event-group/[id]/registration` | Manajemen Registrasi | Tabel registrasi, bulk actions |
| `/dashboard/event-group/[id]/scan` | QR Scanner | Camera + physical scanner |
| `/dashboard/event-group/[id]/export` | Export | Export attendance ke Excel |
| `/dashboard/event-group/[id]/session` | Manajemen Sesi | CRUD sesi dalam event |
| `/dashboard/event-group/[id]/participation-types` | Tipe Partisipasi (Grup) | Assign/unassign tipe ke grup |
| `/dashboard/event-group/[id]/email-log` | Email Log (Grup) | Log email per grup |
| `/dashboard/participant` | Data Peserta | Master CRUD peserta |
| `/dashboard/settings` | Pengaturan | Profile + App Preferences |
| `/dashboard/settings/membership-types` | Tipe Keanggotaan | CRUD + Pindah |
| `/dashboard/settings/participation-types` | Tipe Partisipasi | CRUD + Pindah |
| `/dashboard/users` | Manajemen User | CRUD user (Super Admin only) |
| `/dashboard/email-log` | Email Log (Global) | Log semua email |
| `/dashboard/testing` | Testing Hub | System health + test email |
| `/dashboard/dev-tools/cascade-delete` | Cascade Delete | Dev-only bulk delete |

---

## Fitur per Module

### 1. Dashboard (Home)

| Fitur | Keterangan | File |
|-------|------------|------|
| Statistik overview | Total grup event, event, peserta, kehadiran | `dashboard/page.tsx` |
| Recent event groups | Tabel event groups terbaru | `RecentEventGroupsTable.tsx` |
| Sidebar check-in/out | Ringkasan check-in/check-out | `DashboardSidebar.tsx` |
| Create event group | Modal buat grup baru | `CreateEventGroupModal.tsx` |

### 2. Event Group Management

| Fitur | Keterangan | File |
|-------|------------|------|
| CRUD | Create, read, update, delete grup | `EventGroupTable.tsx` |
| Search & pagination | Cari nama grup | `EventGroupTable.tsx` |
| Send email | Kirim email ke semua peserta grup | `useEventGroupPageActions.ts` |
| Delete | Hapus grup (konfirmasi) | `useEventGroupPageActions.ts` |

### 3. Workspace (Event Group Detail)

| Fitur | Keterangan | File |
|-------|------------|------|
| Summary cards | Jumlah sub-event, registrasi, kehadiran | `WorkspaceSummaryCards.tsx` |
| Quick actions | Link cepat ke registrasi, scan, export | `WorkspaceQuickActions.tsx` |
| Attendance chart | Grafik kehadiran per event | `WorkspaceChart.tsx` |
| Email settings | Edit subject, body, toggle QR/info/agenda | `EmailSettingsCard.tsx` |
| Email preview | Pratinjau template per-event & per-grup | `EmailPreviewCard.tsx` |
| Test email | Kirim test email | `TestEmailCard.tsx` |
| Edit name | Ubah nama grup (ikon pensil) | `EditEventGroupNameModal.tsx` |

### 4. Registration Management

| Fitur | Keterangan | File |
|-------|------------|------|
| Tabel registrasi | Daftar peserta terdaftar | `registration/page.tsx` |
| Add participant | Tambah peserta ke grup | `AddParticipantModal.tsx` |
| Search & filter | Cari nama/email, filter tipe | `registration/page.tsx` |
| Inline edit | Edit tipe partisipasi langsung di tabel | `registration/page.tsx` |
| Bulk actions | Email, check-in/out, edit tipe, delete | `BulkActionBar.tsx` |
| Detail modal | Info lengkap + riwayat kehadiran | `DetailRegistrationModal.tsx` |

### 5. QR Scanner

| Fitur | Keterangan | File |
|-------|------------|------|
| Camera mode | Scan QR via kamera HP/laptop | `QRScanner.tsx` |
| Physical mode | Input dari scanner USB/HID | `scan/page.tsx` |
| Status overlay | Animasi loading/sukses/error | `ScanStatusOverlay.tsx` |
| Event selection | Pilih event + sesi sebelum scan | `scan/page.tsx` |

### 6. Participant Management

| Fitur | Keterangan | File |
|-------|------------|------|
| CRUD | Create, read, update, delete peserta | `participant/page.tsx` |
| Import Excel | Import dari .xlsx dengan column mapping | `ImportExcelModal.tsx` |
| Inline edit | Edit tipe keanggotaan langsung di tabel | `participant/page.tsx` |
| Detail modal | Info peserta + riwayat event | `DetailParticipantModal.tsx` |
| Bulk ops | Add to group, edit membership, delete | `ParticipantBulkActionBar.tsx` |

### 7. Settings

| Fitur | Keterangan | File |
|-------|------------|------|
| Profile | Edit nama, password | `AccountTab.tsx` |
| Membership types | CRUD + Pindah + Bulk move | `membership-types/page.tsx` |
| Participation types | CRUD + Pindah + Bulk move | `participation-types/page.tsx` |

### 8. Email System

| Fitur | Keterangan | File |
|-------|------------|------|
| Email settings | Subject, body (markdown), toggles | `EmailSettingsCard.tsx` |
| Email preview | Pratinjau per-event & per-grup | `EmailPreviewCard.tsx` |
| Test email | Uji SMTP, template group/event | `TestEmailCard.tsx` |
| Send single | Kirim email ke 1 peserta | `SendEmailModal.tsx` |
| Bulk send | Kirim email ke banyak peserta | `BulkActionBar.tsx` |
| Email log | Log pengiriman (auto-refresh 5s) | `email-log/page.tsx` |
| Job polling | Status pengiriman real-time | `emailJobPolling.ts` |

### 9. Export/Import

| Fitur | Keterangan | File |
|-------|------------|------|
| Export attendance | Export ke .xlsx per event | `export/page.tsx` |
| Export preview | Preview 5 baris sebelum export | `export/page.tsx` |
| Import participants | Import dari .xlsx | `ImportExcelModal.tsx` |
| Smart column matching | Flexible header detection | `useParticipantActions.ts` |

### 10. Type CRUD (Membership & Participation)

| Fitur | Keterangan | File |
|-------|------------|------|
| CRUD table | Tabel dengan tambah/ubah/hapus | `TypeCrudTable.tsx` |
| Edit dialog | Form edit nama/slug/urutan | `TypeCrudTable.tsx` |
| Move before delete | Pindah data sebelum hapus tipe | `MoveDeleteDialog.tsx` |
| Bulk move | Pindah banyak data sekaligus | `BulkMoveModal.tsx` |
| Safe delete | Tidak bisa hapus jika masih dipakai | `useTypeCrud.ts` |

---

## Authentikasi & Otorisasi

### Login
- **NextAuth Credentials Provider** — email + password
- JWT session dengan `accessToken`
- Auto-redirect ke `/dashboard` jika sudah login

### Role & Permission

| Role | Permission |
|------|------------|
| **SUPER_ADMIN** | Full access (user manage, settings, delete) |
| **EVENT_ADMIN** | Event + registration + participant + email |
| **OPERATOR** | Scan + manual check-in + export |

### Permission Actions

| Action | Deskripsi |
|--------|-----------|
| `participantManage` | CRUD peserta |
| `eventGroupManage` | CRUD grup event |
| `eventManage` | CRUD event |
| `registrationManage` | CRUD registrasi |
| `participationTypeManage` | CRUD tipe partisipasi |
| `emailManage` | Kirim email |
| `reportExport` | Export laporan |
| `attendanceScan` | Scan QR |
| `attendanceManual` | Manual check-in/out |
| `userManage` | CRUD user |
| `settingsManage` | Pengaturan aplikasi |

---

## Integrasi API

### Base URL
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Auth Header
```
Authorization: Bearer <JWT_TOKEN>
```

### API Endpoints yang Dipakai

| Module | Endpoint | Method |
|--------|----------|--------|
| Auth | `/auth/login` | POST |
| Profile | `/profile/me` | GET, PUT |
| Event Groups | `/event-groups` | GET, POST |
| Event Groups | `/event-groups/:id` | GET, PUT, DELETE |
| Events | `/events` | GET, POST |
| Events | `/events/:id` | GET, PUT, DELETE |
| Sessions | `/sessions` | GET, POST |
| Sessions | `/sessions/:id` | GET, PUT, DELETE |
| Participants | `/participants` | GET, POST |
| Participants | `/participants/:id` | GET, PUT, DELETE |
| Participants | `/participants/bulk-update` | PUT |
| Participants | `/participants/:id/history` | GET |
| Registrations | `/registrations` | GET, POST |
| Registrations | `/registrations/:id` | GET, PUT, DELETE |
| Registrations | `/registrations/bulk` | POST |
| Registrations | `/registrations/bulk-update` | PUT |
| Registrations | `/registrations/:id/send-email` | POST |
| Registrations | `/registrations/bulk-send-email` | POST |
| Attendances | `/attendances` | GET |
| Attendances | `/attendances/scan` | POST |
| Attendances | `/attendances/manual` | POST |
| Attendances | `/attendances/bulk` | POST |
| Membership Types | `/membership-types` | GET, POST |
| Membership Types | `/membership-types/:id` | GET, PUT, DELETE |
| Participation Types | `/participation-types` | GET, POST |
| Participation Types | `/participation-types/:id` | GET, PUT, DELETE |
| Event Group PT | `/event-groups/:id/participation-types` | GET, POST |
| Event Group PT | `/event-groups/:id/participation-types/:aId` | PUT, DELETE |
| Analytics | `/analytics/dashboard` | GET |
| Email Batches | `/email-batches` | GET |
| Email Batches | `/email-batches/:id` | GET |
| Email Jobs | `/email-jobs` | GET |
| Email Jobs | `/email-jobs/:id` | GET |
| Test | `/test/email` | POST |
| Users | `/users` | GET, POST |
| Users | `/users/:id` | GET, PUT, DELETE |

---

## Email System

### Flow

```
User input (subject, body, toggles)
    ↓
Save ke database (PUT /event-groups/:id)
    ↓
Render email:
  1. Replace {{name}}, {{event_name}}, {{event_group_name}}
  2. Markdown → HTML (marked + sanitize-html)
  3. Wrap dalam email layout (HIPMI branding)
    ↓
Send via SMTP (Brevo)
    ↓
Track status di EmailBatch + EmailJob
```

### Template Variables
- `{{name}}` — Nama peserta
- `{{event_name}}` — Nama event
- `{{event_group_name}}` — Nama grup event

### Markdown Support
- Single newline → `<br>` (breaks: true)
- Double newline → `<p>` paragraph
- **Bold**, *italic*, [links](url)
- Lists, blockquotes

### Toggle Options
| Toggle | Default | Deskripsi |
|--------|---------|-----------|
| Show QR | true | Tampilkan QR code tiket |
| Show Participant Info | true | Tabel info peserta |
| Show Agenda | true | Rangkaian acara / jadwal sesi |

---

## Import/Export

### Import Participants
1. Upload file `.xlsx`
2. Preview data (10 baris pertama)
3. Column mapping otomatis:
   - `Nama (Wajib)` → name
   - `Email (Wajib)` → email
   - `Jenis Kelamin (Wajib)` → gender (L/P)
   - `Perusahaan (Wajib)` → company
   - `Tipe Identitas (Opsional)` → identification_type
   - `No. Identitas (Opsional)` → identification_number
   - `Tipe Keanggotaan (Opsional)` → membership_type_name
4. Gender normalization: "Laki-laki" → "L", "Perempuan" → "P"
5. Submit → Bulk create

### Export Attendance
1. Pilih event group → Pilih event
2. Preview 5 baris pertama
3. Export ke `.xlsx` dengan formatted headers

---

## Bulk Operations

| Operasi | Lokasi | Endpoint |
|---------|--------|----------|
| Bulk register | AddParticipantModal | `POST /registrations/bulk` |
| Bulk edit participation | BulkEditParticipationTypeModal | `PUT /registrations/bulk-update` |
| Bulk check-in/out | BulkActionBar | `POST /attendances/bulk` |
| Bulk send email | SendEmailModal | `POST /registrations/bulk-send-email` |
| Bulk delete registrations | BulkActionBar | `DELETE /registrations/:id` (per item) |
| Bulk edit membership | BulkEditMembershipTypeModal | `PUT /participants/bulk-update` |
| Bulk add to group | AddToEventGroupModal | `POST /registrations/bulk` |
| Bulk delete participants | ParticipantBulkActionBar | `DELETE /participants/:id` (per item) |
| Bulk move (type) | BulkMoveModal | `PUT /participants/bulk-update` or `PUT /registrations/bulk-update` |

---

## Special Features

| Fitur | Keterangan |
|-------|------------|
| QR Code Camera | html5-qrcode library, live camera scan |
| Physical Scanner | USB/HID keyboard-wedge input |
| Inline Editing | Edit tipe langsung di tabel tanpa modal |
| Mobile Responsive | Bottom navbar, adaptive layout |
| Page Transitions | Framer Motion fade+slide animation |
| Real-time Email Log | Auto-refresh setiap 5 detik |
| Move-before-delete | Pindah data sebelum hapus tipe |
| Smart Excel Parsing | Flexible column matching |
| Role-based UI | Menu/aksi muncul berdasarkan role |
| System Health Check | Cek API, DB, auth, master data |
