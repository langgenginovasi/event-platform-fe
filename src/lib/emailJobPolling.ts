import { api } from "./api";

export interface EmailJobStatus {
  id: string;
  to: string;
  subject: string;
  status: "queued" | "sending" | "sent" | "failed";
  attempts: number;
  error?: string;
}

export interface EmailJobPollResult {
  sent: number;
  failed: number;
  timedOut: boolean;
  failures: { to: string; error?: string }[];
}

const POLL_INTERVAL_MS = 1500;
const POLL_TIMEOUT_MS = 60000;

/**
 * Menunggu email job selesai (sent/failed) dengan polling ke /api/email-jobs/:id.
 * @param jobIds Daftar job id yang dikembalikan oleh BE saat enqueue.
 * @param onProgress Callback (done, total) setiap ada progress.
 */
export async function pollEmailJobs(
  jobIds: string[],
  onProgress?: (done: number, total: number) => void
): Promise<EmailJobPollResult> {
  const uniqueIds = Array.from(new Set(jobIds));
  const statuses = new Map<string, string>();
  const failures: { to: string; error?: string }[] = [];
  const start = Date.now();

  while (statuses.size < uniqueIds.length) {
    if (Date.now() - start > POLL_TIMEOUT_MS) break;

    await Promise.all(
      uniqueIds.map(async (id) => {
        if (statuses.has(id)) return;
        try {
          const res = await api.get<{ data: EmailJobStatus }>(`/email-jobs/${id}`);
          const job = res?.data;
          if (job && (job.status === "sent" || job.status === "failed")) {
            statuses.set(id, job.status);
            if (job.status === "failed") {
              failures.push({ to: job.to, error: job.error });
            }
            onProgress?.(statuses.size, uniqueIds.length);
          }
        } catch {
          // error transien (mis. jaringan), lanjutkan polling
        }
      })
    );

    if (statuses.size < uniqueIds.length) {
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    }
  }

  const timedOut = statuses.size < uniqueIds.length;
  let sent = 0;
  statuses.forEach((status) => {
    if (status === "sent") sent += 1;
  });

  return { sent, failed: failures.length, timedOut, failures };
}
