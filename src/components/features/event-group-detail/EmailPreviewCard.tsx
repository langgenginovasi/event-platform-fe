"use client";

import { Eye } from "lucide-react";
import { ContentCard, ContentCardBody } from "@/components/shared/CustomCards";

interface EmailPreviewCardProps {
  emailSubject: string;
  emailBody: string;
  selectedEventName: string;
}

export function EmailPreviewCard({
  emailSubject,
  emailBody,
  selectedEventName,
}: EmailPreviewCardProps) {
  const resolvedSubject = (emailSubject || "Undangan {{event_group_name}}")
    .replace(/\{\{event_name\}\}/g, selectedEventName || "Nama Event")
    .replace(/\{\{event_group_name\}\}/g, selectedEventName || "Nama Event");

  const resolvedBody = emailBody
    .replace(/\{\{name\}\}/g, "Bapak/Ibu Contoh")
    .replace(/\{\{event_name\}\}/g, selectedEventName || "Nama Event")
    .replace(/\{\{event_group_name\}\}/g, selectedEventName || "Nama Event");

  return (
    <ContentCard className="flex flex-col bg-gray-50">
      <div className="p-5 border-b border-gray-200 bg-gray-100/50 flex items-center gap-2">
        <Eye className="w-5 h-5 text-gray-500" />
        <h2 className="text-lg font-bold text-gray-700">Pratinjau Email</h2>
      </div>
      <ContentCardBody className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm overflow-hidden text-left rounded-2xl shadow-lg"
          style={{ background: "#f0f4f0", border: "1px solid #d1fae5" }}>

          {/* ── Email Client Toolbar ── */}
          <div style={{ background: "#ffffff", borderBottom: "1px solid #e5e7eb", padding: "10px 14px" }}>
            <p style={{ margin: 0, fontSize: 10, color: "#9ca3af", marginBottom: 2 }}>
              From: EveMuscab XI BPC HIPMI Kota Bandung &lt;noreply-muscabxi@hipmibdg.or.id&gt;
            </p>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#111827" }} className="truncate">
              {resolvedSubject}
            </p>
          </div>

          {/* ── Email Card ── */}
          <div style={{ padding: "12px 10px", background: "#f0f4f0" }}>
            <div style={{
              background: "#ffffff",
              borderRadius: 14,
              overflow: "hidden",
              boxShadow: "0 4px 20px rgba(0,53,24,0.12)",
            }}>

              {/* HEADER BANNER */}
              <div style={{
                background: "linear-gradient(160deg,#003518 0%,#09533D 60%,#047857 100%)",
                padding: "22px 18px 18px",
                textAlign: "center",
              }}>
                <p style={{
                  margin: "0 0 6px",
                  color: "#00AF50",
                  fontSize: 9,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 2,
                }}>
                  EveMuscab XI BPC HIPMI Kota Bandung
                </p>
                <h1 style={{ margin: "0 0 5px", color: "#ffffff", fontSize: 16, fontWeight: 800, lineHeight: 1.3 }}>
                  {selectedEventName || "Nama Event / Grup Event"}
                </h1>
                <p style={{ margin: 0, color: "rgba(255,255,255,0.75)", fontSize: 10 }}>
                  Konfirmasi Registrasi
                </p>
                <div style={{ margin: "12px auto 0", width: 32, height: 2, background: "#00AF50", borderRadius: 2 }} />
              </div>

              {/* BODY */}
              <div style={{ padding: "18px 16px 12px" }}>
                {/* Salam pembuka */}
                <p style={{ margin: "0 0 2px", color: "#09533D", fontSize: 12, fontWeight: 600 }}>
                  Kepada Yth.
                </p>
                <p style={{ margin: "0 0 2px", color: "#003518", fontSize: 13, fontWeight: 700 }}>
                  Bapak/Ibu Contoh
                </p>
                <p style={{ margin: "0 0 14px", color: "#374151", fontSize: 11, lineHeight: 1.7 }}>
                  Anggota <strong style={{ color: "#09533D" }}>BPC HIPMI Kota Bandung</strong>
                </p>

                {/* Body text */}
                <div style={{ color: "#374151", fontSize: 11, lineHeight: 1.7, marginBottom: 14 }}>
                  {resolvedBody
                    .replace(/\n/g, "<br>")
                    .split("<br>")
                    .map((line: string, i: number) => (
                      <span key={i}>
                        {i > 0 && <br />}
                        <span dangerouslySetInnerHTML={{ __html: line }} />
                      </span>
                    ))}
                </div>

                {/* Info Peserta mini-table */}
                <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden", marginBottom: 14 }}>
                  <div style={{ background: "#f0fdf4", padding: "7px 10px", borderBottom: "1px solid #e5e7eb" }}>
                    <strong style={{ color: "#003518", fontSize: 10 }}>Informasi Peserta</strong>
                  </div>
                  {[
                    { label: "Nama", value: "Bapak/Ibu Contoh" },
                    { label: "Perusahaan", value: "Contoh Perusahaan" },
                  ].map((row) => (
                    <div key={row.label} style={{ display: "flex", borderBottom: "1px solid #e5e7eb" }}>
                      <span style={{ padding: "5px 10px", color: "#6b7280", fontSize: 10, width: "40%" }}>{row.label}</span>
                      <span style={{ padding: "5px 10px", color: "#003518", fontSize: 10, fontWeight: 500 }}>{row.value}</span>
                    </div>
                  ))}
                </div>

                {/* QR Code Box */}
                <div style={{
                  border: "2px dashed #09533D",
                  borderRadius: 10,
                  background: "#f0f4f0",
                  padding: "16px 12px",
                  textAlign: "center",
                  marginBottom: 12,
                }}>
                  <p style={{ margin: "0 0 10px", color: "#003518", fontSize: 11, fontWeight: 700 }}>
                    Tiket Masuk / QR Code
                  </p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=DEMO-TICKET-HIPMI-2024&color=003518"
                    alt="QR Code"
                    width={110}
                    height={110}
                    style={{
                      display: "block",
                      margin: "0 auto",
                      borderRadius: 8,
                      border: "3px solid #ffffff",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                    }}
                  />
                  <p style={{ margin: "8px 0 2px", fontSize: 9, fontFamily: "monospace", color: "#047857", fontWeight: 600, letterSpacing: 1 }}>
                    TICKET-DEMO-123456
                  </p>
                  <p style={{ margin: 0, fontSize: 9, color: "#6b7280" }}>
                    Tunjukkan QR ini saat check-in
                  </p>
                </div>
              </div>

              {/* SIGNATURE */}
              <div style={{ padding: "0 16px 14px" }}>
                <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <p style={{ margin: "0 0 1px", color: "#6b7280", fontSize: 9 }}>Hormat kami,</p>
                    <p style={{ margin: "0 0 1px", color: "#003518", fontSize: 11, fontWeight: 700 }}>BPC HIPMI Kota Bandung</p>
                    <p style={{ margin: 0, color: "#047857", fontSize: 9 }}>Musyawarah Cabang XI — Panitia Pelaksana</p>
                  </div>
                  <div style={{ background: "#003518", borderRadius: 6, padding: "5px 9px", textAlign: "center" }}>
                    <p style={{ margin: 0, color: "#00AF50", fontSize: 7, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1 }}>HIPMI</p>
                    <p style={{ margin: "1px 0 0", color: "rgba(255,255,255,0.7)", fontSize: 7 }}>Kota Bandung</p>
                  </div>
                </div>
              </div>

              {/* FOOTER */}
              <div style={{ background: "#003518", padding: "12px 16px" }}>
                <p style={{ margin: "0 0 4px", color: "rgba(255,255,255,0.5)", fontSize: 9, textAlign: "center" }}>
                  Email ini dikirim secara otomatis oleh sistem. Mohon tidak membalas email ini secara langsung.
                </p>
                <p style={{ margin: 0, color: "rgba(255,255,255,0.35)", fontSize: 8, textAlign: "center" }}>
                  Hubungi kami di{" "}
                  <span style={{ color: "#00AF50" }}>muscabhipmikotabandungxi@gmail.com</span>
                  {" · "}EveMuscab XI BPC HIPMI Kota Bandung © {new Date().getFullYear()}
                </p>
              </div>

            </div>
          </div>

        </div>
      </ContentCardBody>
    </ContentCard>
  );
}
