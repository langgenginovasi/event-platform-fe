"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const mockEvents = [
  { label: "Kongres Nasional 2026", value: 1 },
  { label: "Tech Summit 2026", value: 2 },
];

export default function ExportPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<string>("");

  const handleExport = async () => {
    if (!selectedEvent) return;
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Export berhasil! File sedang diunduh.");
    } catch {
      toast.error("Terjadi kesalahan saat export data.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-7 pb-20 md:pb-0">
      {/* Export form — matching old project layout */}
      <div className="flex flex-col sm:flex-row items-end gap-4">
        <div className="min-w-[20rem]">
          <label className="text-xs font-medium text-gray-500 block mb-1">
            Pilih Event
          </label>
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="w-full text-sm border border-gray-300 rounded-lg bg-gray-50 py-2.5 px-3 focus:ring-2 focus:ring-[var(--brand-light)] focus:border-[var(--brand-light)] outline-none"
          >
            <option value="">Pilih Event...</option>
            {mockEvents.map((ev) => (
              <option key={ev.value} value={ev.value}>
                {ev.label}
              </option>
            ))}
          </select>
        </div>

        <Button
          onClick={handleExport}
          disabled={isLoading || !selectedEvent}
          className="whitespace-nowrap bg-green-700 hover:bg-green-600 text-white disabled:bg-green-700/30"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          Export Data
        </Button>
      </div>
    </div>
  );
}
