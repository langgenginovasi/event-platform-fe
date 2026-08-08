"use client";

import { Plus, Import } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ParticipantBulkActionBarProps {
  selectedCount: number;
  onAddToGroup: () => void;
  onDelete?: () => void;
  canDelete?: boolean;
}

export function ParticipantBulkActionBar({
  selectedCount,
  onAddToGroup,
  onDelete,
  canDelete = false,
}: ParticipantBulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="bg-blue-50/50 border-b border-blue-100 px-5 py-3 flex items-center justify-between animate-in slide-in-from-top-2">
      <span className="text-sm font-medium text-blue-800">
        {selectedCount} peserta dipilih
      </span>
      <div className="flex gap-2">
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
