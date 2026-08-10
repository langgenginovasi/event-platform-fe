# Event Platform Frontend (V2)

Frontend untuk **Event Platform V2** — sistem manajemen acara dan absensi digital berbasis *Event Group Workspace*. Repositori ini adalah pengganti frontend V1 (yang terikat dengan response Strapi) dengan arsitektur decoupled yang berkomunikasi dengan backend Fastify melalui REST API.

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Framework | Next.js 16 App Router + TypeScript |
| Styling | Tailwind CSS v4 + Glassmorphism UI |
| Data Fetching | SWR + Axios |
| Auth | NextAuth v4 (Credentials Provider, JWT) |
| UI Components | shadcn/ui, @base-ui/react, lucide-react |
| Chart & Export | Recharts, xlsx |
| QR Scanner | html5-qrcode |

## Prasyarat

- Node.js 20+
- Backend **event-platform-be** sudah berjalan di `http://localhost:3001`

## Setup Lokal

1. Clone repo dan install dependencies:

   ```bash
   npm install
   ```

2. Salin `.env.example` menjadi `.env` lalu sesuaikan:

   ```bash
   cp .env.example .env
   ```

   ```env
   NEXT_PUBLIC_API_URL="http://localhost:3001/api"
   NEXTAUTH_SECRET="super-secret-nextauth-key-change-in-production"
   NEXTAUTH_URL="http://localhost:3000"
   ```

   > Ganti `NEXT_PUBLIC_API_URL` dengan URL backend saat deployment.

3. Jalankan development server:

   ```bash
   npm run dev
   ```

   Buka `http://localhost:3000` untuk mengakses aplikasi.

## Scripts

| Script | Deskripsi |
|--------|-----------|
| `npm run dev` | Development server dengan hot-reload |
| `npm run build` | Production build |
| `npm run start` | Menjalankan production build |
| `npm run lint` | ESLint |

## Deployment (Docker / Dokploy)

Dockerfile menggunakan **multi-stage build** (`next build` di stage `build`). Karena
`NEXT_PUBLIC_API_URL` di-inline oleh Next.js **saat build**, nilai tersebut wajib
dilewatkan sebagai **Build Argument** — bukan hanya runtime env.

```bash
docker build \
  --build-arg NEXT_PUBLIC_API_URL=https://api.domain-anda.com/api \
  -t event-platform-fe .
docker run -p 3000:3000 \
  -e NEXTAUTH_SECRET="<secret>" \
  -e NEXTAUTH_URL="https://app.domain-anda.com" \
  -e NEXT_PUBLIC_API_URL="https://api.domain-anda.com/api" \
  event-platform-fe
```

> Di Dokploy: set `NEXT_PUBLIC_API_URL` pada bagian **Build** (build args), bukan
> hanya di runtime env. `NEXT_PUBLIC_API_URL` tetap dibutuhkan di runtime karena
> dipakai juga oleh NextAuth (`/api/auth/[...nextauth]`) yang membaca env saat runtime.

### Verifikasi hasil build

Setelah build, pastikan bundle tidak lagi memuat fallback `localhost:3001`:

```bash
grep -r "localhost:3001" .next/static && echo "MASIH ADA FALLBACK" || echo "OK - pakai nilai env"
```

## Struktur Folder

```
event-platform-fe/
├── public/                        # Static assets
├── src/
│   ├── app/                       # Next.js App Router (routing)
│   │   ├── layout.tsx             # Root layout (Server Component)
│   │   ├── page.tsx               # Login page
│   │   ├── globals.css            # Global styles
│   │   ├── api/auth/[...nextauth]/route.ts   # NextAuth handler
│   │   └── dashboard/             # Dashboard shell + feature pages
│   ├── components/
│   │   ├── ui/                    # Layer 1: shadcn/ui primitives
│   │   ├── shared/                # Layer 2: App-wide reusable components
│   │   └── features/              # Layer 3: Domain-specific components
│   ├── hooks/                     # Custom React hooks (usePermissions, use*Actions)
│   ├── lib/                       # API client, fetcher, api-endpoints, helpers
│   └── types/                     # TypeScript type definitions
└── docs/STRUCTURE.md              # Aturan struktur & coding patterns
```

## Fitur Dashboard

Dashboard bersifat *context-aware* berdasarkan Event Group workspace:

- **Event Group** — daftar & pembuatan Event Group (workspace)
- **Workspace Overview** — statistik, chart, dan pengaturan email
- **Registration** — registrasi peserta, bulk action, check-in/check-out, kirim email tiket QR
- **Event & Session** — manajemen sub-event dan sesi
- **Scan** — pemindaian QR code peserta dengan kamera
- **Export** — ekspor data registrasi/absensi ke Excel
- **Participant** — data master peserta (global)
- **Users** — manajemen user (Super Admin)
- **Settings** — akun, membership types, participation types

## Akun Login

Gunakan akun seed dari backend (password: `password123`):

- `superadmin@event.local` — SUPER_ADMIN
- `admin@event.local` — EVENT_ADMIN
- `operator@event.local` — OPERATOR

## Lisensi

TBD — kontak pemilik repositori untuk detail lisensi.
