"use client";

import { Check, X, Loader2 } from "lucide-react";

interface InlineSaveCancelButtonsProps {
  isLoading?: boolean;
  onSave: () => void;
  onCancel: () => void;
}

export function InlineSaveCancelButtons({
  isLoading = false,
  onSave,
  onCancel,
}: InlineSaveCancelButtonsProps) {
  return (
    <div className="inline-flex shrink-0 items-center overflow-hidden rounded-full border border-slate-300">
      <button
        type="button"
        title="Simpan"
        onClick={onSave}
        disabled={isLoading}
        className="inline-flex h-6 w-7 items-center justify-center text-emerald-600 transition-colors hover:bg-emerald-50 disabled:pointer-events-none disabled:opacity-50"
      >
        {isLoading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Check className="h-3.5 w-3.5" />
        )}
      </button>
      <span className="h-4 w-px shrink-0 bg-slate-300" aria-hidden />
      <button
        type="button"
        title="Batal"
        onClick={onCancel}
        disabled={isLoading}
        className="inline-flex h-6 w-7 items-center justify-center text-rose-600 transition-colors hover:bg-rose-50 disabled:pointer-events-none disabled:opacity-50"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
