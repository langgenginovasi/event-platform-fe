import React from "react";
import { Search } from "lucide-react";

export interface TableToolbarProps {
  title: React.ReactNode;
  keyword: string;
  setKeyword: (val: string) => void;
  searchPlaceholder?: string;
  actionButton?: React.ReactNode;
}

export function TableToolbar({
  title,
  keyword,
  setKeyword,
  searchPlaceholder = "Cari data...",
  actionButton,
}: TableToolbarProps) {
  return (
    <div className="p-5 border-b border-gray-100 bg-white flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <h2 className="text-lg font-bold" style={{ color: "var(--brand-primary)" }}>
        {title}
      </h2>
      
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-gray-400" />
          </div>
          <input
            type="search"
            autoComplete="off"
            className="block w-full px-3 py-2 pl-9 text-sm text-gray-900 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-[var(--brand-light)] focus:border-[var(--brand-light)] outline-none transition-all"
            placeholder={searchPlaceholder}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>

        {actionButton && (
          <div className="w-full sm:w-auto">
            {actionButton}
          </div>
        )}
      </div>
    </div>
  );
}
