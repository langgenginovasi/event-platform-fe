"use client";

import { useState, useEffect } from "react";
import { Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SendEmailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetCount: number;
  events: any[];
  selectedEventId: string;
  onEventChange: (val: string) => void;
  isSending: boolean;
  onConfirm: (emailType: "group" | "event", eventId?: string) => void;
}

export function SendEmailModal({
  open,
  onOpenChange,
  targetCount,
  events,
  selectedEventId,
  onEventChange,
  isSending,
  onConfirm,
}: SendEmailModalProps) {
  const [emailType, setEmailType] = useState<"group" | "event">("group");

  useEffect(() => {
    if (!open) {
      setEmailType("group");
    }
  }, [open]);

  const selectItems = events.map((ev: any) => ({ value: ev.id, label: ev.name }));

  const handleConfirm = () => {
    onConfirm(emailType, emailType === "event" ? selectedEventId : undefined);
  };

  const isSendDisabled = isSending || (emailType === "event" && !selectedEventId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Kirim Email Tiket
          </DialogTitle>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Mengirim email tiket ke {targetCount} peserta yang dipilih.
          </p>

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Jenis Email</p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={emailType === "group" ? "default" : "outline"}
                size="sm"
                onClick={() => setEmailType("group")}
              >
                Per Grup Event
              </Button>
              <Button
                type="button"
                variant={emailType === "event" ? "default" : "outline"}
                size="sm"
                onClick={() => setEmailType("event")}
              >
                Per Event
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {emailType === "group"
                ? "Menampilkan daftar semua event dalam event group"
                : "Menampilkan detail 1 event dan jadwal sesi"}
            </p>
          </div>

          {emailType === "event" && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Pilih Event</p>
              <Select
                items={selectItems}
                value={selectedEventId}
                onValueChange={(v) => onEventChange(v as string)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="-- Pilih Event --" />
                </SelectTrigger>
                <SelectContent>
                  {selectItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSending}
          >
            Batal
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isSendDisabled}
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Mail className="w-4 h-4 mr-2" />
            )}
            Kirim Email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
