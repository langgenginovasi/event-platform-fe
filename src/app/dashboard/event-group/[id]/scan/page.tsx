"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";
import {
  Camera,
  CheckCircle2,
  ScanLine,
  AlertCircle,
  ArrowDownToLine,
  ArrowUpFromLine,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// TODO: Replace with real API fetch
const mockSubEvents = [
  { id: 1, name: "Registrasi Utama" },
  { id: 2, name: "Sesi Pleno 1" },
  { id: 3, name: "Gala Dinner" },
];

export default function WorkspaceScanPage() {
  const params = useParams();
  const eventGroupId = params.id as string;

  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [scanType, setScanType] = useState<"IN" | "OUT" | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState<"IDLE" | "SUCCESS" | "ERROR">(
    "IDLE",
  );
  const [scanMessage, setScanMessage] = useState("");
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  const isReadyToScan = selectedEventId !== null && scanType !== null;

  useEffect(() => {
    if (isScanning && !scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner(
        "dashboard-qr-reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        },
        false,
      );

      scannerRef.current.render(onScanSuccess, onScanFailure);
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((error) => {
          console.error("Failed to clear html5QrcodeScanner. ", error);
        });
        scannerRef.current = null;
      }
    };
  }, [isScanning]);

  const requestCameraPermission = async () => {
    setCameraError(null);
    try {
      // Explicitly request camera permissions
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Stop the stream immediately, we just needed the permission
      stream.getTracks().forEach((track) => track.stop());
      setIsScanning(true);
    } catch (err: any) {
      console.error("Camera permission error:", err);
      if (
        err.name === "NotAllowedError" ||
        err.name === "PermissionDeniedError"
      ) {
        setCameraError(
          "Izin kamera ditolak. Silakan izinkan akses kamera di pengaturan browser Anda.",
        );
      } else if (
        err.name === "NotFoundError" ||
        err.name === "DevicesNotFoundError"
      ) {
        setCameraError("Tidak ada kamera yang terdeteksi di perangkat Anda.");
      } else {
        setCameraError("Gagal mengakses kamera. " + err.message);
      }
    }
  };

  const onScanSuccess = (decodedText: string) => {
    if (scanStatus === "IDLE") {
      setScanResult(decodedText);
      handleCheckIn(decodedText);
    }
  };

  const onScanFailure = (error: any) => {
    // Ignore scan failures as it continuously scans
  };

  const handleCheckIn = async (qrCode: string) => {
    setScanStatus("IDLE");
    setScanMessage("Verifikasi...");

    // TODO: Connect to backend API: POST /api/attendances
    // Payload should include: event_group_id, event_id, type, qr_code
    console.log("Scanning payload:", {
      eventGroupId,
      selectedEventId,
      scanType,
      qrCode,
    });

    setTimeout(() => {
      if (qrCode.length > 5) {
        setScanStatus("SUCCESS");
        setScanMessage(`Berhasil Check ${scanType === "IN" ? "In" : "Out"}!`);
      } else {
        setScanStatus("ERROR");
        setScanMessage("QR Code tidak valid.");
      }

      // Resume scanning after 3 seconds
      setTimeout(() => {
        setScanStatus("IDLE");
        setScanResult(null);
      }, 3000);
    }, 1000);
  };

  const stopScanning = () => {
    setIsScanning(false);
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
  };

  return (
    <div className="flex flex-col h-full max-w-md mx-auto space-y-6 pb-20">
      {/* Header Info */}
      <div className="text-center space-y-1">
        <h1
          className="text-2xl font-bold"
          style={{ color: "var(--brand-primary)" }}
        >
          Pemindai QR
        </h1>
        <p className="text-sm text-gray-500">
          Atur sesi acara lalu pindai QR Code peserta.
        </p>
      </div>

      <div className="card-base p-5 space-y-6 bg-white/70 backdrop-blur-xl border border-white/40 shadow-sm rounded-2xl relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--brand-light)] rounded-full blur-3xl opacity-30 -mr-10 -mt-10"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-100 rounded-full blur-2xl opacity-50 -ml-10 -mb-10"></div>

        {/* Step 1: Select Event */}
        <div className="space-y-3 relative z-10">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--brand-primary)] text-white text-xs font-bold shadow-md shadow-[var(--brand-primary)]/20">
              1
            </span>
            <h2 className="font-semibold text-gray-800">Pilih Event</h2>
          </div>
          <select
            className="w-full bg-white/50 backdrop-blur-md border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)] block p-3 outline-none transition-all shadow-sm"
            value={selectedEventId || ""}
            onChange={(e) => setSelectedEventId(Number(e.target.value))}
            disabled={isScanning}
          >
            <option value="" disabled>
              -- Pilih Sub-Event --
            </option>
            {mockSubEvents.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.name}
              </option>
            ))}
          </select>
        </div>

        {/* Step 2: Select Type */}
        <div className="space-y-3 relative z-10">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white transition-all shadow-md",
                selectedEventId
                  ? "bg-[var(--brand-primary)] shadow-[var(--brand-primary)]/20"
                  : "bg-gray-300 shadow-none",
              )}
            >
              2
            </span>
            <h2
              className={cn(
                "font-semibold transition-colors",
                selectedEventId ? "text-gray-800" : "text-gray-400",
              )}
            >
              Pilih Tipe Absensi
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              disabled={!selectedEventId || isScanning}
              onClick={() => setScanType("IN")}
              className={cn(
                "h-14 border-2 flex flex-col items-center justify-center gap-1 rounded-xl transition-all",
                scanType === "IN"
                  ? "border-emerald-500 bg-emerald-50/80 text-emerald-700 shadow-sm shadow-emerald-500/20"
                  : "hover:bg-gray-50/50 text-gray-600 bg-white/50 backdrop-blur-sm",
              )}
            >
              <ArrowDownToLine className="h-5 w-5" />
              <span>Check In</span>
            </Button>
            <Button
              variant="outline"
              disabled={!selectedEventId || isScanning}
              onClick={() => setScanType("OUT")}
              className={cn(
                "h-14 border-2 flex flex-col items-center justify-center gap-1 rounded-xl transition-all",
                scanType === "OUT"
                  ? "border-rose-500 bg-rose-50/80 text-rose-700 shadow-sm shadow-rose-500/20"
                  : "hover:bg-gray-50/50 text-gray-600 bg-white/50 backdrop-blur-sm",
              )}
            >
              <ArrowUpFromLine className="h-5 w-5" />
              <span>Check Out</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Step 3: Dialog Scanner */}
      <Dialog
        open={isScanning || scanStatus !== "IDLE"}
        onOpenChange={(open) => {
          if (!open) stopScanning();
        }}
      >
        <DialogContent className="max-w-4xl w-full p-0 overflow-hidden h-[90vh] md:h-[80vh] flex flex-col bg-black border-none rounded-2xl">
          <DialogTitle className="sr-only">Pemindai QR Code</DialogTitle>
          <DialogDescription className="sr-only">
            Arahkan kamera ke QR Code peserta untuk check-in/out.
          </DialogDescription>

          {scanStatus === "SUCCESS" || scanStatus === "ERROR" ? (
            <div className="flex flex-col items-center justify-center text-center space-y-4 p-8 flex-1 bg-white animate-in fade-in zoom-in duration-300 z-20">
              <div
                className={cn(
                  "w-32 h-32 rounded-full flex items-center justify-center shadow-lg",
                  scanStatus === "SUCCESS"
                    ? "bg-emerald-100 shadow-emerald-500/20"
                    : "bg-red-100 shadow-red-500/20",
                )}
              >
                {scanStatus === "SUCCESS" ? (
                  <CheckCircle2 className="w-16 h-16 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-16 h-16 text-red-600" />
                )}
              </div>
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  {scanStatus === "SUCCESS"
                    ? "Peserta Terverifikasi"
                    : "Akses Ditolak"}
                </h3>
                <p
                  className={cn(
                    "text-lg font-medium",
                    scanStatus === "SUCCESS"
                      ? "text-emerald-600"
                      : "text-red-600",
                  )}
                >
                  {scanMessage}
                </p>
                {scanResult && (
                  <p className="text-sm text-gray-400 mt-4 break-all px-4 max-w-lg mx-auto">
                    {scanResult}
                  </p>
                )}
              </div>
            </div>
          ) : isScanning ? (
            <div className="relative w-full h-full bg-black flex flex-col flex-1">
              {/* Close Button */}
              <button
                onClick={stopScanning}
                className="absolute top-6 right-6 z-50 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 backdrop-blur-md transition-all"
              >
                <X className="w-6 h-6" />
              </button>

              {/* The Html5QrcodeScanner container */}
              <div
                id="dashboard-qr-reader"
                className="w-full flex-1 border-none [&_video]:object-cover [&_video]:w-full [&_video]:h-full flex flex-col"
              />

              {/* Overlay Area */}
              <div className="absolute inset-0 pointer-events-none z-10 flex flex-col items-center justify-center pb-20">
                <div className="w-64 h-64 md:w-80 md:h-80 border-2 border-white/20 rounded-3xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                  {/* Scanner corners */}
                  <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-[var(--brand-primary)] rounded-tl-2xl"></div>
                  <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-[var(--brand-primary)] rounded-tr-2xl"></div>
                  <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-[var(--brand-primary)] rounded-bl-2xl"></div>
                  <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-[var(--brand-primary)] rounded-br-2xl"></div>

                  {/* Laser line */}
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-[var(--brand-primary)] shadow-[0_0_20px_var(--brand-primary)] animate-[scan_2s_ease-in-out_infinite]" />
                </div>
                <div className="absolute bottom-10 flex items-center bg-black/60 px-6 py-3 rounded-full backdrop-blur-md">
                  <ScanLine className="w-5 h-5 mr-3 text-[var(--brand-primary)] animate-pulse" />
                  <p className="text-white/95 font-medium text-lg">
                    Arahkan ke QR Code Peserta
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Start Button Area (Only visible when not scanning) */}
      {!isScanning && scanStatus === "IDLE" && (
        <div className="flex flex-col items-center text-center space-y-4 p-8">
          <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center shadow-inner">
            <Camera className="w-12 h-12 text-[var(--brand-primary)]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Kamera Siap</h3>
            <p className="text-sm text-gray-500 max-w-[200px] mx-auto mt-1">
              Sistem siap memindai QR code peserta.
            </p>
          </div>

          {cameraError && (
            <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg border border-red-100 flex items-start text-left gap-2 w-full">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>{cameraError}</p>
            </div>
          )}

          <Button
            size="lg"
            className="w-full mt-4 font-bold shadow-md shadow-[var(--brand-primary)]/20 rounded-xl h-12 text-md transition-transform hover:scale-[1.02]"
            style={{ backgroundColor: "var(--brand-primary)" }}
            onClick={requestCameraPermission}
          >
            Mulai Kamera
          </Button>
        </div>
      )}
    </div>
  );
}
