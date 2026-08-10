"use client";

import { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

const QR_SCANNER_ELEMENT_ID = "dashboard-qr-reader";

export function QRScanner({
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
