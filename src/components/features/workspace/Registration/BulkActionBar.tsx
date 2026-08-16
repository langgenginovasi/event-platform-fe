"use client";

import { Mail, Trash2, Tags, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BulkActionBarProps {
  selectedCount: number;
  onSendEmail?: () => void;
  onCheckIn?: () => void;
  onCheckOut?: () => void;
  onEditParticipationType?: () => void;
  onDelete?: () => void;
  onClearSelection: () => void;
}

export function BulkActionBar({
  selectedCount,
  onSendEmail,
  onCheckIn,
  onCheckOut,
  onEditParticipationType,
  onDelete,
  onClearSelection,
}: BulkActionBarProps) {
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
        {onEditParticipationType && (
          <Button
            size="sm"
            variant="outline"
            className="text-violet-600 hover:text-violet-700 hover:bg-violet-50 border-violet-200"
            onClick={onEditParticipationType}
          >
            <Tags className="w-3.5 h-3.5 mr-1" />
            Ubah Status Kepesertaan
          </Button>
        )}
        {onSendEmail && (
          <Button
            size="sm"
            variant="outline"
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
            onClick={onSendEmail}
          >
            <Mail className="w-3.5 h-3.5 mr-1" />
            Kirim Email
          </Button>
        )}
        {onCheckIn && (
          <Button
            size="sm"
            variant="outline"
            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200"
            onClick={onCheckIn}
          >
            Masuk
          </Button>
        )}
        {onCheckOut && (
          <Button
            size="sm"
            variant="outline"
            className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 border-amber-200"
            onClick={onCheckOut}
          >
            Keluar
          </Button>
        )}
        {onDelete && (
          <Button
            size="sm"
            variant="outline"
            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            onClick={onDelete}
          >
            Hapus
          </Button>
        )}
      </div>
    </div>
  );
}
