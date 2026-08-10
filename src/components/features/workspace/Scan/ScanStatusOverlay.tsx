"use client";

import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ScanStatus = "IDLE" | "SUCCESS" | "ERROR" | "LOADING";

interface ScanStatusOverlayProps {
  status: Extract<ScanStatus, "LOADING" | "SUCCESS" | "ERROR">;
  message: string;
  result?: string | null;
}

export function ScanStatusOverlay({ status, message, result }: ScanStatusOverlayProps) {
  if (status === "LOADING") {
    return (
      <div className="flex flex-col items-center justify-center text-center space-y-4 p-8 h-full bg-white animate-in fade-in zoom-in duration-300 z-20">
        <div className="w-32 h-32 rounded-full flex items-center justify-center shadow-lg bg-blue-100 shadow-blue-500/20">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
        </div>
        <div>
          <h3 className="text-3xl font-bold text-gray-900 mb-2">Memproses...</h3>
          <p className="text-lg font-medium text-blue-600">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-4 p-8 h-full bg-white animate-in fade-in zoom-in duration-300 z-20">
      <div
        className={cn(
          "w-32 h-32 rounded-full flex items-center justify-center shadow-lg",
          status === "SUCCESS"
            ? "bg-emerald-100 shadow-emerald-500/20"
            : "bg-red-100 shadow-red-500/20"
        )}
      >
        {status === "SUCCESS" ? (
          <CheckCircle2 className="w-16 h-16 text-emerald-600" />
        ) : (
          <AlertCircle className="w-16 h-16 text-red-600" />
        )}
      </div>
      <div>
        <h3 className="text-3xl font-bold text-gray-900 mb-2">
          {status === "SUCCESS" ? "Peserta Terverifikasi" : "Akses Ditolak"}
        </h3>
        <p className={cn("text-lg font-medium", status === "SUCCESS" ? "text-emerald-600" : "text-red-600")}>
          {message}
        </p>
        {result && (
          <p className="text-sm text-gray-400 mt-4 break-all px-4 max-w-lg mx-auto">{result}</p>
        )}
      </div>
    </div>
  );
}
