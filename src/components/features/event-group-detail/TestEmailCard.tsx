"use client";

import { Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ContentCard, ContentCardHeader, ContentCardBody } from "@/components/shared/CustomCards";

export type TestEmailTemplate = "test" | "group" | "event";

interface TestEmailCardProps {
  eventGroup: any;
  testTemplate: TestEmailTemplate;
  onTemplateChange: (v: TestEmailTemplate) => void;
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
          Kirim email test untuk memastikan konfigurasi SMTP dan template berfungsi.
        </p>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Templat</label>
          <Select
            items={[
              { value: "test", label: "Uji SMTP (Email Biasa)" },
              { value: "group", label: "Per Event Group (Tiket)" },
              { value: "event", label: "Per Event (Tiket)" },
            ]}
            value={testTemplate}
            onValueChange={(v) => onTemplateChange(v as TestEmailTemplate)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih Templat" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="test">Uji SMTP (Email Biasa)</SelectItem>
              <SelectItem value="group">Per Event Group (Tiket)</SelectItem>
              <SelectItem value="event">Per Event (Tiket)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {testTemplate === "event" && eventGroup?.events?.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Pilih Event</label>
            <Select
              items={eventGroup.events.map((ev: any) => ({ value: ev.id, label: ev.name }))}
              value={selectedEventId}
              onValueChange={(v) => onEventChange(v as string)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Event" />
              </SelectTrigger>
              <SelectContent>
                {eventGroup.events.map((ev: any) => (
                  <SelectItem key={ev.id} value={ev.id}>{ev.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
