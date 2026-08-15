"use client";

import { Loader2, MoveRight } from "lucide-react";
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

interface MoveDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityName: string;
  itemName: string;
  affectedCount: number;
  affectedLabel: string;
  options: { id: string; name: string }[];
  targetId: string;
  onTargetChange: (val: string) => void;
  isLoading: boolean;
  onConfirm: () => void;
}

export function MoveDeleteDialog({
  open,
  onOpenChange,
  entityName,
  itemName,
  affectedCount,
  affectedLabel,
  options,
  targetId,
  onTargetChange,
  isLoading,
  onConfirm,
}: MoveDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-amber-100 text-amber-600">
              <MoveRight className="w-5 h-5" />
            </div>
            <DialogTitle>Hapus {entityName} & Pindahkan</DialogTitle>
          </div>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <p className="text-sm text-muted-foreground">
            &quot;{itemName}&quot; masih digunakan oleh {affectedCount} {affectedLabel}. Pilih opsi
            tujuan untuk memindahkan {affectedLabel} sebelum {entityName.toLowerCase()} dihapus.
          </p>
          <div>
            <label className="text-sm font-medium mb-1 block">Pindahkan ke</label>
            <Select
              items={options.map((o) => ({ value: o.id, label: o.name }))}
              value={targetId}
              onValueChange={(v) => onTargetChange(v as string)}
            >
              <SelectTrigger>
                <SelectValue placeholder="-- Pilih opsi tujuan --" />
              </SelectTrigger>
              <SelectContent>
                {options.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.name}
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
          <Button
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={onConfirm}
            disabled={isLoading || !targetId}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Pindahkan & Hapus
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
