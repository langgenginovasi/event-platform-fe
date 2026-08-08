"use client";

import { Loader2 } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";

interface TableBodyStatesProps {
  isLoading: boolean;
  isEmpty: boolean;
  colSpan: number;
  emptyMessage?: string;
}

export function TableBodyStates({
  isLoading,
  isEmpty,
  colSpan,
  emptyMessage = "Tidak ada data",
}: TableBodyStatesProps) {
  if (isLoading) {
    return (
      <TableRow>
        <TableCell colSpan={colSpan} className="h-32 text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
        </TableCell>
      </TableRow>
    );
  }

  if (isEmpty) {
    return (
      <TableRow>
        <TableCell colSpan={colSpan} className="h-32 text-center text-muted-foreground text-sm">
          {emptyMessage}
        </TableCell>
      </TableRow>
    );
  }

  return null;
}
