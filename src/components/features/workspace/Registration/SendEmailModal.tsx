"use client";

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
  onConfirm: () => void;
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
  const selectItems = events.map((ev: any) => ({ value: ev.id, label: ev.name }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Kirim Email Tiket</DialogTitle>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Pilih event untuk mengirim email tiket ke {targetCount} peserta yang dipilih.
          </p>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Pilih Event</label>
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
            onClick={onConfirm}
            disabled={isSending || !selectedEventId}
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
