"use client";

import { Settings, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ContentCard, ContentCardHeader, ContentCardBody } from "@/components/shared/CustomCards";

interface EmailSettingsCardProps {
  emailSubject: string;
  onSubjectChange: (v: string) => void;
  emailBody: string;
  onBodyChange: (v: string) => void;
}

export function EmailSettingsCard({
  emailSubject,
  onSubjectChange,
  emailBody,
  onBodyChange,
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
            rows={5}
            className="resize-none"
          />
          <p className="text-xs text-gray-500">
            Gunakan <code className="bg-gray-100 px-1 py-0.5 rounded">{`{name}`}</code> untuk menyapa nama peserta.
          </p>
        </div>
        <div className="pt-2">
          <Button className="w-full">
            <Check className="w-4 h-4 mr-2" />
            Simpan Pengaturan Email
          </Button>
        </div>
      </ContentCardBody>
    </ContentCard>
  );
}
