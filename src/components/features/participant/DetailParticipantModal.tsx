"use client";

import { ChevronDown, Loader2 } from "lucide-react";
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

interface DetailParticipantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading: boolean;
  detail: any;
  expandedGroups: Record<number, boolean>;
  onToggleExpand: (idx: number) => void;
}

export function DetailParticipantModal({
  open,
  onOpenChange,
  isLoading,
  detail,
  expandedGroups,
  onToggleExpand,
}: DetailParticipantModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Detail Peserta & Riwayat Kehadiran</DialogTitle>
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
                  <p className="font-semibold text-foreground">{detail.participant?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-semibold text-foreground">{detail.participant?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Perusahaan</p>
                  <p className="font-medium text-foreground">{detail.participant?.company}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Jenis Kelamin</p>
                  <p className="font-medium text-foreground">
                    {formatGender(detail.participant?.gender)}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Tipe Keanggotaan</p>
                  <p className="font-medium text-foreground">
                    {detail.participant?.membership_type?.name || "-"}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-foreground mb-4" style={{ color: "var(--brand-primary)" }}>
                  Riwayat Event
                </h3>
                {detail.history && detail.history.length > 0 ? (
                  <div className="space-y-3">
                    {detail.history.map((reg: any, idx: number) => {
                      const isExpanded = expandedGroups[idx] ?? false;
                      const eventCount = reg.events_attended?.length ?? 0;
                      return (
                        <div key={idx} className="border rounded-xl shadow-sm overflow-hidden">
                          <button
                            type="button"
                            onClick={() => onToggleExpand(idx)}
                            className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-sm truncate">{reg.event_group?.name}</h4>
                                <span className={cn(
                                  "text-xs px-2 py-0.5 rounded-full font-semibold shrink-0",
                                  reg.status === "REGISTERED" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
                                )}>
                                  {reg.status}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                {reg.participation_type && (
                                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-violet-50 text-violet-700 border border-violet-200">
                                    {reg.participation_type.name}
                                  </span>
                                )}
                                <p className="text-xs text-muted-foreground">
                                  {eventCount} event ·{" "}
                                  {reg.event_group?.start_date ? formatDate(reg.event_group.start_date) : "-"}{" "}
                                  s/d{" "}
                                  {reg.event_group?.end_date ? formatDate(reg.event_group.end_date) : "-"}
                                </p>
                              </div>
                            </div>
                            <ChevronDown className={cn(
                              "h-5 w-5 text-muted-foreground shrink-0 ml-2 transition-transform duration-200",
                              isExpanded && "rotate-180"
                            )} />
                          </button>

                          {isExpanded && (
                            <div className="border-t px-4 pb-4 pt-3 space-y-2">
                              {eventCount > 0 ? (
                                reg.events_attended.map((eventAtt: any, eIdx: number) => (
                                  <div key={eIdx} className="bg-slate-50 p-3 rounded-lg flex flex-col md:flex-row md:items-center justify-between text-sm border border-slate-100">
                                    <div className="font-medium text-foreground mb-2 md:mb-0">
                                      {eventAtt.event?.name}
                                    </div>
                                    <div className="flex gap-6">
                                      <div>
                                        <span className="text-xs text-muted-foreground block mb-1">Waktu Masuk</span>
                                        {eventAtt.checkin_at ? (
                                          <div className="font-mono text-sm">
                                            <span className="block">{formatDateLong(eventAtt.checkin_at)}</span>
                                            <span className="block">{formatTime(eventAtt.checkin_at)}</span>
                                          </div>
                                        ) : (
                                          <span className="font-mono">-</span>
                                        )}
                                      </div>
                                      <div>
                                        <span className="text-xs text-muted-foreground block mb-1">Waktu Keluar</span>
                                        {eventAtt.checkout_at ? (
                                          <div className="font-mono text-sm">
                                            <span className="block">{formatDateLong(eventAtt.checkout_at)}</span>
                                            <span className="block">{formatTime(eventAtt.checkout_at)}</span>
                                          </div>
                                        ) : (
                                          <span className="font-mono">-</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <p className="text-sm text-muted-foreground italic">Belum ada data kehadiran.</p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Peserta ini belum mengikuti event apapun.</p>
                )}
              </div>
            </>
          ) : (
            <p className="text-sm text-center text-muted-foreground">Gagal memuat detail peserta.</p>
          )}
        </DialogBody>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Tutup</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
