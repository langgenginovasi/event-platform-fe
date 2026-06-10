"use client";

import { useState } from "react";
import { Camera, CheckCircle2, ScanLine, AlertCircle, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const mockSubEvents = [
  { id: 1, name: "Registrasi Utama" },
  { id: 2, name: "Sesi Pleno 1" },
  { id: 3, name: "Gala Dinner" },
];

export default function WorkspaceScanPage() {
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [scanType, setScanType] = useState<"IN" | "OUT" | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState<"IDLE" | "SUCCESS" | "ERROR">("IDLE");

  // Mock scan function
  const handleStartScan = () => {
    setIsScanning(true);
    setScanStatus("IDLE");
    
    // Simulate finding a QR code after 3 seconds
    setTimeout(() => {
      setIsScanning(false);
      setScanStatus("SUCCESS");
      
      // Reset back to idle after 2 seconds
      setTimeout(() => {
        setScanStatus("IDLE");
      }, 2500);
    }, 3000);
  };

  const isReadyToScan = selectedEventId !== null && scanType !== null;

  return (
    <div className="flex flex-col h-full max-w-md mx-auto space-y-6 pb-20">
      
      {/* Header Info */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold" style={{ color: "var(--brand-primary)" }}>
          Pemindai QR
        </h1>
        <p className="text-sm text-gray-500">
          Ikuti langkah di bawah untuk mulai absensi.
        </p>
      </div>

      <div className="card-base p-5 space-y-6">
        
        {/* Step 1: Select Event */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--brand-primary)] text-white text-xs font-bold">1</span>
            <h2 className="font-semibold text-gray-800">Pilih Event</h2>
          </div>
          <select 
            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)] block p-3 outline-none"
            value={selectedEventId || ""}
            onChange={(e) => setSelectedEventId(Number(e.target.value))}
          >
            <option value="" disabled>-- Pilih Sub-Event --</option>
            {mockSubEvents.map(ev => (
              <option key={ev.id} value={ev.id}>{ev.name}</option>
            ))}
          </select>
        </div>

        {/* Step 2: Select Type */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className={cn("flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white transition-colors", selectedEventId ? "bg-[var(--brand-primary)]" : "bg-gray-300")}>2</span>
            <h2 className={cn("font-semibold", selectedEventId ? "text-gray-800" : "text-gray-400")}>Pilih Tipe Absensi</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              disabled={!selectedEventId}
              onClick={() => setScanType("IN")}
              className={cn(
                "h-14 border-2 flex flex-col items-center justify-center gap-1",
                scanType === "IN" 
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-700" 
                  : "hover:bg-gray-50 text-gray-600"
              )}
            >
              <ArrowDownToLine className="h-5 w-5" />
              <span>Check In</span>
            </Button>
            <Button
              variant="outline"
              disabled={!selectedEventId}
              onClick={() => setScanType("OUT")}
              className={cn(
                "h-14 border-2 flex flex-col items-center justify-center gap-1",
                scanType === "OUT" 
                  ? "border-rose-500 bg-rose-50 text-rose-700 hover:bg-rose-50 hover:text-rose-700" 
                  : "hover:bg-gray-50 text-gray-600"
              )}
            >
              <ArrowUpFromLine className="h-5 w-5" />
              <span>Check Out</span>
            </Button>
          </div>
        </div>

      </div>

      {/* Step 3: Scanner Area */}
      <div className={cn("card-base p-5 flex flex-col items-center justify-center min-h-[300px] transition-opacity duration-300", isReadyToScan ? "opacity-100" : "opacity-50 pointer-events-none")}>
        
        {scanStatus === "SUCCESS" ? (
          <div className="flex flex-col items-center text-center space-y-4 animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Budi Santoso</h3>
              <p className="text-emerald-600 font-medium">Berhasil {scanType === "IN" ? "Check In" : "Check Out"}</p>
              <p className="text-sm text-gray-500 mt-1">ID: P-998273</p>
            </div>
          </div>
        ) : isScanning ? (
          <div className="relative w-full max-w-[250px] aspect-square bg-black/5 rounded-xl border-2 border-dashed border-[var(--brand-primary)] overflow-hidden flex items-center justify-center">
            {/* Animated scan line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-[var(--brand-light)] shadow-[0_0_15px_rgba(0,163,255,0.8)] animate-[scan_2s_ease-in-out_infinite]" />
            <ScanLine className="w-16 h-16 text-gray-400 opacity-50" />
            <p className="absolute bottom-4 text-xs font-semibold text-[var(--brand-primary)] animate-pulse">Memindai...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
              <Camera className="w-10 h-10 text-[var(--brand-primary)]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Kamera Siap</h3>
              <p className="text-sm text-gray-500 max-w-[200px] mx-auto mt-1">Posisikan QR Code di tengah layar untuk memindai.</p>
            </div>
            <Button 
              size="lg" 
              className="w-full mt-2 font-bold"
              style={{ backgroundColor: "var(--brand-primary)" }}
              onClick={handleStartScan}
            >
              Mulai Scan
            </Button>
          </div>
        )}

      </div>
    </div>
  );
}
