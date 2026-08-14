"use client";

import { Settings, Check, Loader2 } from "lucide-react";
import { Switch } from "@base-ui/react/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ContentCard, ContentCardHeader, ContentCardBody } from "@/components/shared/CustomCards";

interface EmailSettingsCardProps {
  emailSubject: string;
  onSubjectChange: (v: string) => void;
  emailBody: string;
  onBodyChange: (v: string) => void;
  showQr: boolean;
  onShowQrChange: (v: boolean) => void;
  showParticipantInfo: boolean;
  onShowParticipantInfoChange: (v: boolean) => void;
  showAgenda: boolean;
  onShowAgendaChange: (v: boolean) => void;
  onSave: () => void;
  isSaving: boolean;
}

function ToggleRow({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2.5">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-800">{label}</p>
        {description && <p className="text-xs text-gray-500">{description}</p>}
      </div>
      <Switch.Root
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 data-[checked]:bg-green-600 data-[unchecked]:bg-gray-300"
      >
        <Switch.Thumb className="pointer-events-none inline-block h-5 w-5 translate-x-0.5 rounded-full bg-white shadow transition-transform data-[checked]:translate-x-[22px]" />
      </Switch.Root>
    </div>
  );
}

export function EmailSettingsCard({
  emailSubject,
  onSubjectChange,
  emailBody,
  onBodyChange,
  showQr,
  onShowQrChange,
  showParticipantInfo,
  onShowParticipantInfoChange,
  showAgenda,
  onShowAgendaChange,
  onSave,
  isSaving,
}: EmailSettingsCardProps) {
  return (
    <ContentCard className="flex flex-col">
      <ContentCardHeader icon={Settings} title="Pengaturan Email Tiket" />
      <ContentCardBody className="flex-1 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Subjek Email</label>
          <Input
            value={emailSubject}
            onChange={(e) => onSubjectChange(e.target.value)}
            placeholder="Masukkan subjek email"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Pesan Email</label>
          <Textarea
            value={emailBody}
            onChange={(e) => onBodyChange(e.target.value)}
            placeholder="Tulis pesan untuk peserta..."
            rows={7}
            className="resize-y"
          />
          <div className="text-xs text-gray-500 space-y-1">
            <p>
              Placeholder:{" "}
              <code className="bg-gray-100 px-1 py-0.5 rounded">{`{{name}}`}</code> nama peserta,{" "}
              <code className="bg-gray-100 px-1 py-0.5 rounded">{`{{event_name}}`}</code> nama event,{" "}
              <code className="bg-gray-100 px-1 py-0.5 rounded">{`{{event_group_name}}`}</code> nama event group.
            </p>
            <p>
              Format Markdown yang didukung:{" "}
              <code className="bg-gray-100 px-1 py-0.5 rounded">**tebal**</code>,{" "}
              <code className="bg-gray-100 px-1 py-0.5 rounded">*miring*</code>,{" "}
              <code className="bg-gray-100 px-1 py-0.5 rounded">~~coret~~</code>,{" "}
              <code className="bg-gray-100 px-1 py-0.5 rounded"># judul</code>,{" "}
              <code className="bg-gray-100 px-1 py-0.5 rounded">- daftar</code>,{" "}
              <code className="bg-gray-100 px-1 py-0.5 rounded">1. daftar urut</code>,{" "}
              <code className="bg-gray-100 px-1 py-0.5 rounded">&gt; kutipan</code>,{" "}
              <code className="bg-gray-100 px-1 py-0.5 rounded">`kode`</code>,{" "}
              <code className="bg-gray-100 px-1 py-0.5 rounded">[link](https://...)</code>,{" "}
              <code className="bg-gray-100 px-1 py-0.5 rounded">| tabel |</code>, dan{" "}
              <code className="bg-gray-100 px-1 py-0.5 rounded">---</code> garis pemisah.
            </p>
            <p>
              Baris baru: tekan <strong>Enter sekali</strong> untuk pindah baris, dan{" "}
              <strong>Enter dua kali</strong> untuk baris kosong (jarak antar paragraf).
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Konten Email</label>
          <div className="space-y-2">
            <ToggleRow
              label="Tampilkan QR Code"
              description="Blok tiket masuk / QR code di bagian bawah email"
              checked={showQr}
              onCheckedChange={onShowQrChange}
            />
            <ToggleRow
              label="Tampilkan Informasi Peserta"
              description="Tabel nama, email, perusahaan, tipe partisipasi & keanggotaan"
              checked={showParticipantInfo}
              onCheckedChange={onShowParticipantInfoChange}
            />
            <ToggleRow
              label="Tampilkan Rangkaian Acara"
              description="Detail event / jadwal sesi (template per event) atau daftar event (template per event group)"
              checked={showAgenda}
              onCheckedChange={onShowAgendaChange}
            />
          </div>
        </div>

        <div className="pt-2">
          <Button className="w-full" onClick={onSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Check className="w-4 h-4 mr-2" />
            )}
            {isSaving ? "Menyimpan..." : "Simpan Pengaturan Email"}
          </Button>
        </div>
      </ContentCardBody>
    </ContentCard>
  );
}
