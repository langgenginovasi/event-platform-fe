# Progress & Integration Status

**Last Updated:** 28 July 2026  
**Overall Progress:** ~97% (Phase 2.6 completed ✅)

---

## Status Keseluruhan

| Komponen | Status |
|----------|--------|
| Backend (Fastify) | ✅ 35 Endpoints, Zod Validation, Scalar Docs |
| Frontend (Next.js) | ✅ 12/13 Pages Connected |
| Database (PostgreSQL) | ✅ Migrated & Seeded |
| Email (Brevo SMTP) | ✅ Configured with QR ticket template |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Auth | NextAuth v4 (Credentials), JWT |
| HTTP Client | Axios (via api wrapper) |
| Icons | Lucide React |
| Backend | Fastify, TypeScript |
| ORM | Prisma |
| Database | PostgreSQL |
| Email | Nodemailer + Brevo SMTP |
| API Docs | Scalar |

---

## Data Model

```
Event Group
├── Event
│   └── Session (optional)
├── Registration (1 QR per Event Group)
│   ├── Participant
│   └── Attendance (checkin/checkout)
```

### User Roles
- **SUPER_ADMIN**: Platform control (manage users, event groups)
- **EVENT_ADMIN**: Event owner (manage events, registrations, reports)
- **OPERATOR**: Execution layer (scan QR only)

---

## Status Git

| Repo | Branch | Status |
|------|--------|--------|
| `event-platform-be` | `dev` | Clean ✅ |
| `event-platform-fe` | `feat/ui-enhancements` | Clean ✅ |

---

## Integration Status by Page

| Page | Status | Connection | Notes |
|------|--------|------------|-------|
| Login | ✅ Connected | 100% | NextAuth + JWT working |
| Dashboard Layout | ✅ Connected | 100% | Auth guard + workspace context |
| Dashboard Home | ✅ Connected | 100% | Debug logging removed |
| Event Group List | ✅ Connected | 100% | Full CRUD, API normalized |
| Workspace Overview | ✅ Connected | 100% | Test email with 2 templates |
| Sub-Event Management | ✅ Connected | 100% | Full CRUD working |
| Registration | ✅ Connected | 100% | Bulk add, detail, kehadiran column |
| Participant | ✅ Connected | 100% | API normalized, toast notifications |
| Session | ✅ Connected | 100% | Full CRUD with SWR |
| QR Scanner | ✅ Connected | 100% | Connected to real API |
| Export/Reports | ✅ Connected | 100% | Excel export working |
| Users Management | ✅ Connected | 100% | Full CRUD (add/delete) |
| Settings | ✅ Connected | 100% | Profile CRUD working |

---

## Priority Tasks

### P0 - CRITICAL ✅ DONE

#### 1. ~~Connect QR Scanner to Backend~~ ✅ DONE
- **File:** `event-platform-fe/src/app/dashboard/event-group/[id]/scan/page.tsx`
- **Backend:** `POST /api/attendances/scan`
- **Completed:**
  - [x] Fetch real sub-events via `GET /api/events?event_group_id=...`
  - [x] Connect `handleCheckIn()` to `POST /api/attendances/scan`
  - [x] Send correct payload: `{ event_id, type, qr_code }`
  - [x] Handle real API response (success/error)
  - [x] Added loading state during verification
  - [x] Fixed type issues (string IDs instead of number)
  - [x] TypeScript compilation clean

### P1 - HIGH ✅ DONE

#### 2. ~~Connect Export Page to Backend~~ ✅ DONE
- **File:** `event-platform-fe/src/app/dashboard/event-group/[id]/export/page.tsx`
- **Backend:** `GET /api/attendances?export=true`
- **Completed:**
  - [x] Fetch real events for dropdown
  - [x] Call backend export endpoint
  - [x] Generate actual Excel download (.xlsx)
  - [x] Remove mock data
  - [x] Added proper column widths
  - [x] Added info card about export format

### P2 - MEDIUM ✅ DONE

#### 3. ~~Wire Up Dead Buttons~~ ✅ DONE

| Button | File | Backend Endpoint | Status |
|--------|------|------------------|--------|
| Add User | `users/page.tsx` | `POST /api/users` | ✅ Done |
| Delete User | `users/page.tsx` | `DELETE /api/users/:id` | ✅ Done |
| Add Session | `session/page.tsx` | `POST /api/sessions` | ✅ Done |
| Delete Session | `session/page.tsx` | `DELETE /api/sessions/:id` | ✅ Done |

#### 4. ~~Fix Session Page Filter~~ ✅ DONE
- **File:** `event-platform-fe/src/app/dashboard/event-group/[id]/session/page.tsx`
- **Completed:**
  - [x] Used SWR with proper endpoint
  - [x] Fixed field names (start_datetime, end_datetime)
  - [x] Added Add Session modal with form
  - [x] Added Delete Session functionality

#### 5. ~~Fix Bulk Delete Performance~~ ✅ DONE
- **File:** `event-platform-fe/src/app/dashboard/event-group/[id]/registration/page.tsx`
- **Fix:** Changed sequential `for` loop to `Promise.all()` for parallel execution

### P3 - LOW (Cleanup) ✅ DONE

#### 6. ~~Remove Debug Logging~~ ✅ DONE
- **Files:** `dashboard/page.tsx`, `event-group/[id]/page.tsx`, `event-group/page.tsx`
- **Completed:**
  - [x] Removed ~35 lines of `console.log`/`console.table` from production code
  - [x] Removed empty useEffect hooks

#### 7. ~~Remove Commented-Out Code~~ ✅ DONE
- **File:** `event-group/page.tsx`
- **Completed:**
  - [x] Removed 410 lines of dead code (old implementation)
  - [x] File reduced from 927 lines to 417 lines

#### 8. ~~Normalize API Calling Pattern~~ ✅ DONE
- **Files:** `dashboard/page.tsx`, `participant/page.tsx`, `event-group/page.tsx`
- **Completed:**
  - [x] Replaced raw `fetch()` with centralized `api.post()` / `api.delete()`
  - [x] Removed manual Authorization header injection (handled by api wrapper)
  - [x] Consistent error handling pattern across all pages

#### 9. ~~Fix Notification Pattern~~ ✅ DONE
- **File:** `participant/page.tsx`
- **Completed:**
  - [x] Replaced `alert()` with `toast.success()`/`toast.warning()`/`toast.error()`

#### 10. ~~Add Test Email Function~~ ✅ DONE
- **Backend:** `POST /api/test/email` (SUPER_ADMIN only)
- **Frontend:** `event-group/[id]/page.tsx` - Test Email section in workspace
- **Completed:**
  - [x] Created test email endpoint with SMTP validation
  - [x] Added test email UI in workspace overview
  - [x] 2 templates: Test (SMTP check) & Ticket (with QR code)
  - [x] Template selector dropdown

#### 11. ~~Replace Swagger UI with Scalar~~ ✅ DONE
- **Backend:** Replaced `@fastify/swagger-ui` with `@scalar/fastify-api-reference`
- **Docs URL:** `http://localhost:3001/docs`
- **OpenAPI JSON:** `http://localhost:3001/openapi.json`

---

## Backend Endpoints Reference

| Module | Endpoints | Status |
|--------|-----------|--------|
| Auth | `POST /login` | ✅ |
| Profile | `GET /me`, `PUT /me` | ✅ |
| Users | `GET /`, `POST /`, `GET /:id`, `PUT /:id`, `DELETE /:id` | ✅ |
| Event Groups | `GET /`, `POST /`, `GET /:id`, `PUT /:id`, `DELETE /:id` | ✅ |
| Events | `GET /`, `POST /`, `GET /:id`, `PUT /:id`, `DELETE /:id` | ✅ |
| Sessions | `GET /`, `POST /`, `GET /:id`, `PUT /:id`, `DELETE /:id` | ✅ |
| Registrations | `GET /`, `POST /`, `POST /bulk`, `GET /:id`, `PUT /:id`, `DELETE /:id`, `POST /:id/send-email`, `POST /bulk-send-email` | ✅ |
| Attendances | `GET /`, `POST /scan`, `POST /manual`, `POST /bulk` | ✅ |
| Participants | `GET /`, `POST /`, `GET /:id`, `GET /:id/history`, `PUT /:id`, `DELETE /:id` | ✅ |
| Analytics | `GET /dashboard` | ✅ |
| Test | `POST /email` | ✅ |

**Total:** 35 endpoints (all implemented with Zod validation)

---

## Known Bugs (All Fixed ✅)

| # | Bug | Severity | Status |
|---|-----|----------|--------|
| 1 | Session page ignores event_group_id filter | HIGH | ✅ Fixed |
| 2 | isLoading hardcoded to false | MEDIUM | ✅ Fixed |
| 3 | Inconsistent API pattern | MEDIUM | ✅ Fixed |
| 4 | Bulk delete sequential | MEDIUM | ✅ Fixed |
| 5 | Dead UI buttons | MEDIUM | ✅ Fixed |

---

## Development Roadmap

### Phase 1: Core Integration ✅ DONE
- [x] Auth flow (login, session, JWT)
- [x] Dashboard overview
- [x] Event Group CRUD
- [x] Sub-Event CRUD
- [x] Registration list & single create
- [x] Participant list & single create
- [x] Settings/Profile
- [x] QR Scanner to real API
- [x] Export page to real API

### Phase 1.5: Missing CRUD ✅ DONE
- [x] Session CRUD & filter fix
- [x] User management CRUD

### Phase 2: Polish & QA ✅ DONE
- [x] Remove debug logging
- [x] Clean up dead code
- [x] Normalize API patterns
- [x] Fix all notification patterns
- [x] Test email with templates
- [x] Scalar API docs
- [x] Bulk delete performance

### Phase 2.5: UI Overhaul & Design System ✅ DONE

#### 12. Design System Page & Shared Components
- **File baru:** `event-platform-fe/src/app/design-system/page.tsx`
- **File baru:** `docs/v2/design-system.md`
- **File update:** `event-platform-fe/src/components/dashboard/CustomCards.tsx`
- **Status:** ✅ DONE — 27 July 2026
- **Completed:**
  - [x] Buat halaman `/design-system` sebagai component showcase
  - [x] Buat `DESIGN_SYSTEM.md` dokumentasi lengkap
  - [x] Refactor shared components (`GlassCard`, `AnalyticCard`, `TableCard`, `ContentCard`, `ContentCardHeader`, `ContentCardBody`, `PageHeader`, `StatGrid`)
  - [x] Pastikan semua shadcn components terdokumentasi

#### 13. Fix UI Card Kosong & Konsistensi
- **Files:** `dashboard/page.tsx`, `event-group/page.tsx`, `event-group/[id]/page.tsx`
- **Status:** ✅ DONE — 27 July 2026
- **Completed:**
  - [x] Ganti semua `card-base` class (yang sudah dihapus dari CSS) ke shared components
  - [x] Konsistenkan stat cards di semua halaman pakai `StatCard`/`AnalyticCard`
  - [x] Fix card "Aksi Cepat" di overview workspace → `ContentCard` + `ContentCardHeader` + `ContentCardBody`
  - [x] Fix card "Statistik per Sub-Event" di overview workspace → `ContentCard`
  - [x] Standardisasi inline styles ke shared components
  - [x] Fix stat card di event-group page → `StatCard`
  - [x] Fix Email Settings & Preview cards → `ContentCard`

#### 14. Registrasi Tabel — Hapus Check-in/out, Tambah Jumlah Hadir
- **File:** `event-platform-fe/src/app/dashboard/event-group/[id]/registration/page.tsx`
- **Status:** ✅ DONE — 27 July 2026
- **Completed:**
  - [x] Hapus kolom Check In dan Check Out dari tabel
  - [x] Hapus helper functions: `getCheckInTime`, `getCheckOutTime`, `hasCheckedIn`, `hasCheckedOut`
  - [x] Hapus stat cards "Total Check In" dan "Total Check Out"
  - [x] Tambah kolom "Kehadiran" dengan format `{hadir}/{total} event`
  - [x] Hitung jumlah event yang dihadiri dari `reg.attendances` (group by event_id)
  - [x] Stat cards diganti: "Total Hadir" (ada kehadiran) dan "Belum Hadir" (belum ada kehadiran)

#### 15. Registrasi Detail — Fix Tombol Detail
- **File:** `event-platform-fe/src/app/dashboard/event-group/[id]/registration/page.tsx`
- **Status:** ✅ DONE — 27 July 2026
- **Completed:**
  - [x] Tambah state `isDetailModalOpen` dan `selectedRegistrationId`
  - [x] Fetch detail via API `GET /registrations/:id` (sudah ada backend)
  - [x] Buat dialog detail: info peserta, QR code, status, riwayat per sub-event
  - [x] Tampilkan attendances grouped by event (check-in/check-out time)
  - [x] Tambah `GET_REGISTRATION_DETAIL` ke `api-endpoints.ts`

#### 16. Registrasi Tambah Peserta — Ubah ke Checklist/Bulk
- **File:** `event-platform-fe/src/app/dashboard/event-group/[id]/registration/page.tsx`
- **Status:** ✅ DONE — 27 July 2026
- **Completed:**
  - [x] Ganti dialog single form ke checklist dialog
  - [x] Fetch peserta via `GET /participants?not_in_event_group={id}`
  - [x] Tampilkan tabel checkbox: Nama, Email, Perusahaan, Gender
  - [x] Tambah search/keyword filter
  - [x] Panggil `POST /registrations/bulk` untuk bulk register
  - [x] Hapus form state lama (participant_id, name, email, company, gender)
  - [x] Select All / Reset selection

### Phase 2.6: Date/Time Utility & Consistency ✅ DONE

#### 17. Date/Time Utility Functions
- **File:** `event-platform-fe/src/lib/utils.ts`
- **Status:** ✅ DONE — 28 July 2026
- **Completed:**
  - [x] Tambah `formatDate()` → output: "27 Jul 2026"
  - [x] Tambah `formatTime()` → output: "09:00 WIB"
  - [x] Tambah `formatDateTime()` → output: "27 Jul 2026, 09:00 WIB"
  - [x] Tambah `formatDateRange()` → output: "27 Jul 2026, 09:00 WIB - 17:00 WIB"
  - [x] Semua format menerima `Date | string` sebagai parameter

#### 18. Konsistensi Format Waktu "WIB" di Seluruh Halaman
- **Files:** 8 file diupdate
- **Status:** ✅ DONE — 28 July 2026
- **Completed:**
  - [x] `dashboard/page.tsx` → formatDate untuk event group dates
  - [x] `participant/page.tsx` → formatDate untuk event dates, formatTime untuk checkin/out
  - [x] `event-group/page.tsx` → formatDate untuk display dates
  - [x] `event-group/[id]/registration/page.tsx` → formatDateTime untuk riwayat kehadiran, formatDate untuk created_at
  - [x] `event-group/[id]/event/page.tsx` → formatDateTime untuk start/end dates
  - [x] `event-group/[id]/session/page.tsx` → formatDateTime untuk start/end dates
  - [x] `event-group/[id]/export/page.tsx` → formatDateTime untuk export timestamp
  - [x] Semua waktu sekarang menampilkan suffix "WIB"

#### 19. Perbesar Gap Riwayat Kehadiran
- **Files:** `registration/page.tsx`, `participant/page.tsx`
- **Status:** ✅ DONE — 28 July 2026
- **Completed:**
  - [x] Riwayat kehadiran di registrasi detail: `gap-4` → `gap-8`
  - [x] Riwayat kehadiran di participant: `gap-4` → `gap-6`
  - [x] Tambah `mb-1` pada label "Check In"/"Check Out" untuk spacing lebih rapi

#### 20. Session Page Dihalaman dari Sidebar
- **File:** `event-platform-fe/src/app/dashboard/layout.tsx`
- **Status:** ✅ DONE — 28 July 2026
- **Completed:**
  - [x] Sembunyikan menu "Sesi" dari sidebar navigation
  - [x] Halaman session masih bisa diakses via URL langsung

#### 21. Fix Registration Detail API Response Type
- **File:** `event-platform-fe/src/app/dashboard/event-group/[id]/registration/page.tsx`
- **Status:** ✅ DONE — 28 July 2026
- **Completed:**
  - [x] Fix `res.data` → `(res as any)` karena `api.get()` langsung return data
  - [x] TypeScript compilation clean

#### 22. Fix Check In/Out Button Disable Logic
- **Files:** `registration/page.tsx`
- **Status:** ✅ DONE — 28 July 2026
- **Completed:**
  - [x] Tambah helper `isFullyCheckedIn()`, `isFullyCheckedOut()`, `hasNotCheckedIn()`
  - [x] Tombol Check In disabled jika peserta sudah check-in di semua event
  - [x] Tombol Check Out disabled jika peserta sudah check-out di semua event atau belum check-in
  - [x] Tooltip dinamis menjelaskan kenapa tombol disabled

#### 23. Integration Participation Type ke Registration Flow
- **Files:** `registration.controller.ts`, `registration/page.tsx`
- **Status:** ✅ DONE — 28 July 2026
- **Completed:**
  - [x] Tambah `participation_type_id` ke `registerParticipantSchema` dan `bulkRegisterParticipantSchema`
  - [x] Simpan `participation_type_id` saat create registration (single & bulk)
  - [x] Include `participation_type` di response getRegistrations
  - [x] Tambah dropdown participation type di modal tambah peserta (registrasi)
  - [x] Fetch event group participation types via `GET_EVENT_GROUP_PARTICIPATION_TYPES`
  - [x] Update `RegistrationItem` interface dengan `participation_type`

#### 24. Membership Type UI di Participant Master
- **Files:** `participant/page.tsx`
- **Status:** ✅ DONE — 28 July 2026
- **Completed:**
  - [x] Tambah opsi "-- Tidak Ditentukan --" di dropdown membership type (create modal)
  - [x] Tampilkan membership type di detail modal participant
  - [x] Kolom "Membership" sudah ada di tabel participant

#### 25. Email Button di Registration Table
- **Files:** `registration/page.tsx`
- **Status:** ✅ DONE — 28 July 2026
- **Completed:**
  - [x] Tambah tombol Email per baris (icon Mail) di kolom Opsi
  - [x] Klik membuka modal pilih event + kirim email
  - [x] Bulk email juga menggunakan modal yang sama
  - [x] State `emailTargetIds` dan `emailMode` untuk handle single/bulk

#### 26. Fix Bulk Email Schema Alignment
- **Files:** `registration.controller.ts`, `registration/page.tsx`
- **Status:** ✅ DONE — 28 July 2026
- **Completed:**
  - [x] Frontend tidak lagi kirim `event_id` yang tidak terpakai
  - [x] Backend `bulkSendEmailSchema` menerima `registration_ids`, `subject`, `body`
  - [x] Email tiket menggunakan template `ticketEmailHtml()` yang konsisten

#### 27. Event Selector di Workspace Overview Email
- **Files:** `event-group/[id]/page.tsx`
- **Status:** ✅ DONE — 28 July 2026
- **Completed:**
  - [x] Tambah dropdown "Pilih Event" di bagian Test Email (hanya untuk template ticket)
  - [x] Event name dari dropdown digunakan di subject email
  - [x] Preview email juga menampilkan nama event yang dipilih
  - [x] Default: gunakan nama event group jika tidak ada event dipilih

#### 28. Vulnerability Fix & Dependency Update
- **Files:** `package.json` (BE & FE)
- **Status:** ✅ DONE — 28 July 2026
- **Completed:**
  - [x] Backend: upgrade `nodemailer` 8.0.11 → 9.0.3 (fix SSRF vulnerability)
  - [x] Frontend: `npm audit fix` — fix `@hono/node-server` + `@modelcontextprotocol/sdk`
  - [x] Sisa vuln: `@fastify/static` (swagger-ui only), `next` (needs major upgrade), `xlsx` (no fix)

#### 29. Email Template Konsisten (Preview ↔ Backend)
- **Files:** `src/lib/templates/ticket-email.ts` (BARU), `test.controller.ts`, `registration.controller.ts`, `event-group/[id]/page.tsx`
- **Status:** ✅ DONE — 28 July 2026
- **Completed:**
  - [x] Buat shared template `ticketEmailHtml()` dan `testEmailHtml()` di `src/lib/templates/ticket-email.ts`
  - [x] Update test controller untuk gunakan template baru
  - [x] Update registration controller untuk gunakan template baru
  - [x] Update email preview mockup di workspace overview (inline style, Email client header)
  - [x] Desain konsisten: header gradient, QR box, CTA button, footer

### Phase 3: Deployment (Next)
- [ ] Deploy backend to Railway
- [ ] Deploy frontend to Vercel
- [ ] Environment variables setup
- [ ] Final testing

### P5: Future Features
- [x] Send Email to Registration (`POST /api/registrations/:id/send-email`) ✅
- [x] Bulk Send Email (`POST /api/registrations/bulk-send-email`) ✅
- [ ] Bulk Import (Excel/CSV) for Participants
- [ ] RBAC Lanjutan (granular permissions)
- [x] Dashboard charts (Recharts) ✅

---

## Deployment Plan (Serverless)

| Component | Platform | Cost |
|-----------|----------|------|
| Frontend | Vercel | Free |
| Backend | Railway | Free ($5 credit/month) |
| Database | Railway PostgreSQL | Included |

---

*This document is auto-updated during development sessions.*
