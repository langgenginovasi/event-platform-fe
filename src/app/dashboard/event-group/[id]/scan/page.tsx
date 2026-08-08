"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { Html5Qrcode } from "html5-qrcode";
import {
  Camera,
  ScanBarcode,
  CheckCircle2,
  ScanLine,
  AlertCircle,
  ArrowDownToLine,
  ArrowUpFromLine,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { GlassCard } from "@/components/shared/CustomCards";
import { cn, extractApiError } from "@/lib/utils";
import { ScanCard, ScanStep } from "@/components/shared/ScanCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";
import { GET_EVENTS } from "@/lib/api-endpoints";

type ScanMode = "camera" | "scanner";
type ScanStatus = "IDLE" | "SUCCESS" | "ERROR" | "LOADING";

export default function WorkspaceScanPage() {
  const { id } = useParams() as { id: string };
  const eventGroupId = id;

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [scanType, setScanType] = useState<"checkin" | "checkout" | null>(null);
  const [scanMode, setScanMode] = useState<ScanMode | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [scanStatus, setScanStatus] = useState<ScanStatus>("IDLE");
  const [scanMessage, setScanMessage] = useState("");
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scannerInput, setScannerInput] = useState("");
  const scannerInputRef = useRef<HTMLInputElement>(null);

  const { data: eventsRes, isLoading: eventsLoading } = useSWR(
    GET_EVENTS(eventGroupId, 1, 100),
    { revalidateOnFocus: false }
  );
  const subEvents = eventsRes?.data || [];

  const isReadyToScan = selectedEventId !== null && scanType !== null;

  const resetScanFeedback = useCallback(() => {
    setScanStatus("IDLE");
    setScanMessage("");
    setScanResult(null);
  }, []);

  const processScanCode = useCallback(
    async (qrCode: string): Promise<boolean> => {
      if (!selectedEventId || !scanType) return false;
      if (scanStatus !== "IDLE") return false;

      setScanResult(qrCode);
      setScanStatus("LOADING");
      setScanMessage("Memverifikasi QR Code...");

      try {
        const response: any = await api.post("/attendances/scan", {
          qr_code: qrCode,
          event_id: selectedEventId,
          type: scanType,
        });
        const participantName =
          response?.data?.registration?.participant?.name || "Peserta";
        setScanStatus("SUCCESS");
        setScanMessage(`Berhasil ${scanType === "checkin" ? "Masuk" : "Keluar"}! ${participantName}`);
      } catch (error: any) {
        setScanStatus("ERROR");
        setScanMessage(extractApiError(error, "Gagal memproses QR Code"));
      } finally {
        window.setTimeout(() => {
          setScanStatus("IDLE");
          setScanResult(null);
        }, 3000);
      }
      return true;
    },
    [selectedEventId, scanType, scanStatus]
  );

  // Physical scanner (USB/HID keyboard-wedge): captures fast-typed code, debounced
  useEffect(() => {
    if (scanMode !== "scanner") return;
    const code = scannerInput.trim();
    if (!code) return;
    const timer = window.setTimeout(() => {
      setScannerInput("");
      processScanCode(code);
    }, 200);
    return () => window.clearTimeout(timer);
  }, [scannerInput, scanMode, processScanCode]);

  // Keep the scanner input focused so scanned keystrokes always land in it
  useEffect(() => {
    if (scanMode === "scanner") {
      scannerInputRef.current?.focus();
    }
  }, [scanMode]);

  const onScanSuccess = useCallback(
    (decodedText: string) => {
      processScanCode(decodedText);
    },
    [processScanCode]
  );

  const handleSelectMode = (mode: ScanMode) => {
    setIsCameraOpen(false);
    setCameraError(null);
    resetScanFeedback();
    setScanMode(mode);
  };

  const requestCameraPermission = async () => {
    setCameraError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError(
        "Kamera tidak tersedia. Pastikan halaman diakses melalui HTTPS atau localhost."
      );
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop());
      setIsCameraOpen(true);
    } catch (err: any) {
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setCameraError("Izin kamera ditolak. Silakan izinkan akses kamera di pengaturan browser Anda.");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setCameraError("Tidak ada kamera yang terdeteksi di perangkat Anda.");
      } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
        setCameraError("Kamera sedang digunakan oleh aplikasi lain.");
      } else {
        setCameraError("Gagal mengakses kamera. " + err.message);
      }
    }
  };

  const stopCamera = () => setIsCameraOpen(false);

  const handleDialogClose = (open: boolean) => {
    if (!open) setIsCameraOpen(false);
  };

  return (
    <div className="flex flex-col h-full max-w-md mx-auto space-y-6 pb-20">
      <ScanCard>
        <ScanStep step={1} title="Pilih Event">
          <Select
            items={subEvents.map((ev: any) => ({ value: ev.id, label: ev.name }))}
            value={selectedEventId || ""}
            onValueChange={(v) => setSelectedEventId((v as string) || null)}
            disabled={isCameraOpen || eventsLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder={eventsLoading ? "Memuat data event..." : "-- Pilih Event --"} />
            </SelectTrigger>
            <SelectContent>
              {subEvents.map((ev: any) => (
                <SelectItem key={ev.id} value={ev.id}>
                  {ev.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {eventsLoading && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Memuat daftar event...</span>
            </div>
          )}
        </ScanStep>

        <ScanStep step={2} title="Pilih Tipe Kehadiran" active={!!selectedEventId}>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              disabled={!selectedEventId || isCameraOpen}
              onClick={() => setScanType("checkin")}
              className={cn(
                "h-14 border-2 flex flex-col items-center justify-center gap-1 rounded-xl transition-all",
                scanType === "checkin"
                  ? "border-emerald-500 bg-emerald-50/80 text-emerald-700 shadow-sm shadow-emerald-500/20"
                  : "hover:bg-gray-50/50 text-gray-600 bg-white/50 backdrop-blur-sm"
              )}
            >
              <ArrowDownToLine className="h-5 w-5" />
              <span>Masuk</span>
            </Button>
            <Button
              variant="outline"
              disabled={!selectedEventId || isCameraOpen}
              onClick={() => setScanType("checkout")}
              className={cn(
                "h-14 border-2 flex flex-col items-center justify-center gap-1 rounded-xl transition-all",
                scanType === "checkout"
                  ? "border-rose-500 bg-rose-50/80 text-rose-700 shadow-sm shadow-rose-500/20"
                  : "hover:bg-gray-50/50 text-gray-600 bg-white/50 backdrop-blur-sm"
              )}
            >
              <ArrowUpFromLine className="h-5 w-5" />
              <span>Keluar</span>
            </Button>
          </div>
        </ScanStep>

        <ScanStep step={3} title="Pilih Metode Scan" active={isReadyToScan}>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              disabled={!isReadyToScan}
              onClick={() => handleSelectMode("camera")}
              className={cn(
                "h-16 border-2 flex flex-col items-center justify-center gap-1.5 rounded-xl transition-all",
                scanMode === "camera"
                  ? "border-[var(--brand-primary)] bg-[var(--brand-light)] text-[var(--brand-primary)] shadow-sm"
                  : "hover:bg-gray-50/50 text-gray-600 bg-white/50 backdrop-blur-sm"
              )}
            >
              <Camera className="h-6 w-6" />
              <span>Kamera</span>
            </Button>
            <Button
              variant="outline"
              disabled={!isReadyToScan}
              onClick={() => handleSelectMode("scanner")}
              className={cn(
                "h-16 border-2 flex flex-col items-center justify-center gap-1.5 rounded-xl transition-all",
                scanMode === "scanner"
                  ? "border-[var(--brand-primary)] bg-[var(--brand-light)] text-[var(--brand-primary)] shadow-sm"
                  : "hover:bg-gray-50/50 text-gray-600 bg-white/50 backdrop-blur-sm"
              )}
            >
              <ScanBarcode className="h-6 w-6" />
              <span>Scanner Fisik</span>
            </Button>
          </div>
        </ScanStep>
      </ScanCard>

      {/* ── Camera mode: start button area ─────────────────────────── */}
      {scanMode === "camera" && scanStatus === "IDLE" && (
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
            onClick={requestCameraPermission}
          >
            Mulai Kamera
          </Button>
        </div>
      )}

      {/* ── Physical scanner mode ───────────────────────────────────── */}
      {scanMode === "scanner" && (
        <GlassCard className="p-5">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center shadow-inner">
              <ScanBarcode className="w-8 h-8 text-[var(--brand-primary)]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Scanner Fisik Siap</h3>
              <p className="text-sm text-gray-500 max-w-[280px] mx-auto mt-1">
                Klik kolom di bawah, lalu pindai QR Code peserta dengan scanner fisik (USB/HID).
                Kode akan diproses otomatis.
              </p>
            </div>

            <input
              ref={scannerInputRef}
              autoFocus
              value={scannerInput}
              onChange={(e) => setScannerInput(e.target.value)}
              onBlur={() => window.setTimeout(() => scannerInputRef.current?.focus(), 0)}
              placeholder="Menunggu scan..."
              className="w-full h-12 text-center text-lg font-mono tracking-widest rounded-xl border-2 border-dashed border-gray-300 bg-white/60 outline-none transition-colors focus:border-[var(--brand-primary)]"
            />

            {scanStatus === "LOADING" && (
              <div className="w-full bg-blue-50 text-blue-600 text-sm p-3 rounded-lg border border-blue-100 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                <span>{scanMessage}</span>
              </div>
            )}
            {scanStatus === "SUCCESS" && (
              <div className="w-full bg-emerald-50 text-emerald-700 text-sm p-3 rounded-lg border border-emerald-100 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{scanMessage}</span>
              </div>
            )}
            {scanStatus === "ERROR" && (
              <div className="w-full bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 flex items-start justify-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="text-left">{scanMessage}</span>
              </div>
            )}
          </div>
        </GlassCard>
      )}

      {/* ── Camera Scanner Dialog ───────────────────────────────────── */}
      <Dialog
        open={scanMode === "camera" && (isCameraOpen || scanStatus !== "IDLE")}
        onOpenChange={handleDialogClose}
      >
        <DialogContent
          showCloseButton={false}
          className="p-0 overflow-hidden sm:max-w-lg max-h-[90vh] h-[80vh] sm:h-[70vh]"
        >
          <DialogTitle className="sr-only">Pemindai QR Code</DialogTitle>
          <DialogDescription className="sr-only">
            Arahkan kamera ke QR Code peserta untuk check-in/out.
          </DialogDescription>

          {scanStatus === "LOADING" ? (
            <div className="flex flex-col items-center justify-center text-center space-y-4 p-8 h-full bg-white animate-in fade-in zoom-in duration-300 z-20">
              <div className="w-32 h-32 rounded-full flex items-center justify-center shadow-lg bg-blue-100 shadow-blue-500/20">
                <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">Memproses...</h3>
                <p className="text-lg font-medium text-blue-600">{scanMessage}</p>
              </div>
            </div>
          ) : scanStatus === "SUCCESS" || scanStatus === "ERROR" ? (
            <div className="flex flex-col items-center justify-center text-center space-y-4 p-8 h-full bg-white animate-in fade-in zoom-in duration-300 z-20">
              <div
                className={cn(
                  "w-32 h-32 rounded-full flex items-center justify-center shadow-lg",
                  scanStatus === "SUCCESS"
                    ? "bg-emerald-100 shadow-emerald-500/20"
                    : "bg-red-100 shadow-red-500/20"
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
                  {scanStatus === "SUCCESS" ? "Peserta Terverifikasi" : "Akses Ditolak"}
                </h3>
                <p className={cn("text-lg font-medium", scanStatus === "SUCCESS" ? "text-emerald-600" : "text-red-600")}>
                  {scanMessage}
                </p>
                {scanResult && (
                  <p className="text-sm text-gray-400 mt-4 break-all px-4 max-w-lg mx-auto">{scanResult}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="relative w-full h-full bg-black flex flex-col">
              {/* Close Button */}
              <button
                onClick={stopCamera}
                className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 backdrop-blur-md transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Camera Feed */}
              <QRScanner onScanSuccess={onScanSuccess} onError={setCameraError} />

              {/* Camera error banner */}
              {cameraError && (
                <div className="absolute bottom-24 left-4 right-4 z-50 bg-red-50 text-red-600 text-xs p-3 rounded-lg border border-red-100 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="text-left">{cameraError}</p>
                </div>
              )}

              {/* Overlay */}
              <div className="absolute inset-0 pointer-events-none z-10 flex flex-col items-center justify-center">
                <div className="w-56 h-56 md:w-72 md:h-72 border-2 border-white/20 rounded-3xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                  <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-[var(--brand-primary)] rounded-tl-2xl"></div>
                  <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-[var(--brand-primary)] rounded-tr-2xl"></div>
                  <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-[var(--brand-primary)] rounded-bl-2xl"></div>
                  <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-[var(--brand-primary)] rounded-br-2xl"></div>
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-[var(--brand-primary)] shadow-[0_0_20px_var(--brand-primary)] animate-[scan_2s_ease-in-out_infinite]" />
                </div>
                <div className="absolute bottom-8 flex items-center bg-black/60 px-6 py-3 rounded-full backdrop-blur-md">
                  <ScanLine className="w-5 h-5 mr-3 text-[var(--brand-primary)] animate-pulse" />
                  <p className="text-white/95 font-medium text-lg">Arahkan ke QR Code Peserta</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

const QR_SCANNER_ELEMENT_ID = "dashboard-qr-reader";

function QRScanner({
  onScanSuccess,
  onError,
}: {
  onScanSuccess: (decodedText: string) => void;
  onError: (message: string) => void;
}) {
  const successRef = useRef(onScanSuccess);
  const errorRef = useRef(onError);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    successRef.current = onScanSuccess;
  }, [onScanSuccess]);

  useEffect(() => {
    errorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    let cancelled = false;
    let scanner: Html5Qrcode | null = null;

    const startScanner = async () => {
      // Small delay to ensure DOM element is ready & dialog finished animating
      await new Promise((r) => setTimeout(r, 250));
      if (cancelled) return;

      const element = document.getElementById(QR_SCANNER_ELEMENT_ID);
      if (!element) {
        errorRef.current("Elemen pemindai tidak ditemukan.");
        return;
      }

      if (!navigator.mediaDevices?.getUserMedia || !navigator.mediaDevices?.enumerateDevices) {
        errorRef.current("Kamera tidak didukung. Pastikan halaman diakses melalui HTTPS atau localhost.");
        return;
      }

      scanner = new Html5Qrcode(QR_SCANNER_ELEMENT_ID);
      scannerRef.current = scanner;

      try {
        const cameras = await Html5Qrcode.getCameras();
        if (cancelled) return;
        if (cameras.length === 0) {
          errorRef.current("Tidak ada kamera yang terdeteksi di perangkat ini.");
          return;
        }

        // Prefer back/rear camera
        const backCamera = cameras.find((c) => /back|rear/i.test(c.label));
        const cameraId = backCamera?.id || cameras[0].id;

        await scanner.start(
          cameraId,
          { fps: 10, qrbox: { width: 200, height: 200 }, aspectRatio: 1.0 },
          (text) => {
            if (!cancelled) successRef.current(text);
          },
          () => {} // ignore scan failures
        );
      } catch (err: any) {
        if (cancelled) return;
        console.error("Failed to start QR scanner:", err);
        if (err?.name === "NotAllowedError") {
          errorRef.current("Izin kamera ditolak. Izinkan akses kamera pada browser Anda.");
        } else if (err?.name === "NotFoundError" || err?.name === "DevicesNotFoundError") {
          errorRef.current("Tidak ada kamera yang terdeteksi di perangkat ini.");
        } else {
          errorRef.current(
            `Gagal memulai kamera: ${err?.message || "kesalahan tidak diketahui"}`
          );
        }
      }
    };

    startScanner();

    return () => {
      cancelled = true;
      if (scanner) {
        try {
          if (scanner.isScanning) {
            scanner.stop().then(() => {
              scanner?.clear();
            }).catch(() => {
              scanner?.clear();
            });
          } else {
            scanner.clear();
          }
        } catch (e) {
          console.error("Cleanup error", e);
        }
      }
      scannerRef.current = null;
    };
  }, []);

  return (
    <div
      id={QR_SCANNER_ELEMENT_ID}
      className="w-full h-full flex-1 [&_video]:object-cover [&_video]:w-full [&_video]:h-full"
    />
  );
}
