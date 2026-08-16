"use client";

import { Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn, formatDate, formatDateLong, formatTime, formatGender } from "@/lib/utils";

interface DetailRegistrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading: boolean;
  detail: any;
  expandedEvents: Record<string, boolean>;
  onToggleExpand: (eventId: string) => void;
}

export function DetailRegistrationModal({
  open,
  onOpenChange,
  isLoading,
  detail,
  expandedEvents,
  onToggleExpand,
}: DetailRegistrationModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Detail Registrasi Peserta</DialogTitle>
        </DialogHeader>

        <DialogBody className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : detail ? (
            <>
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <p className="text-sm text-muted-foreground">Nama Peserta</p>
                  <p className="font-semibold text-foreground">
                    {detail.participant?.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-semibold text-foreground">
                    {detail.participant?.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Perusahaan</p>
                  <p className="font-medium text-foreground">
                    {detail.participant?.company}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Jenis Kelamin</p>
                  <p className="font-medium text-foreground">
                    {formatGender(detail.participant?.gender)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tipe Identitas</p>
                  <p className="font-medium text-foreground">
                    {detail.participant?.identification_type || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">No. Identitas</p>
                  <p className="font-medium text-foreground">
                    {detail.participant?.identification_number || "-"}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <div className="w-32 h-32 bg-white border border-gray-200 flex items-center justify-center p-2 mb-2">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${detail.qr_code}`}
                      alt="QR Code"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <p className="text-xs font-mono text-gray-500">
                    {detail.qr_code}
                  </p>
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Status Pendaftaran</p>
                    <span
                      className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold",
                        detail.status === "REGISTERED"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                      )}
                    >
                      {detail.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Grup Event</p>
                    <p className="font-medium text-foreground">
                      {detail.event_group?.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status Kepesertaan</p>
                    <p className="font-medium text-foreground">
                      {detail.participation_status?.name || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Terdaftar Pada</p>
                    <p className="font-medium text-foreground">
                      {formatDate(detail.created_at)}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3
                  className="text-lg font-bold mb-4"
                  style={{ color: "var(--brand-primary)" }}
                >
                  Riwayat Kehadiran
                </h3>
                {detail.attendances &&
                detail.attendances.length > 0 ? (
                  <div className="space-y-3">
                    {(() => {
                      const eventsMap = new Map<
                        string,
                        { event: any; checkins: any[]; checkouts: any[] }
                      >();
                      detail.attendances.forEach((att: any) => {
                        if (!eventsMap.has(att.event_id)) {
                          eventsMap.set(att.event_id, {
                            event: att.event,
                            checkins: [],
                            checkouts: [],
                          });
                        }
                        const log = eventsMap.get(att.event_id)!;
                        if (att.type === "checkin") log.checkins.push(att);
                        else log.checkouts.push(att);
                      });
                      return Array.from(eventsMap.values()).map((log, idx) => {
                        const eventId = log.event?.id || String(idx);
                        const isExpanded = expandedEvents[eventId] ?? false;
                        return (
                          <div
                            key={idx}
                            className="border rounded-xl overflow-hidden shadow-sm"
                          >
                            <button
                              type="button"
                              onClick={() => onToggleExpand(eventId)}
                              className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-50 transition-colors"
                            >
                              <span className="font-medium text-sm text-foreground">
                                {log.event?.name || "Event Tidak Diketahui"}
                              </span>
                              <ChevronDown className={cn(
                                "h-4 w-4 text-muted-foreground shrink-0 ml-2 transition-transform duration-200",
                                isExpanded && "rotate-180"
                              )} />
                            </button>
                            {isExpanded && (
                              <div className="border-t px-3 pb-3 pt-2 flex gap-8 text-sm">
                                <div>
                                  <span className="text-xs text-muted-foreground block mb-1">Waktu Masuk</span>
                                  {log.checkins.length > 0 ? (
                                    <div className="font-mono text-sm">
                                      <span className="block">{formatDateLong(log.checkins[0].scanned_at)}</span>
                                      <span className="block">{formatTime(log.checkins[0].scanned_at)}</span>
                                    </div>
                                  ) : (
                                    <span className="font-mono text-sm">-</span>
                                  )}
                                </div>
                                <div>
                                  <span className="text-xs text-muted-foreground block mb-1">Waktu Keluar</span>
                                  {log.checkouts.length > 0 ? (
                                    <div className="font-mono text-sm">
                                      <span className="block">{formatDateLong(log.checkouts[0].scanned_at)}</span>
                                      <span className="block">{formatTime(log.checkouts[0].scanned_at)}</span>
                                    </div>
                                  ) : (
                                    <span className="font-mono text-sm">-</span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    Belum ada data kehadiran (check-in/out).
                  </p>
                )}
              </div>
            </>
          ) : (
            <p className="text-sm text-center text-muted-foreground">
              Gagal memuat detail registrasi.
            </p>
          )}
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Tutup</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
