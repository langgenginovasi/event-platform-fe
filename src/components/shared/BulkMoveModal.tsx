"use client";

import { Search, MoveRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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

export interface BulkMoveItem {
  id: string;
  name: string;
  email: string;
  company: string;
  groupName?: string;
}

interface BulkMoveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle: string;
  search: string;
  onSearchChange: (val: string) => void;
  items: BulkMoveItem[];
  selectedIds: string[];
  onToggleItem: (id: string) => void;
  onToggleAll: (checked: boolean) => void;
  options: { id: string; name: string }[];
  targetLabel: string;
  targetId: string;
  onTargetChange: (val: string) => void;
  isLoadingList: boolean;
  isMoving: boolean;
  onConfirm: () => void;
}

export function BulkMoveModal({
  open,
  onOpenChange,
  title,
  subtitle,
  search,
  onSearchChange,
  items,
  selectedIds,
  onToggleItem,
  onToggleAll,
  options,
  targetLabel,
  targetId,
  onTargetChange,
  isLoadingList,
  isMoving,
  onConfirm,
}: BulkMoveModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        </DialogHeader>

        <DialogBody className="space-y-4">
          {options.length > 0 ? (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">{targetLabel}</label>
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
          ) : (
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
              Tidak ada opsi tujuan lain yang tersedia untuk dipindahkan.
            </div>
          )}

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Cari peserta (nama / email)..."
              className="pl-9"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          {selectedIds.length > 0 && (
            <div className="py-2 bg-blue-50/50 border-b border-blue-100 flex items-center justify-between">
              <span className="text-sm font-medium text-blue-800">
                {selectedIds.length} dipilih
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:text-blue-700"
                onClick={() => onToggleAll(false)}
              >
                Reset
              </Button>
            </div>
          )}

          <div className="max-h-[400px] overflow-y-auto">
            {isLoadingList ? (
              <div className="flex items-center justify-center py-10 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Memuat data...
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-sm">
                {search
                  ? "Tidak ditemukan peserta yang cocok."
                  : "Tidak ada data yang menggunakan opsi ini."}
              </div>
            ) : (
              <div className="space-y-1">
                <div className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 border-b border-gray-100">
                  <Checkbox
                    checked={selectedIds.length === items.length && items.length > 0}
                    onCheckedChange={(checked) => onToggleAll(checked as boolean)}
                  />
                  <span className="text-sm font-semibold text-gray-600">
                    Pilih Semua ({items.length})
                  </span>
                </div>

                {items.map((p) => (
                  <div
                    key={p.id}
                    className={cn(
                      "flex items-center space-x-3 px-3 py-3 rounded-lg cursor-pointer transition-colors",
                      selectedIds.includes(p.id)
                        ? "bg-blue-50 hover:bg-blue-100"
                        : "hover:bg-gray-50"
                    )}
                    onClick={() => onToggleItem(p.id)}
                  >
                    <Checkbox
                      checked={selectedIds.includes(p.id)}
                      onCheckedChange={() => onToggleItem(p.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-foreground truncate">
                        {p.name}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {p.email} • {p.company}
                        {p.groupName ? ` • ${p.groupName}` : ""}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isMoving}>
            Batal
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isMoving || selectedIds.length === 0 || !targetId}
          >
            {isMoving ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <MoveRight className="w-4 h-4 mr-2" />
            )}
            Pindahkan ({selectedIds.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
