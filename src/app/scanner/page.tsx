"use client";

import { useEffect, useState, useRef } from "react";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";
import { LogOut, CheckCircle2, AlertCircle, ScanLine } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ScannerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState<"idle" | "success" | "error">("idle");
  const [scanMessage, setScanMessage] = useState("");
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    // Only initialize if we haven't already
    if (!scannerRef.current && status === "authenticated") {
      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
        },
        /* verbose= */ false
      );

      scannerRef.current.render(onScanSuccess, onScanFailure);
    }

    return () => {
      // Cleanup
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.error("Failed to clear html5QrcodeScanner. ", error);
        });
        scannerRef.current = null;
      }
    };
  }, [status]);

  const onScanSuccess = (decodedText: string) => {
    if (scanStatus === "idle") {
      setScanResult(decodedText);
      handleCheckIn(decodedText);
    }
  };

  const onScanFailure = (error: any) => {
    // We ignore failures as they just mean "no QR found yet"
  };

  const handleCheckIn = async (qrCode: string) => {
    setScanStatus("idle");
    setScanMessage("Verifying...");
    
    // Simulate API Call for now
    setTimeout(() => {
      if (qrCode.length > 5) {
        setScanStatus("success");
        setScanMessage(`Check-in successful!`);
      } else {
        setScanStatus("error");
        setScanMessage("Invalid QR Code.");
      }

      // Reset after 3 seconds
      setTimeout(() => {
        setScanStatus("idle");
        setScanResult(null);
      }, 3000);
    }, 1000);
  };

  if (status !== "authenticated") return null;

  return (
    <div className="flex-1 flex flex-col relative h-full">
      {/* Header */}
      <div className="absolute top-0 left-0 w-full z-20 p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
        <div>
          <h1 className="text-lg font-bold text-white shadow-sm">Field Scanner</h1>
          <p className="text-xs text-slate-300">Operator: {session?.user?.name}</p>
        </div>
        <button 
          onClick={() => signOut({ callbackUrl: '/' })}
          className="p-2 bg-red-500/20 text-red-400 rounded-full hover:bg-red-500/40 transition-colors backdrop-blur-md"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* Main Scanner Area */}
      <div className="flex-1 relative flex flex-col justify-center bg-black">
        {/* The target div for html5-qrcode */}
        <div id="qr-reader" className="w-full border-none [&_video]:object-cover [&_video]:h-screen" />
        
        {/* Custom Overlay for Scanner Targeting */}
        {scanStatus === "idle" && (
          <div className="absolute inset-0 pointer-events-none z-10 flex flex-col items-center justify-center">
             <div className="w-64 h-64 border-2 border-blue-500/50 rounded-2xl relative">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-xl"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-xl"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-xl"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-xl"></div>
             </div>
             <p className="mt-8 text-white/80 font-medium animate-pulse flex items-center bg-black/40 px-4 py-2 rounded-full backdrop-blur-md">
               <ScanLine className="w-4 h-4 mr-2" />
               Arahkan ke QR Code Peserta
             </p>
          </div>
        )}
      </div>

      {/* Result Overlay */}
      {scanStatus !== "idle" && (
        <div className={`absolute bottom-0 left-0 w-full p-6 z-30 transition-transform duration-300 translate-y-0 rounded-t-3xl backdrop-blur-xl border-t border-white/10
          ${scanStatus === "success" ? "bg-emerald-900/90" : "bg-red-900/90"}
        `}>
          <div className="flex flex-col items-center text-center">
            {scanStatus === "success" ? (
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-10 h-10" />
              </div>
            ) : (
              <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-10 h-10" />
              </div>
            )}
            <h2 className="text-xl font-bold text-white mb-2">
              {scanStatus === "success" ? "Berhasil!" : "Gagal!"}
            </h2>
            <p className="text-slate-200 mb-2">{scanMessage}</p>
            {scanResult && <p className="text-xs text-white/50 break-all">{scanResult}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
