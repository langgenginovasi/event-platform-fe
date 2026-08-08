"use client";

import { Loader2 } from "lucide-react";
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
import { cn } from "@/lib/utils";

interface CheckInEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: "checkin" | "checkout";
  selectedParticipant?: { name: string; email: string; company: string } | null;
  events: any[];
  isLoadingEvents: boolean;
  selectedEventId: string;
  onEventChange: (val: string) => void;
  attendanceStatus: Record<string, { checkin: boolean; checkout: boolean }>;
  isProcessing: boolean;
  onConfirm: () => void;
}

export function CheckInEventModal({
  open,
  onOpenChange,
  action,
  selectedParticipant,
  events,
  isLoadingEvents,
  selectedEventId,
  onEventChange,
  attendanceStatus,
  isProcessing,
  onConfirm,
}: CheckInEventModalProps) {
  const isCheckinAction = action === "checkin";

  // Build items list with labels for Select.Root
  const selectItems = events.map((ev: any) => {
    const status = attendanceStatus[ev.id];
    const isDisabled = isCheckinAction
      ? !!status?.checkin
      : !status?.checkin || !!status?.checkout;
    let suffix = "";
    if (isCheckinAction) {
      if (status?.checkin) suffix = " (Selesai)";
    } else {
      if (!status?.checkin) suffix = " (⚠ Belum Masuk)";
      else if (status?.checkout) suffix = " (Selesai)";
    }
    return { value: ev.id, label: ev.name + suffix, disabled: isDisabled };
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isCheckinAction ? "Masuk" : "Keluar"} - Pilih Event
          </DialogTitle>
        </DialogHeader>
        <DialogBody className="space-y-4">
          {selectedParticipant && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Peserta:</p>
              <p className="text-sm font-semibold text-foreground">{selectedParticipant.name}</p>
              <p className="text-xs text-muted-foreground">{selectedParticipant.email}</p>
              <p className="text-xs text-muted-foreground">{selectedParticipant.company}</p>
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Pilih event yang ingin diproses</label>
            {isLoadingEvents ? (
              <div className="flex items-center justify-center py-8 border border-dashed rounded-lg">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground mr-2" />
                <span className="text-sm text-muted-foreground">Memuat daftar event...</span>
              </div>
            ) : events.length === 0 ? (
              <div className="flex items-center justify-center py-8 border border-dashed rounded-lg">
                <span className="text-sm text-muted-foreground">Tidak ada event ditemukan</span>
              </div>
            ) : (
              <Select
                items={selectItems}
                value={selectedEventId}
                onValueChange={(v) => {
                  const item = selectItems.find((i) => i.value === v);
                  if (item?.disabled) return;
                  onEventChange(v as string);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="-- Pilih Event --" />
                </SelectTrigger>
                <SelectContent>
                  {selectItems.map((item) => (
                    <SelectItem
                      key={item.value}
                      value={item.value}
                      disabled={item.disabled}
                      className="py-2.5 px-3"
                    >
                      <span className="flex items-center justify-between w-full">
                        <span>{item.label.split(" (")[0]}</span>
                        {item.label.includes("(") && (
                          <span className={cn(
                            "ml-2 text-xs font-medium",
                            item.label.includes("Selesai") ? "text-muted-foreground" : "text-amber-600"
                          )}>
                            ({item.label.split("(")[1]}
                          </span>
                        )}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isProcessing || !selectedEventId}
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            Proses
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
