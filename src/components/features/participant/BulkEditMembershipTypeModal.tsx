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

interface BulkEditMembershipTypeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  membershipTypes: any[];
  membershipTypeId: string;
  onMembershipTypeChange: (val: string) => void;
  isLoading: boolean;
  onSubmit: () => void;
}

export function BulkEditMembershipTypeModal({
  open,
  onOpenChange,
  selectedCount,
  membershipTypes,
  membershipTypeId,
  onMembershipTypeChange,
  isLoading,
  onSubmit,
}: BulkEditMembershipTypeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ubah Tipe Keanggotaan</DialogTitle>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <p className="text-sm text-gray-500">
            Ubah tipe keanggotaan untuk {selectedCount} peserta yang dipilih.
          </p>
          <div>
            <label className="text-sm font-medium mb-1 block">Tipe Keanggotaan</label>
            <Select
              items={membershipTypes.map((mt: any) => ({ value: String(mt.id), label: mt.name }))}
              value={membershipTypeId}
              onValueChange={(v) => onMembershipTypeChange(v as string)}
            >
              <SelectTrigger>
                <SelectValue placeholder="-- Tidak Ditentukan --" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">-- Tidak Ditentukan --</SelectItem>
                {membershipTypes.map((mt: any) => (
                  <SelectItem key={mt.id} value={String(mt.id)}>
                    {mt.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Batal
          </Button>
          <Button onClick={onSubmit} disabled={isLoading}>
            {isLoading ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
