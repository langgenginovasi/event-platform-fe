"use client";

import { Plus, Import } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ParticipantBulkActionBarProps {
  selectedCount: number;
  onAddToGroup: () => void;
}

export function ParticipantBulkActionBar({
  selectedCount,
  onAddToGroup,
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
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
          onClick={onAddToGroup}
        >
          Tambahkan ke Event Group
        </Button>
      </div>
    </div>
  );
}
