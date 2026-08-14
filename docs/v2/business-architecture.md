# Event Platform V2 — Business Flow & System Architecture

Status: Draft Final

Version: 2.0

---

# 🎯 Objective

Dokumen ini menjadi acuan utama pengembangan Event Platform V2 baik untuk Backend maupun Frontend.

V2 dibangun dengan pendekatan:

* Event Group Workspace Architecture
* Registration-Based Attendance System
* Context-Aware Operations
* Modular & Scalable Architecture

Dokumen ini mendefinisikan:

* Domain bisnis
* Hubungan antar entitas
* Alur operasional
* Konteks penggunaan sistem
* Acuan implementasi FE & BE

---

# 🧠 Core Architecture Shift

## V1 (Legacy)

V1 berpusat pada Event.

```text
Event
 ├── Participant
 ├── Attendance
 └── Reporting
```

Keterbatasan:

* Sulit mendukung multi-event
* Sulit mendukung session
* Participant terlalu terikat ke event
* Attendance tidak fleksibel

---

## V2 (New Architecture)

V2 berpusat pada Event Group.

```text
Event Group
 ├── Event
 │    └── Session (Optional)
 │
 ├── Registration
 │    └── Participant
 │
 └── Attendance
```

Prinsip utama:

* Participant adalah data global
* Registration adalah konteks keikutsertaan
* QR Code berasal dari Registration
* Attendance berasal dari Registration
* Event Group menjadi workspace utama

---

# 🏛 Core Domain Model

## Participant

Master data peserta.

Karakteristik:

* Global
* Tidak memiliki akun login
* Dapat digunakan kembali pada Event Group lain

Contoh:

```text
Muhammad Hafiz
Amel
Ira
```

---

## Event Group

Representasi acara utama.

Contoh:

```text
Muscab Kadin Jawa Barat
Rakercab
Seminar Nasional
Conference 2027
```

Karakteristik:

* Workspace utama
* Memiliki rentang tanggal
* Menjadi konteks seluruh aktivitas

---

## Event

Sub-kegiatan dalam Event Group.

Contoh:

```text
Registrasi
Sidang Pleno I
Sidang Pleno II
Gala Dinner
Penutupan
```

Karakteristik:

* Wajib berada dalam Event Group
* Menjadi target attendance

---

## Session (Optional)

Agenda detail dalam Event.

Contoh:

```text
Pembukaan
Presentasi
Diskusi
Closing
```

Digunakan apabila attendance perlu lebih granular.

---

## Registration

Entitas inti V2.

Relasi:

```text
Participant
      ↕
 Registration
      ↕
 Event Group
```

Fungsi:

* Menghubungkan Participant dengan Event Group
* Menghasilkan QR Code unik
* Menjadi sumber validasi attendance
* Menjadi sumber reporting

Prinsip:

```text
1 Participant
      ↓
1 Registration
      ↓
1 QR
      ↓
1 Event Group
```

---

## Attendance

Log kehadiran peserta.

Relasi:

```text
Registration
      ↓
Attendance
      ↓
Event / Session
```

Karakteristik:

* Append-only
* Audit-friendly
* Mencatat operator yang melakukan scan

---

# 🔐 User & Access Control

## Super Admin

Fokus:

Pengelolaan platform.

Hak akses:

* Manage Users
* Manage Settings
* Full access seluruh Event Group
* Full access seluruh Attendance
* Full access seluruh Reporting

---

## Event Admin

Fokus:

Pengelolaan acara.

Hak akses:

* Manage Event Group
* Manage Event
* Manage Registration
* Manage Participant
* Attendance Management
* Reporting & Export

Tidak memiliki akses:

* User Management
* System Settings

---

## Operator

Fokus:

Operasional lapangan.

Hak akses:

* View Event Group
* View Event
* View Registration
* View Attendance
* QR Scan
* Manual Check In
* Manual Check Out
* View Statistics

Tidak memiliki akses:

* Create/Edit/Delete Event Group
* Create/Edit/Delete Event
* Create/Edit/Delete Participant
* Export Report
* User Management
* System Settings

---

# 🔄 Business Flow

## FASE 0 — Event Planning

Tahap perencanaan acara.

### Step 1

Membuat Event Group

```text
Create Event Group
```

Contoh:

```text
Muscab Kadin Jawa Barat 2027
```

---

### Step 2

Membuat Event

```text
Registrasi
Sidang Pleno I
Sidang Pleno II
Gala Dinner
Penutupan
```

---

### Step 3

Membuat Session (Opsional)

```text
Pembukaan
Presentasi
Diskusi
```

---

# FASE 1 — Setup & Registration

Tahap persiapan peserta.

---

## Step 1

Import atau membuat Participant.

```text
Participants
```

Status:

Global Master Data

---

## Step 2

Mendaftarkan peserta ke Event Group.

```text
Bulk Registration
```

Proses:

```text
Participant
      ↓
Registration
      ↓
Event Group
```

---

## Step 3

Generate QR Code.

Sistem membuat:

```text
UUID
```

untuk setiap Registration.

---

## Step 4

Distribusi tiket.

Metode:

```text
Email Service (SMTP)
```

Output:

```text
QR Code
```

dikirim ke peserta.

---

# FASE 2 — Event Execution

Tahap operasional lapangan.

---

## Workspace Mode

User masuk ke Event Group tertentu.

Contoh:

```text
/dashboard/event-group/123
```

Seluruh aktivitas setelahnya berada dalam konteks Event Group tersebut.

---

# Attendance Method 1 — QR Scan

Metode utama.

---

## Step 1

Masuk ke menu:

```text
Scan
```

---

## Step 2

Pilih Event.

Contoh:

```text
Registrasi
Sidang Pleno I
Gala Dinner
```

---

## Step 3

Pilih Attendance Type.

```text
Check In
Check Out
```

---

## Step 4

Scan QR.

Validasi:

```text
Registration valid?
Belum check-in?
Belum check-out?
Masih aktif?
```

---

## Step 5

Simpan Attendance.

Data yang tersimpan:

```text
registration_id
event_id
attendance_type
scanned_by_user_id
scanned_at
```

---

# Attendance Method 2 — Manual Attendance

Metode alternatif.

Digunakan untuk:

* QR tidak terbaca
* Peserta lupa QR
* Kendala perangkat
* Verifikasi manual

---

## Step 1

Masuk ke:

```text
Registrations
```

---

## Step 2

Cari peserta.

---

## Step 3

Lakukan:

```text
Manual Check In
```

atau

```text
Manual Check Out
```

---

## Step 4

Simpan Attendance.

Tetap menghasilkan Attendance Log yang sama dengan metode QR.

---

# FASE 3 — Reporting & Analytics

Tahap evaluasi dan pelaporan.

---

## Dashboard Analytics

Ringkasan Event Group.

---

### Registration Metrics

```text
Total Registered
Total Active
Total Cancelled
```

---

### Attendance Metrics

```text
Total Check In
Total Check Out
Attendance Rate
```

---

### Event Performance

Contoh:

```text
Registrasi
150 hadir

Sidang Pleno I
145 hadir

Sidang Pleno II
138 hadir

Gala Dinner
120 hadir
```

---

## Export Data

Format:

```text
Excel
CSV
```

Data:

```text
Registrations
Attendance
Participants
```

---

# 🖥 Frontend Architecture Principle

Frontend menggunakan:

```text
Context-Aware Workspace
```

Mode:

```text
Global Mode
Workspace Mode
```

---

## Global Mode

Digunakan untuk:

* Dashboard
* Event Group List
* Participant Master Data
* User Management
* Settings

---

## Workspace Mode

Digunakan untuk:

* Event Management
* Registration Management
* Attendance
* Scan QR
* Reporting

---

# ⚙ Backend Architecture Principle

Backend menjadi pemilik seluruh business logic.

Frontend hanya menampilkan hasil.

---

## Backend Responsibility

* Authentication
* Authorization
* Registration Logic
* QR Validation
* Attendance Validation
* Reporting
* Export Processing

---

## Frontend Responsibility

* User Interface
* Form Handling
* Data Presentation
* Workspace Navigation
* Permission-Based UI

---

# 🔒 Security Principle

Permission di Frontend hanya untuk UX.

Seluruh validasi wajib dilakukan ulang di Backend.

Contoh:

```text
Operator mencoba export data
```

Backend harus mengembalikan:

```text
403 Forbidden
```

meskipun tombol export disembunyikan di Frontend.

---

# 🚀 Final Direction

Event Platform V2 diposisikan sebagai:

Platform Event Management berbasis Event Group Workspace dengan Registration sebagai entitas inti, yang mendukung attendance berbasis QR, pelaporan terstruktur, serta siap dikembangkan menuju skala enterprise dan multi-organisasi di masa depan.
