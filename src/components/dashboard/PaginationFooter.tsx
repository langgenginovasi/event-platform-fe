import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface PaginationFooterProps {
  currentPage: number;
  totalPage: number;
  totalData: number;
  onPrev?: () => void;
  onNext?: () => void;
  onPageChange?: (page: number) => void;
  limit?: number;
}

export function PaginationFooter({
  currentPage,
  totalPage,
  totalData,
  onPrev,
  onNext,
  onPageChange,
  limit = 10,
}: PaginationFooterProps) {
  // Safe bounds
  const safeTotalPage = totalPage > 0 ? totalPage : 1;
  const safeCurrentPage = currentPage > safeTotalPage ? safeTotalPage : currentPage;

  const start = totalData === 0 ? 0 : (safeCurrentPage - 1) * limit + 1;
  const end = Math.min(safeCurrentPage * limit, totalData);

  const getPageNumbers = () => {
    const pages = [];
    if (safeTotalPage <= 5) {
      for (let i = 1; i <= safeTotalPage; i++) pages.push(i);
    } else {
      if (safeCurrentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", safeTotalPage);
      } else if (safeCurrentPage >= safeTotalPage - 2) {
        pages.push(1, "...", safeTotalPage - 3, safeTotalPage - 2, safeTotalPage - 1, safeTotalPage);
      } else {
        pages.push(1, "...", safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1, "...", safeTotalPage);
      }
    }
    return pages;
  };

  return (
    <div className="p-4 border-t border-gray-100 bg-gray-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <p className="text-sm text-gray-500 text-center sm:text-left">
        Menampilkan <span className="font-medium text-gray-900">{start} - {end}</span> dari <span className="font-medium text-gray-900">{totalData}</span> data
      </p>
      
      <div className="flex items-center space-x-1 w-full sm:w-auto justify-center sm:justify-end">
        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8 border-gray-200" 
          disabled={safeCurrentPage <= 1}
          onClick={() => {
            if (onPrev) onPrev();
            if (onPageChange) onPageChange(safeCurrentPage - 1);
          }}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {getPageNumbers().map((page, index) => (
          typeof page === "number" ? (
            <Button
              key={index}
              variant={safeCurrentPage === page ? "default" : "outline"}
              size="icon"
              className={`h-8 w-8 text-sm ${safeCurrentPage === page ? "bg-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/90" : "border-gray-200"}`}
              onClick={() => onPageChange && onPageChange(page)}
            >
              {page}
            </Button>
          ) : (
            <span key={index} className="px-2 text-gray-500">
              {page}
            </span>
          )
        ))}

        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8 border-gray-200" 
          disabled={safeCurrentPage >= safeTotalPage}
          onClick={() => {
            if (onNext) onNext();
            if (onPageChange) onPageChange(safeCurrentPage + 1);
          }}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
