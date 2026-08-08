"use client";

import { Search, UserPlus, Loader2 } from "lucide-react";
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

interface AddParticipantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  search: string;
  onSearchChange: (val: string) => void;
  participants: any[];
  selectedIds: string[];
  onToggleParticipant: (id: string) => void;
  onToggleAll: (checked: boolean) => void;
  participationTypes: any[];
  participationTypeId: string;
  onParticipationTypeChange: (val: string) => void;
  isRegistering: boolean;
  onRegister: () => void;
}

export function AddParticipantModal({
  open,
  onOpenChange,
  search,
  onSearchChange,
  participants,
  selectedIds,
  onToggleParticipant,
  onToggleAll,
  participationTypes,
  participationTypeId,
  onParticipationTypeChange,
  isRegistering,
  onRegister,
}: AddParticipantModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Peserta ke Event Group</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Pilih peserta dari daftar global yang belum terdaftar di event group ini.
          </p>
        </DialogHeader>

        <DialogBody className="space-y-4">
          {participationTypes.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Tipe Partisipasi</label>
              <Select
                items={[
                  { value: "", label: "-- Tidak Ditentukan --" },
                  ...participationTypes
                    .filter((pt: any) => pt.is_active)
                    .map((pt: any) => ({
                      value: pt.participation_type?.id || pt.id,
                      label: pt.participation_type?.name || pt.name,
                    })),
                ]}
                value={participationTypeId}
                onValueChange={(v) => onParticipationTypeChange(v as string)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="-- Pilih Tipe Partisipasi --" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">-- Tidak Ditentukan --</SelectItem>
                  {participationTypes
                    .filter((pt: any) => pt.is_active)
                    .map((pt: any) => (
                      <SelectItem key={pt.participation_type?.id || pt.id} value={pt.participation_type?.id || pt.id}>
                        {pt.participation_type?.name || pt.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
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
                {selectedIds.length} peserta dipilih
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
            {participants.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-sm">
                {search
                  ? "Tidak ditemukan peserta yang cocok."
                  : "Semua peserta sudah terdaftar di event group ini."}
              </div>
            ) : (
              <div className="space-y-1">
                <div className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 border-b border-gray-100">
                  <Checkbox
                    checked={
                      selectedIds.length === participants.length &&
                      participants.length > 0
                    }
                    onCheckedChange={(checked) =>
                      onToggleAll(checked as boolean)
                    }
                  />
                  <span className="text-sm font-semibold text-gray-600">
                    Pilih Semua ({participants.length})
                  </span>
                </div>

                {participants.map((p: any) => (
                  <div
                    key={p.id}
                    className={cn(
                      "flex items-center space-x-3 px-3 py-3 rounded-lg cursor-pointer transition-colors",
                      selectedIds.includes(p.id)
                        ? "bg-blue-50 hover:bg-blue-100"
                        : "hover:bg-gray-50"
                    )}
                    onClick={() => onToggleParticipant(p.id)}
                  >
                    <Checkbox
                      checked={selectedIds.includes(p.id)}
                      onCheckedChange={() => onToggleParticipant(p.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-foreground truncate">
                        {p.name}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {p.email} • {p.company}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {p.gender === "L" ? "L" : "P"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogBody>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isRegistering}
          >
            Batal
          </Button>
          <Button
            onClick={onRegister}
            disabled={isRegistering || selectedIds.length === 0}
          >
            {isRegistering ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <UserPlus className="w-4 h-4 mr-2" />
            )}
            Daftarkan ({selectedIds.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
