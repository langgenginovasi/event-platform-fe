Saya pahami. Dari API publik yang ada sekarang, terlihat ada beberapa bagian yang sudah mendukung konsep baru, tetapi ada juga beberapa bagian yang perlu diubah agar lifecycle pengajuan DPT/Peninjau bisa berjalan tanpa mencampur data absensi dan website HIPMI.

Saya pecah menjadi:

Temuan dari API saat ini.
Perubahan konsep cek kepesertaan.
Perubahan API yang disarankan.
Perubahan naming controller/model.
1. Temuan dari API Publik Saat Ini
1.1 GET /api/public/daftar-pemilih-sementara

Saat ini:

{
  "membership_type": {
    "name": "Anggota Tetap",
    "slug": "anggota-tetap"
  }
}
Masalah

Field:

membership_type

sudah mulai ambigu.

Karena dari pembahasan kita:

Membership = status organisasi.
Registration Participation Status = status kepesertaan event.

Sedangkan endpoint ini mengembalikan data event group.

Sebaiknya:

{
  "membership_status": {
    "name": "Anggota Biasa",
    "slug": "anggota-biasa"
  },
  "participation_status": {
    "name": "DPS",
    "slug": "dps"
  }
}

Karena konteks endpoint adalah peserta event.

1.2 GET /api/public/participant/check-by-id

Saat ini:

{
  "found": true,
  "participant": {
     ...
  }
}

Ini hanya menjawab:

"Apakah orang ini ada di database participant?"

Belum menjawab:

ikut MUSCAB atau tidak?
status DPS/DPT?
sedang mengajukan perubahan?
pernah ditolak?
sudah approve?

Padahal kebutuhan website HIPMI adalah:

"Apakah saya terdaftar sebagai peserta MUSCAB dan bagaimana status saya?"

Jadi endpoint ini kurang tepat untuk flow utama.

1.3 GET /api/public/participant/check

Sebenarnya endpoint ini lebih dekat.

Karena sudah ada:

registration

Tetapi:

{
  "participation_type": {
    "name": "Peserta Tetap"
  }
}

masih menggunakan konsep lama.

Harus menjadi:

{
  "participation_status": {
    "name": "DPS",
    "slug": "dps"
  }
}
2. Konsep Baru Cek Kepesertaan

Menurut saya, flow website HIPMI jangan lagi:

Check ID
     |
     |
ambil participant

Tetapi:

Input E-KTA
     |
     |
Absensi API
     |
     |
Cari Registration pada Event Group MUSCAB
     |
     |
Tampilkan status lifecycle

Karena yang dicari adalah status kepesertaan event, bukan status member.

3. Response Cek Kepesertaan Baru

Saya bayangkan endpoint baru:

GET /api/public/event-groups/:id/participant/status

atau tetap extend:

GET /api/public/participant/check-by-id

Response (aktual, sudah diimplementasi):

{
  "found": true,


  "participant": {
    "id": "uuid",
    "name": "Peserta 1 Santoso",
    "company": "PT ABC",
    "identification_number": "3273"
  },


  "membership_status": {
    "name": "Anggota Biasa",
    "slug": "anggota-biasa"
  },


  "registration": {


    "event_group": {
      "id": "xxx",
      "name": "MUSCAB BPC HIPMI Kota Bandung"
    },


    "participation_status": {
      "name": "DPS",
      "slug": "dps"
    },


    "approval": {
      "status": "not_submitted",
      "label": "Belum Mengajukan"
    }


  }
}
4. Lifecycle Status Website HIPMI

Ini bagian yang belum ada.

Absensi hanya tahu:

DPS
DPT
Peninjau
Undangan

Tetapi website HIPMI perlu mengetahui proses:

DPS
 |
 |
Belum Mengajukan
 |
 |
Sedang Review
 |
 +-------------+
 |             |
 v             v
Approved     Rejected
 |
 |
Update Registration
 |
 |
DPT / Peninjau

Maka perlu ada data tambahan.

Bukan di Registration absensi.

Tetapi di website HIPMI.

Contoh:

Table:

participant_status_requests

atau kalau ingin dekat dengan fitur:

participant_registration_requests

Contoh:

participant_status_requests


id


participant_id


event_group_id


current_status
(DPS)


requested_status
(DPT/Peninjau)


approval_status
(pending/approved/rejected)


notes


approved_by


approved_at
5. Saat Approve Apa Yang Terjadi?

Flow:

Website HIPMI


Approve
   |
   |
Update request:
approval_status = approved


   |
   |
Call Absensi API


   |
   |
Update:


Registration.participation_status


DPS
 ↓
DPT

Jadi bukan:

Website menyimpan status final

Tetapi:

Website menyimpan proses approval
Absensi menyimpan status final peserta

Ini sesuai konsep:

Absensi tetap source of truth.

6. API Baru yang Dibutuhkan
Dari Absensi
GET status peserta

Untuk website:

GET /api/public/event-groups/{id}/participant/status

Response:

{
 "participant": {},
 "registration": {
    "participation_status": {
       "name":"DPS"
    }
 }
}
PUT internal update status

Bukan public:

PUT /api/internal/registrations/{id}/participation-status

Body:

{
 "participation_status":"peserta-utusan"
}

Dipanggil ketika approve.

7. Perubahan Model Naming

Dari Laravel website HIPMI:

Saat ini:

PesertaTetapRegistration
PesertaTetapController
PesertaTetapRegistrationController

Menurut saya sudah tidak sesuai.

Karena fitur sekarang bukan hanya peserta tetap.

Ada:

DPT
Peninjau
kemungkinan Utusan

Lebih general:

Model

Rename:

PesertaTetapRegistration

menjadi:

ParticipantStatusRequest

atau:

ParticipantRegistrationRequest

Saya lebih condong:

ParticipantStatusRequest

karena yang dilakukan adalah request perubahan status.

Controller

Dari:

PesertaTetapRegistrationController

menjadi:

ParticipantStatusRequestController

Untuk publik:

store()

untuk submit request.

Dari:

PesertaTetapController

menjadi:

ParticipantStatusApprovalController

karena tugasnya approval.

8. Perubahan Database Laravel

Dari:

peserta_tetap_registrations

menjadi:

participant_status_requests

Kolom:

Lama	Baru
participant_id	participant_id
nomor_kta	identification_number
status_keanggotaan	membership_status_snapshot
status_validasi	approval_status
notes	notes
validated_by	approved_by
validated_at	approved_at

Tambahan:

requested_status

contoh:

dpt
peninjau
Kesimpulan Perubahan Besar

Konsep akhirnya:

HIPMIGO
   |
   |
Absensi
   |
   |
Registration
   |
   |
Participation Status
   |
   |
Website HIPMI
   |
   |
Status Request
   |
   |
Approval
   |
   |
Update kembali ke Absensi

Jadi website HIPMI tidak menjadi pemilik status peserta, tetapi menjadi workflow approval layer.

Dan menurut saya ini yang paling konsisten dengan keputusan awal bahwa aplikasi absensi adalah sumber data utama.

---

## Status Implementasi

Dokumen ini adalah proposal awal. Seluruh konsep di atas sudah diimplementasikan (lihat `ALUR_STATUS_PESERTA.md`):

- **API**: `GET /api/public/event-groups/:id/participant/status` + `PUT /api/internal/registrations/:id/participation-status` — ✅ sudah ada (wajib API key).
- **Rename**: `PesertaTetapRegistration` → `ParticipantStatusRequest`, `PesertaTetapRegistrationController` → `ParticipantStatusRequestController`, `PesertaTetapController` → `ParticipantStatusApprovalController` — ✅ sudah.
- **DB**: tabel `peserta_tetap_registrations` → `participant_status_requests` + kolom `requested_status`, `membership_status_snapshot`, `registration_id` — ✅ sudah.
- **Response public API**: `membership_type` → `membership_status`, `participation_type` → `participation_status` — ✅ sudah.
- **Sync saat approve**: `approved` → `synced` / `update_failed` + retry manual — ✅ sudah.