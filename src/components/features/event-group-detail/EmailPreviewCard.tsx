"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { ContentCard, ContentCardBody } from "@/components/shared/CustomCards";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PreviewSession {
  id?: string;
  name: string;
  start_datetime: string;
  end_datetime: string;
}

interface PreviewEvent {
  id: string;
  name: string;
  start_datetime: string;
  end_datetime: string;
  sessions?: PreviewSession[];
}

interface EmailPreviewCardProps {
  emailSubject: string;
  emailBody: string;
  eventGroupName: string;
  events: PreviewEvent[];
  showQr: boolean;
  showParticipantInfo: boolean;
  showAgenda: boolean;
}

function formatDate(d: string | Date): string {
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

function formatTime(d: string | Date): string {
  return `${new Date(d).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB`;
}

function formatDateTime(d: string | Date): string {
  return `${formatDate(d)}, ${formatTime(d)}`;
}

function resolveBody(body: string, eventName: string, groupName: string): string {
  return body
    .replace(/\{\{name\}\}/g, "Bapak/Ibu Contoh")
    .replace(/\{\{event_name\}\}/g, eventName)
    .replace(/\{\{event_group_name\}\}/g, groupName);
}

interface MockShellProps {
  label: string;
  subject: string;
  heading: string;
  body: string;
  showParticipantInfo: boolean;
  showQr: boolean;
  children: React.ReactNode;
}

function EmailMockShell({ label, subject, heading, body, showParticipantInfo, showQr, children }: MockShellProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold text-gray-600">{label}</p>
      <div
        className="w-full max-w-sm mx-auto overflow-hidden text-left rounded-2xl shadow-lg"
        style={{ background: "#f0f4f0", border: "1px solid #d1fae5" }}
      >
        {/* ── Email Client Toolbar ── */}
        <div style={{ background: "#ffffff", borderBottom: "1px solid #e5e7eb", padding: "10px 14px" }}>
          <p style={{ margin: 0, fontSize: 10, color: "#9ca3af", marginBottom: 2 }}>
            From: MUSCAB XI HIPMI Kota Bandung &lt;noreply-muscabxi@hipmibdg.or.id&gt;
          </p>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#111827" }} className="truncate">
            {subject}
          </p>
        </div>

        {/* ── Email Card ── */}
        <div style={{ padding: "12px 10px", background: "#f0f4f0" }}>
          <div
            style={{
              background: "#ffffff",
              borderRadius: 14,
              overflow: "hidden",
              boxShadow: "0 4px 20px rgba(0,53,24,0.12)",
            }}
          >
            {/* HEADER BANNER */}
            <div
              style={{
                background: "linear-gradient(160deg,#003518 0%,#09533D 60%,#047857 100%)",
                padding: "22px 18px 18px",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  margin: "0 0 6px",
                  color: "#00AF50",
                  fontSize: 9,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 2,
                }}
              >
                MUSCAB XI HIPMI Kota Bandung
              </p>
              <h1 style={{ margin: "0 0 5px", color: "#ffffff", fontSize: 16, fontWeight: 800, lineHeight: 1.3 }}>
                {heading}
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
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{body}</ReactMarkdown>
              </div>

              {/* Info Peserta mini-table */}
              {showParticipantInfo && (
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
              )}

              {children}

              {/* QR Code Box */}
              {showQr && (
                <div
                  style={{
                    border: "2px dashed #09533D",
                    borderRadius: 10,
                    background: "#f0f4f0",
                    padding: "16px 12px",
                    textAlign: "center",
                    marginBottom: 12,
                  }}
                >
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
              )}
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
                {" · "}MUSCAB XI HIPMI Kota Bandung © {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function EmailPreviewCard({
  emailSubject,
  emailBody,
  eventGroupName,
  events,
  showQr,
  showParticipantInfo,
  showAgenda,
}: EmailPreviewCardProps) {
  const [selectedEventId, setSelectedEventId] = useState("");

  const resolvedGroupName = eventGroupName || "Nama Event Group";
  const selectedEvent = events.find((e) => e.id === selectedEventId) ?? events[0];
  const resolvedEventName = selectedEvent?.name || "Nama Event";

  const subject = (emailSubject || "Undangan {{event_group_name}}")
    .replace(/\{\{event_name\}\}/g, resolvedEventName)
    .replace(/\{\{event_group_name\}\}/g, resolvedGroupName);

  const body = resolveBody(emailBody, resolvedEventName, resolvedGroupName);

  const eventRange = (() => {
    if (!events.length) return "";
    const start = events.reduce((min, e) => (new Date(e.start_datetime) < new Date(min.start_datetime) ? e : min));
    const end = events.reduce((max, e) => (new Date(e.end_datetime) > new Date(max.end_datetime) ? e : max));
    return `${formatDate(start.start_datetime)} — ${formatDate(end.end_datetime)}`;
  })();

  return (
    <ContentCard className="flex flex-col bg-gray-50 lg:col-span-2">
      <div className="p-5 border-b border-gray-200 bg-gray-100/50 flex items-center gap-2">
        <Eye className="w-5 h-5 text-gray-500" />
        <h2 className="text-lg font-bold text-gray-700">Pratinjau Email</h2>
      </div>
      <ContentCardBody className="p-4">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Template Event */}
          <div className="space-y-2">
            {events.length > 1 && (
              <Select
                items={events.map((e) => ({ value: e.id, label: e.name }))}
                value={selectedEvent?.id ?? ""}
                onValueChange={(v) => setSelectedEventId(v as string)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih Event" />
                </SelectTrigger>
                <SelectContent>
                  {events.map((e) => (
                    <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <EmailMockShell
              label="Template Event"
              subject={subject}
              heading={resolvedEventName}
              body={body}
              showParticipantInfo={showParticipantInfo}
              showQr={showQr}
            >
              {/* Detail Event (mirip ticketEmailEventHtml) */}
              {showAgenda && (
                <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden", marginBottom: 14 }}>
                  <div style={{ background: "#f0fdf4", padding: "7px 10px", borderBottom: "1px solid #e5e7eb" }}>
                    <strong style={{ color: "#003518", fontSize: 10 }}>{resolvedEventName}</strong>
                  </div>
                  {selectedEvent && (
                    <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb" }}>
                      <span style={{ padding: "5px 10px", color: "#6b7280", fontSize: 10, width: "40%" }}>Tanggal &amp; Waktu</span>
                      <span style={{ padding: "5px 10px", color: "#003518", fontSize: 10, fontWeight: 500 }}>
                        {formatDateTime(selectedEvent.start_datetime)} — {formatDateTime(selectedEvent.end_datetime)}
                      </span>
                    </div>
                  )}
                  {selectedEvent?.sessions && selectedEvent.sessions.length > 0 && (
                    <>
                      <div style={{ background: "#f9fafb", padding: "7px 10px", borderBottom: "1px solid #e5e7eb" }}>
                        <strong style={{ color: "#003518", fontSize: 10 }}>Jadwal Sesi</strong>
                      </div>
                      {selectedEvent.sessions.map((s) => (
                        <div key={s.id ?? s.name} style={{ display: "flex", borderBottom: "1px solid #e5e7eb" }}>
                          <span style={{ padding: "5px 10px", color: "#003518", fontSize: 10 }}>{s.name}</span>
                          <span style={{ padding: "5px 10px", color: "#4b5563", fontSize: 10, textAlign: "right", flex: 1 }}>
                            {formatTime(s.start_datetime)} — {formatTime(s.end_datetime)}
                          </span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </EmailMockShell>
          </div>

          {/* Template Event Group */}
          <EmailMockShell
            label="Template Event Group"
            subject={subject}
            heading={resolvedGroupName}
            body={body}
            showParticipantInfo={showParticipantInfo}
            showQr={showQr}
          >
            {/* Rangkaian Acara (mirip ticketEmailGroupHtml) */}
            {showAgenda && (
              <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden", marginBottom: 14 }}>
                <div style={{ background: "#f9fafb", padding: "7px 10px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between" }}>
                  <strong style={{ color: "#003518", fontSize: 10 }}>Rangkaian Acara</strong>
                  <span style={{ color: "#4b5563", fontSize: 10 }}>{eventRange || "—"}</span>
                </div>
                {events.length > 0 ? (
                  events.map((e) => (
                    <div key={e.id} style={{ display: "flex", borderBottom: "1px solid #e5e7eb" }}>
                      <span style={{ padding: "5px 10px", color: "#003518", fontSize: 10 }}>{e.name}</span>
                      <span style={{ padding: "5px 10px", color: "#4b5563", fontSize: 10, textAlign: "right", flex: 1 }}>
                        {formatDateTime(e.start_datetime)} — {formatDateTime(e.end_datetime)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: "7px 10px", color: "#6b7280", fontSize: 10 }}>Belum ada event.</div>
                )}
              </div>
            )}
          </EmailMockShell>
        </div>
      </ContentCardBody>
    </ContentCard>
  );
}
