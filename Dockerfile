# ─── Build Stage ──────────────────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app

# NEXT_PUBLIC_* di-inline saat build, jadi WAJIB dilewatkan sebagai build-arg.
# Contoh: docker build --build-arg NEXT_PUBLIC_API_URL=http://backend.internal:3001/api .
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ─── Runtime Stage ────────────────────────────────────────────────────────
FROM node:22-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
# Wajib di-set saat runtime (via -e / docker-compose / secrets / orchestrator).
# NEXTAUTH_URL = URL publik frontend (mis. https://app.example.com) — TANPA trailing slash.
ENV NEXTAUTH_SECRET=
ENV NEXTAUTH_URL=

COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/next.config.ts ./next.config.ts

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

CMD ["sh", "-c", "echo '[RUNTIME ENV] NEXT_PUBLIC_API_URL='$(test -n \"$NEXT_PUBLIC_API_URL\" && echo \"$NEXT_PUBLIC_API_URL\" || echo 'UNDEFINED (catatan: tidak berpengaruh ke bundle, nilai build yg dipakai)'); echo '[RUNTIME ENV] NEXTAUTH_URL='$(test -n \"$NEXTAUTH_URL\" && echo \"$NEXTAUTH_URL\" || echo 'UNDEFINED'); echo '[RUNTIME ENV] NEXTAUTH_SECRET='$(test -n \"$NEXTAUTH_SECRET\" && echo 'OK SET' || echo 'UNDEFINED'); exec npx next start -p 3000"]
