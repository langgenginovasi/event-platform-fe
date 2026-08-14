# Architecture Decision Records (ADR)

**Last Updated:** 28 July 2026

---

## 1. Platform Transformation (V1 → V2)

### Latar Belakang

Event Platform (V1) dibangun menggunakan Headless CMS (Strapi) + Next.js. Terbukti efektif untuk MVP, namun seiring meningkatnya skala acara, sistem perlu berevolusi.

### Rasionalisasi

#### A. Skalabilitas Tinggi
Sistem V1 berbasis CMS, rentan bottleneck saat lonjakan traffic (check-in serentak).
- **Solusi V2:** Custom Backend (Fastify + Prisma) + PostgreSQL. Performa jauh lebih cepat, latensi rendah.

#### B. Keamanan & Integritas Data
Logika bisnis dinamis sulit diimplementasikan aman di CMS standar.
- **Solusi V2:** Backend khusus, QR Code dengan UUID aman, relasi data dijamin konsisten oleh database relasional.

#### C. Pengalaman Pengguna Kelas Enterprise
Antarmuka V1 kaku, terikat struktur data CMS.
- **Solusi V2:** Decoupled Architecture, Workspace System, Glassmorphism UI.

#### D. Efisiensi Operasional
Proses pengelolaan peserta sebelumnya lambat.
- **Solusi V2:** Komponen custom responsif, bulk actions ditangani backend efisien.

### Kesimpulan

Evolusi ke V2 adalah investasi strategis — memastikan platform siap untuk acara berskala raksasa secara stabil dan aman.

---

## 2. Tech Stack Comparison (V1 vs V2)

### Backend

| Aspect | V1 (Legacy) | V2 (Modern) |
|--------|-------------|-------------|
| Framework | Strapi 4.15 (Headless CMS) | Fastify v5 + Zod |
| Database | MySQL / SQLite | PostgreSQL + Prisma ORM v5 |
| Auth | Strapi `users-permissions` plugin | Custom JWT Authorization |
| Email | `@strapi/provider-email-nodemailer` | `nodemailer` via Brevo SMTP |
| QR Crypto | `crypto-js` AES-256 (prefix `astra-`) | Random UUIDv4 (tidak bisa ditebak/didekripsi) |
| Characteristics | Tightly coupled dengan Strapi | Clean Architecture, 100% type-safe |

### Frontend

| Aspect | V1 (Legacy) | V2 (Modern) |
|--------|-------------|-------------|
| Framework | Next.js (terikat Strapi response) | Next.js 14+ App Router + TypeScript |
| Styling | CSS Tradisional / Tailwind dasar | Tailwind CSS v4 + Glassmorphism |
| Data Fetching | Standard REST Fetch | SWR & Axios |
| State Mgmt | Basic | React Hook Form + Zod |
| Auth | - | NextAuth v4 (Credentials Provider) |
| Characteristics | Desain basic, navigasi Event-centric | Context-Aware Workspace, premium enterprise UI |

### Kesimpulan

Peralihan dari Strapi (V1) ke Fastify+Prisma (V2) didorong kebutuhan **skalabilitas dan kemerdekaan arsitektur**. V2 memberikan kontrol 100% atas query database, struktur response API, keamanan QR, dan estetika UI/UX.
