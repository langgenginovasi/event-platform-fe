"use client";

import { useRouter } from "next/navigation";
import { Calendar, ChevronRight } from "lucide-react";
import { TableCard } from "@/components/shared/CustomCards";
import { Table, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";

interface RecentEventGroupsTableProps {
  groups: any[];
}

export function RecentEventGroupsTable({ groups }: RecentEventGroupsTableProps) {
  const router = useRouter();
  const today = new Date();

  return (
    <TableCard>
      <div className="p-5 border-b flex justify-between items-center bg-white/50">
        <h2
          className="text-lg font-bold"
          style={{ color: "var(--brand-primary)" }}
        >
          Grup Event
        </h2>
        <a
          href="/dashboard/event-group"
          className="text-sm font-semibold transition-colors"
          style={{ color: "var(--brand-light)" }}
        >
          Lihat Semua
        </a>
      </div>

      <Table>
        <TableBody>
          {groups.map((group: any) => {
            const status =
              new Date(group.start_date) <= today && new Date(group.end_date) >= today
                ? "Aktif"
                : "Mendatang";

            return (
              <TableRow
                key={group.id}
                onClick={() => router.push(`/dashboard/event-group/${group.id}`)}
                className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-gray-50 group cursor-pointer"
              >
                <TableCell>
                  <h3
                    className="text-base font-semibold text-gray-800 group-hover:transition-colors"
                    style={{ color: "var(--brand-primary)" }}
                  >
                    {group.name}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    {group._count?.registrations ?? 0} peserta
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(group.start_date)}
                    {" - "}
                    {formatDate(group.end_date)}
                  </p>
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        status === "Aktif"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-blue-50 border-blue-200"
                      }`}
                      style={status !== "Aktif" ? { color: "var(--brand-primary)" } : {}}
                    >
                      {status}
                    </span>
                    <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableCard>
  );
}
