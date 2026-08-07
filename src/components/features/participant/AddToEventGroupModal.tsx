"use client";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";

interface AddToEventGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  eventGroups: any[];
  selectedEventGroupId: string;
  onEventGroupChange: (val: string) => void;
  isLoading: boolean;
  onSubmit: () => void;
}

export function AddToEventGroupModal({
  open,
  onOpenChange,
  selectedCount,
  eventGroups,
  selectedEventGroupId,
  onEventGroupChange,
  isLoading,
  onSubmit,
}: AddToEventGroupModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambahkan ke Grup Event</DialogTitle>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <p className="text-sm text-gray-500">
            Pilih Grup Event untuk mendaftarkan {selectedCount} peserta yang dipilih.
          </p>
          <div>
            <label className="text-sm font-medium mb-1 block">Grup Event</label>
            <Select
              items={eventGroups.map((eg: any) => ({ value: eg.id, label: eg.name }))}
              value={selectedEventGroupId}
              onValueChange={(v) => onEventGroupChange(v as string)}
            >
              <SelectTrigger>
                <SelectValue placeholder="-- Pilih Event Group --" />
              </SelectTrigger>
              <SelectContent>
                {eventGroups.map((eg: any) => (
                  <SelectItem key={eg.id} value={eg.id}>{eg.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Batal
          </Button>
          <Button onClick={onSubmit} disabled={isLoading || !selectedEventGroupId}>
            {isLoading ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
