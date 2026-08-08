"use client";

import { ContentCard, ContentCardHeader, ContentCardBody } from "@/components/shared/CustomCards";
import { Mail, CheckCircle2, XCircle, Clock, Layers } from "lucide-react";

interface EmailLogSummaryProps {
  batches: any[];
  title?: string;
}

export function EmailLogSummary({ batches, title = "Ringkasan Pengiriman Email" }: EmailLogSummaryProps) {
  const summary = batches.reduce(
    (acc, batch) => {
      const stats = batch.stats || {};
      acc.total += batch.total_jobs || 0;
      acc.sent += stats.sent || 0;
      acc.failed += stats.failed || 0;
      acc.queued += (stats.queued || 0) + (stats.sending || 0);
      acc.batchCount += 1;
      return acc;
    },
    { total: 0, sent: 0, failed: 0, queued: 0, batchCount: 0 }
  );

  const stats = [
    { label: "Total Email", value: summary.total, icon: Mail, className: "text-gray-800" },
    { label: "Terkirim", value: summary.sent, icon: CheckCircle2, className: "text-green-700" },
    { label: "Gagal", value: summary.failed, icon: XCircle, className: "text-red-600" },
    { label: "Antrean", value: summary.queued, icon: Clock, className: "text-blue-600" },
    { label: "Total Batch", value: summary.batchCount, icon: Layers, className: "text-amber-600" },
  ];

  return (
    <ContentCard>
      <ContentCardHeader icon={Mail} title={title} />
      <ContentCardBody>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-gray-50 rounded-lg p-3 text-center">
                <Icon className={`w-4 h-4 mx-auto mb-1 ${stat.className}`} />
                <p className="text-lg font-bold text-gray-800">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </ContentCardBody>
    </ContentCard>
  );
}
