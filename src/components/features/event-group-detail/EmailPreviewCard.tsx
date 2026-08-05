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
  return (
    <ContentCard className="flex flex-col bg-gray-50">
      <div className="p-5 border-b border-gray-200 bg-gray-100/50 flex items-center gap-2">
        <Eye className="w-5 h-5 text-gray-500" />
        <h2 className="text-lg font-bold text-gray-700">Pratinjau Email</h2>
      </div>
      <ContentCardBody className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden text-left">
          {/* Email Client Header */}
          <div className="border-b border-gray-100 px-4 py-3">
            <p className="text-xs text-gray-400 mb-1">From: Event Platform &lt;no-reply@event.local&gt;</p>
            <p className="text-sm font-semibold text-gray-800 truncate">
              {emailSubject || "Tiket Acara Anda"}
            </p>
          </div>

          {/* Email Content */}
          <div style={{ fontFamily: "Arial, sans-serif" }}>
            {/* Header Banner */}
            <div style={{ background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)", padding: "28px 20px", textAlign: "center" }}>
              <h2 style={{ color: "#ffffff", margin: 0, fontSize: 20, fontWeight: 700 }}>
                {selectedEventName}
              </h2>
              <p style={{ color: "#94a3b8", margin: "6px 0 0", fontSize: 12 }}>
                Konfirmasi Registrasi Tiket
              </p>
            </div>

            {/* Body */}
            <div style={{ padding: "28px 24px" }}>
              <p style={{ margin: "0 0 16px", fontSize: 15, color: "#1e293b" }}>
                Halo <strong>[Nama Peserta]</strong>,
              </p>
              <p style={{ margin: "0 0 20px", fontSize: 14, color: "#475569", lineHeight: "1.7" }}>
                {emailBody.replace("{name}", "[Nama Peserta]")}
              </p>

              {/* QR Code Box */}
              <div style={{ background: "#f8fafc", border: "1px dashed #cbd5e1", borderRadius: 8, padding: "20px 16px", textAlign: "center", marginBottom: 20 }}>
                <p style={{ margin: "0 0 12px", fontSize: 12, color: "#64748b" }}>
                  Tunjukkan QR ini saat check-in:
                </p>
                <div style={{ display: "inline-block", padding: 8, background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8 }}>
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=DEMO-TICKET-123456"
                    alt="QR Code"
                    width={150}
                    height={150}
                    style={{ display: "block", opacity: 0.6 }}
                  />
                </div>
                <p style={{ margin: "10px 0 0", fontSize: 11, fontFamily: "monospace", color: "#94a3b8" }}>
                  TICKET-123456
                </p>
              </div>

              {/* CTA Button */}
              <div style={{ textAlign: "center", marginBottom: 4 }}>
                <span
                  style={{
                    display: "inline-block",
                    padding: "10px 28px",
                    background: "var(--brand-primary, #2563eb)",
                    color: "#ffffff",
                    fontSize: 13,
                    fontWeight: 600,
                    borderRadius: 6,
                    textDecoration: "none",
                  }}
                >
                  Lihat Tiket
                </span>
              </div>
            </div>

            {/* Footer */}
            <div style={{ background: "#f8fafc", borderTop: "1px solid #f1f5f9", padding: "14px 20px", textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: 11, color: "#94a3b8" }}>
                Email ini dikirim secara otomatis oleh sistem.
              </p>
            </div>
          </div>
        </div>
      </ContentCardBody>
    </ContentCard>
  );
}
