"use client";

import { Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ContentCard, ContentCardHeader, ContentCardBody } from "@/components/shared/CustomCards";

interface TestEmailCardProps {
  eventGroup: any;
  testTemplate: "test" | "ticket";
  onTemplateChange: (v: "test" | "ticket") => void;
  selectedEventId: string;
  onEventChange: (v: string) => void;
  testEmail: string;
  onEmailChange: (v: string) => void;
  isSending: boolean;
  onSend: () => void;
}

export function TestEmailCard({
  eventGroup,
  testTemplate,
  onTemplateChange,
  selectedEventId,
  onEventChange,
  testEmail,
  onEmailChange,
  isSending,
  onSend,
}: TestEmailCardProps) {
  return (
    <ContentCard>
      <ContentCardHeader icon={Mail} title="Uji Email" />
      <ContentCardBody className="space-y-4">
        <p className="text-sm text-gray-600">
          Kirim email test untuk memastikan konfigurasi SMTP berfungsi.
        </p>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Templat</label>
          <Select
            items={[
              { value: "test", label: "Templat Uji (Cek SMTP)" },
              { value: "ticket", label: "Templat Tiket (dengan QR Code)" },
            ]}
            value={testTemplate}
            onValueChange={(v) => onTemplateChange(v as "test" | "ticket")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih Templat" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="test">Templat Uji (Cek SMTP)</SelectItem>
              <SelectItem value="ticket">Templat Tiket (dengan QR Code)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {testTemplate === "ticket" && eventGroup?.events?.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Pilih Event</label>
            <Select
              items={eventGroup.events.map((ev: any) => ({ value: ev.id, label: ev.name }))}
              value={selectedEventId}
              onValueChange={(v) => onEventChange(v as string)}
            >
              <SelectTrigger>
                <SelectValue placeholder={`Gunakan nama grup: ${eventGroup?.name || "-"}`} />
              </SelectTrigger>
              <SelectContent>
                {eventGroup.events.map((ev: any) => (
                  <SelectItem key={ev.id} value={ev.id}>{ev.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-400">
              {selectedEventId ? ">Nama event akan digunakan di subject email" : "Kosongkan untuk menggunakan nama event group"}
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="email@test.com"
            value={testEmail}
            onChange={(e) => onEmailChange(e.target.value)}
            className="flex-1"
          />
          <Button onClick={onSend} disabled={isSending || !testEmail} variant="outline">
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Mail className="w-4 h-4 mr-2" />
            )}
            Kirim Uji
          </Button>
        </div>
      </ContentCardBody>
    </ContentCard>
  );
}
