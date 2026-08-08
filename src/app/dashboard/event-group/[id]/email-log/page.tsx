"use client";

import { useParams } from "next/navigation";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { Button } from "@/components/ui/button";
import { ContentCard, ContentCardBody } from "@/components/shared/CustomCards";
import { Mail, RefreshCw } from "lucide-react";
import { EmailLogSummary } from "@/components/features/email-log/EmailLogSummary";
import { EmailBatchCompactCard } from "@/components/features/email-log/EmailBatchCompactCard";

export default function EmailLogPage() {
  const { id } = useParams() as { id: string };

  const { data, isLoading, mutate } = useSWR<any>(
    `/email-batches?event_group_id=${id}&limit=50`,
    fetcher,
    { refreshInterval: 5000 }
  );

  const batches = data?.data || [];

  return (
    <div className="flex flex-col space-y-6 pb-20 md:pb-0">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm text-gray-500">
          Log pengiriman email untuk workspace ini. Diperbarui otomatis setiap 5 detik.
        </p>
        <Button variant="outline" size="sm" onClick={() => mutate()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Perbarui
        </Button>
      </div>

      {isLoading && (
        <div className="text-center py-12 text-gray-400">Memuat log...</div>
      )}

      {!isLoading && batches.length === 0 && (
        <ContentCard>
          <ContentCardBody>
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 space-y-3">
              <Mail className="w-12 h-12 opacity-30" />
              <p className="text-sm font-medium">Belum ada riwayat pengiriman email untuk workspace ini.</p>
              <p className="text-xs text-center max-w-xs">
                Log akan muncul di sini setelah Anda melakukan pengiriman email dari menu Registrasi atau Ringkasan Workspace.
              </p>
            </div>
          </ContentCardBody>
        </ContentCard>
      )}

      {!isLoading && batches.length > 0 && (
        <>
          <EmailLogSummary batches={batches} title="Ringkasan Pengiriman Email" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {batches.map((batch: any) => (
              <EmailBatchCompactCard key={batch.id} batch={batch} showEventGroup />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
