"use client";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, Clock, Layers, CalendarDays } from "lucide-react";

const STATUS_LABEL: Record<string, string> = {
  processing: "Diproses",
  completed: "Selesai",
};

const BATCH_TYPE_LABEL: Record<string, string> = {
  test: "Test Email",
  bulk: "Bulk / Massal",
  single: "Single Email",
};

interface EmailBatchCompactCardProps {
  batch: any;
  showEventGroup?: boolean;
}

export function EmailBatchCompactCard({ batch, showEventGroup = false }: EmailBatchCompactCardProps) {
  const sent = batch.stats?.sent || 0;
  const failed = batch.stats?.failed || 0;
  const queued = batch.stats?.queued || 0;
  const sending = batch.stats?.sending || 0;
  const total = batch.total_jobs || 1;
  const percent = Math.round((sent / total) * 100);
  const isDone = batch.status === "completed";

  return (
    <div className="border rounded-xl p-4 space-y-3 bg-white">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge>{BATCH_TYPE_LABEL[batch.type] || batch.type}</Badge>
          {showEventGroup && (
            <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              {batch.event_group
                ? batch.event_group.name
                : batch.type === "test"
                ? "Global (Test)"
                : "Tanpa Grup"}
            </span>
          )}
        </div>
        <Badge variant={isDone ? "default" : "secondary"}>
          {STATUS_LABEL[batch.status] || batch.status}
        </Badge>
      </div>

      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Progress Pengiriman</span>
          <span>{percent}% ({sent}/{total})</span>
        </div>
        <Progress value={percent} className="h-2" />
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 flex-wrap gap-2">
        <span className="flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> {sent} Terkirim
        </span>
        <span className="flex items-center gap-1">
          <XCircle className="w-3.5 h-3.5 text-red-500" /> {failed} Gagal
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-blue-500" /> {queued + sending} Antrean
        </span>
        <span className="flex items-center gap-1">
          <CalendarDays className="w-3.5 h-3.5" />
          {new Date(batch.created_at).toLocaleString("id-ID", {
            day: "numeric", month: "short", year: "numeric",
            hour: "2-digit", minute: "2-digit"
          })}
        </span>
      </div>
    </div>
  );
}
