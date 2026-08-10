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

interface BulkEditParticipationTypeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  participationTypes: any[];
  participationTypeId: string;
  onParticipationTypeChange: (val: string) => void;
  isLoading: boolean;
  onSubmit: () => void;
}

const activeTypes = (types: any[]) =>
  types.filter((pt: any) => pt.is_active !== false);

export function BulkEditParticipationTypeModal({
  open,
  onOpenChange,
  selectedCount,
  participationTypes,
  participationTypeId,
  onParticipationTypeChange,
  isLoading,
  onSubmit,
}: BulkEditParticipationTypeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ubah Tipe Kepesertaan</DialogTitle>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <p className="text-sm text-gray-500">
            Ubah tipe kepesertaan untuk {selectedCount} registrasi yang dipilih.
          </p>
          {activeTypes(participationTypes).length === 0 ? (
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
              Event group ini belum memiliki tipe kepesertaan. Silakan tambahkan
              tipe kepesertaan terlebih dahulu di halaman pengaturan event group.
            </div>
          ) : (
            <div>
              <label className="text-sm font-medium mb-1 block">Tipe Kepesertaan</label>
              <Select
                items={activeTypes(participationTypes).map((pt: any) => ({ value: String(pt.id), label: pt.name }))}
                value={participationTypeId}
                onValueChange={(v) => onParticipationTypeChange(v as string)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="-- Tidak Ditentukan --" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">-- Tidak Ditentukan --</SelectItem>
                  {activeTypes(participationTypes).map((pt: any) => (
                    <SelectItem key={pt.id} value={String(pt.id)}>
                      {pt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Batal
          </Button>
          <Button onClick={onSubmit} disabled={isLoading || activeTypes(participationTypes).length === 0}>
            {isLoading ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
