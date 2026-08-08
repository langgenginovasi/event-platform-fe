"use client";

import { useRouter } from "next/navigation";
import { Eye, Mail, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PaginationFooter } from "@/components/shared/PaginationFooter";
import { cn, formatDate } from "@/lib/utils";
import { usePermissions } from "@/hooks/usePermissions";
import { TableBodyStates } from "@/components/shared/TableBodyStates";

interface EventGroupItem {
  id: string;
  name: string;
  description: string;
  date_start: string;
  date_end: string;
  participants: number;
}

interface EventGroupTableProps {
  items: EventGroupItem[];
  isLoading: boolean;
  onDelete: (id: string) => void;
}

export function EventGroupTable({ items, isLoading, onDelete }: EventGroupTableProps) {
  const { can } = usePermissions();
  const router = useRouter();

  return (
    <div className="relative overflow-x-auto">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="w-12 text-center">
              <Checkbox />
            </TableHead>
            <TableHead>Nama</TableHead>
            <TableHead>Deskripsi</TableHead>
            <TableHead>Tgl Mulai</TableHead>
            <TableHead>Tgl Selesai</TableHead>
            <TableHead className="text-center">Peserta</TableHead>
            <TableHead className="text-right">Opsi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableBodyStates isLoading={isLoading} isEmpty={items.length === 0} colSpan={7} emptyMessage="Tidak ada data grup event" />

          {!isLoading && items.map((event) => (
            <TableRow
              key={event.id}
              className="hover:bg-blue-50/50 transition-colors cursor-pointer"
              onClick={() => router.push(`/dashboard/event-group/${event.id}`)}
            >
              <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                <Checkbox />
              </TableCell>
              <TableCell className="font-semibold" style={{ color: "var(--brand-primary)" }}>
                {event.name}
              </TableCell>
              <TableCell className="text-muted-foreground max-w-xs truncate">
                {event.description}
              </TableCell>
              <TableCell className="text-muted-foreground">{event.date_start}</TableCell>
              <TableCell className="text-muted-foreground">{event.date_end}</TableCell>
              <TableCell className="text-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-medium bg-blue-50 text-blue-700">
                  {event.participants}
                </span>
              </TableCell>
              <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 border-gray-200"
                    onClick={() => router.push(`/dashboard/event-group/${event.id}`)}
                  >
                    <Eye className="w-3.5 h-3.5 mr-1.5" /> Buka
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={event.participants === 0}
                    className={cn(
                      "h-8",
                      event.participants > 0
                        ? "text-blue-700 border-blue-200 hover:bg-blue-50"
                        : "text-gray-400 border-gray-200",
                    )}
                  >
                    <Mail className="w-3.5 h-3.5 mr-1.5" /> Email
                  </Button>
                  {can("eventGroupManage") && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => onDelete(event.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Hapus
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
