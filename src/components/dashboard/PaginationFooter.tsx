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
}

export function PaginationFooter({
  currentPage,
  totalPage,
  totalData,
  onPrev,
  onNext,
  onPageChange,
}: PaginationFooterProps) {
  // Safe bounds
  const safeTotalPage = totalPage > 0 ? totalPage : 1;
  const safeCurrentPage = currentPage > safeTotalPage ? safeTotalPage : currentPage;

  return (
    <div className="p-4 border-t border-gray-100 bg-gray-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <p className="text-sm text-gray-500 text-center sm:text-left">
        Menampilkan total <span className="font-medium text-gray-900">{totalData}</span> data
      </p>
      
      <div className="flex items-center space-x-2 w-full sm:w-auto justify-center sm:justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 px-2 border-gray-200" 
          disabled={safeCurrentPage <= 1}
          onClick={onPrev}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="text-sm text-gray-600 font-medium min-w-[3rem] text-center">
          {safeCurrentPage} / {safeTotalPage}
        </span>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 px-2 border-gray-200" 
          disabled={safeCurrentPage >= safeTotalPage}
          onClick={onNext}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
