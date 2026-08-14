# Business Logic — Integrasi 3 Website

**Date:** 15 August 2026  
**Status:** Draft — Menunggu Approval  
**Revisi:** 1 — Koreksi flow integrasi

---

## Daftar Isi

1. [Overview](#overview)
2. [Arsitektur](#arsitektur)
3. [Split Responsibility](#split-responsibility)
4. [Business Logic per Domain](#business-logic-per-domain)
5. [Endpoint Strategy](#endpoint-strategy)
6. [Data Flow Diagram](#data-flow-diagram)
7. [Phase Implementation](#phase-implementation)
8. [Risk & Mitigation](#risk--mitigation)

---

## Overview

Sistem informasi HIPMI Kota Bandung terdiri dari 3 website yang saling terintegrasi secara **berjenjang**:

| Website | URL | Fungsi | Source of Truth |
|---------|-----|--------|-----------------|
| **hipmigo** | — | Pusat Pengelolaan Data Anggota | Data Anggota, Membership, e-KTA |
| **absensi.hipmibdg.or.id** | absensi.hipmibdg.or.id | Event & Absensi | Event, Registrasi, Kehadiran |
| **hipmibdg.or.id** | hipmibdg.or.id | Company Profile HIPMI | Tampilan publik data |

### Aliran Data

```
hipmigo (pusat data anggota)
    │
    ▼  Data anggota di-pull
absensi.hipmibdg.or.id (event + absensi)
    │
    ▼  Data event/kehadiran di-pull
hipmibdg.or.id (company profile)
```

**Prinsip:** Data bersifat **on-demand pull** melalui **public API** (tanpa autentikasi, read-only).

---

## Arsitektur

```
┌─────────────────────────────────────────────────────────────┐
│                    INTEGRASI 3 WEBSITE                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐                                       │
│  │    hipmigo       │                                       │
│  │  (Pusat Data     │                                       │
│  │   Anggota)       │                                       │
│  └────────┬─────────┘                                       │
│           │                                                 │
│           │  Data Anggota                                   │
│           │  (email, nama, KTA, membership)                 │
│           ▼                                                 │
│  ┌──────────────────────────────┐                           │
│  │  absensi.hipmibdg.or.id     │                           │
│  │  (Event + Absensi)           │                           │
│  │                              │                           │
│  │  Source of Truth:            │                           │
│  │  - Event, Registrasi         │                           │
│  │  - Kehadiran (absensi)       │                           │
│  │  - QR Code                   │                           │
│  └────────┬─────────────────────┘                           │
│           │                                                 │
│           │  Data Event & Kehadiran                         │
│           │  (daftar event, DPS, statistik absensi)         │
│           ▼                                                 │
│  ┌──────────────────┐                                       │
│  │  hipmibdg.or.id  │                                       │
│  │  (Company Profile)│                                      │
│  │                              │                           │
│  │  Menampilkan:                │                           │
│  │  - Profil anggota            │                           │
│  │  - Daftar event              │                           │
│  │  - Status kehadiran          │                           │
│  └──────────────────┘                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Split Responsibility

### 1. hipmigo — Source of Truth: Data Anggota

hipmigo adalah **pusat pengelolaan data anggota** HIPMI. Semua data keanggotaan berasal dari sini.

| Data | Keterangan | Format |
|------|------------|--------|
| Nama Anggota | Identitas lengkap | String |
| Email | Unique identifier | String (unique) |
| Gender | L/P | Enum |
| Perusahaan | Asal perusahaan | String |
| Tipe Identitas | KTP/KTA/Passport/Other | Enum |
| Nomor Identitas | e-KTA, KTP, dll | String (nullable) |
| Tipe Keanggotaan | Tetap/Biasa/Luar Biasa | FK → MembershipType |
| Foto Profil | Image URL | String (nullable) |

**Kapan data ini di-pull?**
- Saat admin absensi membuat registrasi → cek apakah peserta sudah ada di sistem
- Saat validasi e-KTA → cek nomor identitas
- Saat import peserta dari CSV → lookup existing anggota

### 2. absensi.hipmibdg.or.id — Source of Truth: Event & Absensi

absensi.hipmibdg.or.id adalah **sistem utama untuk event dan absensi**. Mengambil data anggota dari hipmigo, lalu menyimpan data event dan kehadiran.

| Data | Keterangan | Format |
|------|------------|--------|
| Event Group | Kumpulan event (misal: Kongres) | Object |
| Event | Acara dalam event group | Object |
| Session | Sesi dalam event | Object |
| Registrasi | Pendaftaran peserta ke event | Object |
| Kehadiran | Check-in / Check-out | Object |
| QR Code | Tiket masuk unik | UUID |

**Kapan data ini di-pull?**
- Saat hipmibdg.or.id menampilkan daftar event → pull event list
- Saat hipmibdg.or.id menampilkan DPS → pull daftar pemilih
- Saat hipmibdg.or.id menampilkan statistik kehadiran → pull attendance

### 3. hipmibdg.or.id — Tampilan Publik (Company Profile)

hipmibdg.or.id adalah **website company profile** yang menampilkan data dari absensi.hipmibdg.or.id. Tidak memiliki database sendiri, semua data di-pull on-demand.

| Fitur | Data yang Ditampilkan | Sumber |
|-------|----------------------|--------|
| Profil Anggota | Nama, foto, perusahaan, status keanggotaan | absensi (→ hipmigo) |
| Daftar Event | Nama, tanggal, jumlah peserta | absensi |
| DPS | Daftar pemilih sementara | absensi |
| Status Registrasi | Apakah sudah terdaftar di event | absensi |
| Kehadiran | Rekap absensi per event | absensi |

---

## Business Logic per Domain

### Domain 1: Manajemen Anggota (hipmigo → absensi)

```
hipmigo (create/update anggota)
    │
    ▼  Data anggota di-pull
absensi.hipmibdg.or.id (pull on-demand via public API)
    │
    ├── GET /member/check (validasi keanggotaan by email)
    ├── GET /participant/check-by-email (lookup by email)
    ├── GET /participant/check-by-id (lookup by KTA)
    └── GET /participant/detail (profil lengkap + riwayat)
```

**Aturan Bisnis:**
1. Anggota yang terdaftar di hipmigo bisa langsung didaftarkan di absensi
2. Email digunakan sebagai unique identifier utama (bukan ID)
3. Jika anggota belum ada di absensi, sistem akan auto-create saat registrasi pertama kali
4. Tipe keanggotaan (Tetap/Biasa/Luar Biasa) menentukan auto-assign participation type
5. Data anggota bersifat **read-only** di absensi — tidak bisa diubah dari sini

### Domain 2: Event & Registrasi (absensi → hipmibdg.or.id)

```
absensi.hipmibdg.or.id (create event & registrasi)
    │
    ▼  Data event di-pull
hipmibdg.or.id (pull on-demand via public API)
    │
    ├── GET /event-groups (daftar event)
    ├── GET /event-groups/:id (detail event)
    ├── GET /event-groups/:id/events (event + sesi)
    ├── GET /event-groups/:id/registrations (daftar peserta)
    ├── GET /event-groups/:id/attendance (statistik kehadiran)
    └── GET /daftar-pemilih-sementara (DPS)
```

**Aturan Bisnis:**
1. Event group memiliki event-event di dalamnya
2. Setiap event memiliki sesi-sesi
3. Peserta mendaftar ke event group (bukan ke event individual)
4. QR Code unik dibuat per registrasi
5. Kehadiran dicatat per event (check-in dan check-out)
6. Data event bersifat **read-only** di hipmibdg.or.id

### Domain 3: Absensi & Kehadiran

```
absensi.hipmibdg.or.id (record kehadiran via scan QR)
    │
    ├──→ hipmibdg.or.id (pull statistik kehadiran untuk ditampilkan)
    │    └── GET /event-groups/:id/attendance
    │
    └──→ hipmigo (pull riwayat kehadiran per anggota untuk monitoring)
         └── GET /participant/:id/attendance
```

**Aturan Bisnis:**
1. Check-in: Scan QR → sistem catat waktu + event + session
2. Check-out: Scan QR lagi → sistem catat waktu keluar
3. Satu peserta bisa check-in di multiple events dalam 1 event group
4. Kehadiran dihitung berdasarkan jumlah check-in (bukan checkout)
5. Checkout bersifat opsional (tidak semua event mencatat checkout)

### Domain 4: Auto Role Mapping

```
Saat registrasi di absensi:
    participant.membership_type (dari hipmigo) → lookup mapping → participant.participation_type

Mapping:
    anggota-luar-biasa  →  undangan
    anggota-biasa       →  peserta-utusan
    calon-undangan      →  undangan-resmi

Aturan:
    1. Mapping hanya berlaku saat create registrasi
    2. Admin bisa override manual
    3. Jika participation type tidak tersedia di event group → set null
```

---

## Endpoint Strategy

### Prinsip

| Prinsip | Penjelasan |
|---------|------------|
| **Public (No Auth)** | Semua endpoint bisa diakses tanpa autentikasi |
| **Read-Only** | Hanya GET, tidak ada POST/PUT/DELETE |
| **On-Demand** | Data di-pull saat dibutuhkan, bukan push |
| **Rate Limited** | 300 req/min per IP (global default) |
| **RESTful** | Konsisten dengan konvensi REST |

### Endpoint Map

#### Endpoint yang Sudah Ada (7 endpoints)

| # | Endpoint | Fungsi | Consumer |
|---|----------|--------|----------|
| 1 | `GET /event-groups` | Daftar semua event | hipmibdg.or.id |
| 2 | `GET /participant/check` | Cek registrasi by email | hipmibdg.or.id |
| 3 | `GET /participant/check-by-id` | Lookup anggota by KTA | hipmigo |
| 4 | `GET /participant/check-by-email` | Lookup anggota by email | hipmigo |
| 5 | `GET /participant/detail` | Profil lengkap + riwayat | hipmigo |
| 6 | `GET /member/check` | Validasi keanggotaan | hipmigo |
| 7 | `GET /daftar-pemilih-sementara` | DPS untuk event | hipmibdg.or.id |

#### Endpoint yang Perlu Ditambah (6 endpoints baru)

| # | Endpoint | Fungsi | Consumer |
|---|----------|--------|----------|
| 8 | `GET /event-groups/:id` | Detail 1 event group | hipmibdg.or.id |
| 9 | `GET /event-groups/:id/events` | Event + sesi dalam 1 group | hipmibdg.or.id |
| 10 | `GET /event-groups/:id/attendance` | Statistik kehadiran | hipmibdg.or.id |
| 11 | `GET /event-groups/:id/registrations` | Daftar peserta (filterable) | hipmibdg.or.id |
| 12 | `GET /participant/:id/attendance` | Kehadiran 1 anggota di 1 event group | hipmigo |
| 13 | `GET /analytics/summary` | Statistik agregat publik | hipmibdg.or.id |

---

## Data Flow Diagram

### Flow 1: Pendaftaran Anggota Baru

```
1. Anggota buka hipmibdg.or.id → lihat daftar event
2. Klik "Daftar" → redirect ke absensi.hipmibdg.or.id
3. Absensi pull data anggota dari hipmigo (via public API)
   └── GET /member/check?email=xxx
4. Absensi pull event dari absensi (data sendiri)
5. Anggota mengisi form → submit registrasi
6. Absensi create registrasi + generate QR code
7. Email tiket dikirim ke anggota
```

### Flow 2: Absensi di Lokasi

```
1. Peserta datang ke lokasi acara
2. Panitia buka aplikasi scan QR (absensi.hipmibdg.or.id)
3. Peserta tunjukkan QR code dari email
4. Panitia scan → sistem validasi QR
5. Sistem catat: registration_id, event_id, session_id, type=checkin, timestamp
6. Data kehadiran tersimpan di absensi
7. hipmibdg.or.id bisa pull statistik kehadiran secara real-time
```

### Flow 3: Monitoring Keanggotaan (hipmigo)

```
1. Admin hipmigo ingin cek riwayat kehadiran anggota
2. Buka hipmigo → masukkan email/nomor KTA
3. hipmigo pull data dari absensi (via public API)
   └── GET /participant/detail?identification_number=xxx
4. Tampilkan: profil anggota + riwayat event + status kehadiran
```

### Flow 4: Company Profile (hipmibdg.or.id)

```
1. Pengunjung buka hipmibdg.or.id
2. Lihat daftar event (pull dari absensi)
   └── GET /event-groups
3. Klik 1 event → lihat detail, jumlah peserta, statistik kehadiran
   └── GET /event-groups/:id
   └── GET /event-groups/:id/attendance
4. Lihat DPS (Daftar Pemilih Sementara) untuk event tertentu
   └── GET /daftar-pemilih-sementara?event_group_id=xxx
5. Semua data di-pull on-demand dari absensi
```

### Ringkasan Aliran Data

```
┌─────────────┐     pull anggota      ┌─────────────────────────┐     pull event     ┌─────────────────┐
│   hipmigo   │ ────────────────────► │ absensi.hipmibdg.or.id │ ──────────────────► │ hipmibdg.or.id  │
│             │                       │                         │                     │                 │
│ Data Anggota│ ◄──────────────────── │ Data Event & Absensi    │ ◄───────────────── │ Company Profile │
│ Membership  │     (read-only)       │ Registrasi              │     (display only)  │ Tampilan Publik │
│ e-KTA       │                       │ Kehadiran               │                     │                 │
└─────────────┘                       └─────────────────────────┘                     └─────────────────┘
```

---

## Phase Implementation

### Phase 1: Backend — Public API Expansion

**Estimasi:** 2-3 hari  
**File:** `src/modules/public/public.controller.ts` + `public.route.ts`

| Task | Endpoint | Consumer | Detail |
|------|----------|----------|--------|
| 1.1 | `GET /event-groups/:id` | hipmibdg.or.id | Detail event group + count event |
| 1.2 | `GET /event-groups/:id/events` | hipmibdg.or.id | Event + session list |
| 1.3 | `GET /event-groups/:id/attendance` | hipmibdg.or.id | Statistik kehadiran aggregate |
| 1.4 | `GET /event-groups/:id/registrations` | hipmibdg.or.id | Daftar peserta filterable |
| 1.5 | `GET /participant/:id/attendance` | hipmigo | Kehadiran 1 anggota di 1 event group |
| 1.6 | `GET /analytics/summary` | hipmibdg.or.id | Statistik agregat publik |
| 1.7 | Register routes | — | Update `public.route.ts` |
| 1.8 | Zod schemas | — | Validasi input untuk semua endpoint baru |

### Phase 2: Backend — Documentation

**Estimasi:** 1 hari

| Task | File | Detail |
|------|------|--------|
| 2.1 | Update `docs/PUBLIC_API.md` | Dokumentasi semua 13 endpoints |
| 2.2 | Buat `docs/INTEGRATION_GUIDE.md` | Panduan integrasi untuk tim hipmibdg & hipmigo |

### Phase 3: Integration Testing

**Estimasi:** 1-2 hari

| Task | Keterangan |
|------|------------|
| 3.1 | Test semua 13 public endpoints |
| 3.2 | Test rate limiting (300 req/min) |
| 3.3 | Test edge cases (data tidak ada, parameter salah) |
| 3.4 | Mock integrasi: absensi → hipmibdg.or.id |
| 3.5 | Mock integrasi: hipmigo → absensi |

### Phase 4: Deployment & Monitoring

**Estimasi:** 1 hari

| Task | Keterangan |
|------|------------|
| 4.1 | Deploy backend ke production |
| 4.2 | Share API docs ke tim hipmibdg.or.id |
| 4.3 | Share API docs ke tim hipmigo |
| 4.4 | Monitor usage & rate limiting |

---

## Risk & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Rate limit terlalu rendah | hipmibdg.or.id tidak bisa akses data | Monitor usage, tingkatkan limit jika perlu |
| Data anggota tidak sinkron | Anggota tidak bisa daftar event | Auto-create participant saat registrasi pertama |
| Public API disalahgunakan (scraping) | Performa menurun | Tambah CAPTCHA atau API key jika diperlukan |
| Perubahan schema tanpa notice | Integrasi breaking | Versioning API (/api/public/v2/) |
| QR code bocor | Kehadiran palsu | Validasi di lokasi (nama + KTA) |
| hipmigo down | Absensi tidak bisa pull data anggota | Cache data anggota lokal, fallback ke data existing |

---

## Status Dokumen

| Item | Status |
|------|--------|
| Business Logic | ✅ Draft |
| Endpoint Specification | ✅ Draft |
| Phase Plan | ✅ Draft |
| Review dari Tim | ⏳ Menunggu |
| Approval | ⏳ Menunggu |
| Implementasi | ⏳ Belum Mulai |
