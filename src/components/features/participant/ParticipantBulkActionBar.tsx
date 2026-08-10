"use client";

import { Plus, Import, Tags, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ParticipantBulkActionBarProps {
  selectedCount: number;
  onAddToGroup: () => void;
  onEditMembershipType?: () => void;
  onDelete?: () => void;
  canDelete?: boolean;
  onClearSelection: () => void;
}

export function ParticipantBulkActionBar({
  selectedCount,
  onAddToGroup,
  onEditMembershipType,
  onDelete,
  canDelete = false,
  onClearSelection,
}: ParticipantBulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="bg-blue-50/50 border-b border-blue-100 px-5 py-3 flex items-center justify-between animate-in slide-in-from-top-2">
      <span className="text-sm font-medium text-blue-800">
        {selectedCount} peserta dipilih
      </span>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="text-slate-600 hover:text-slate-700 hover:bg-slate-100 border-slate-200"
          onClick={onClearSelection}
        >
          <X className="w-3.5 h-3.5 mr-1" />
          Batal Pilih
        </Button>
        {onEditMembershipType && (
          <Button
            size="sm"
            variant="outline"
            className="text-violet-600 hover:text-violet-700 hover:bg-violet-50 border-violet-200"
            onClick={onEditMembershipType}
          >
            <Tags className="w-3.5 h-3.5 mr-1" />
            Ubah Tipe Keanggotaan
          </Button>
        )}
        {canDelete && onDelete && (
          <Button
            size="sm"
            variant="outline"
            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            onClick={onDelete}
          >
            Hapus Peserta
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
          onClick={onAddToGroup}
        >
          Tambahkan ke Event Group
        </Button>
      </div>
    </div>
  );
}
