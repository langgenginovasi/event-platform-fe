"use client";

import { Import, Trash2, Loader2, FileSpreadsheet, Download } from "lucide-react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { ExcelPreviewData } from "@/hooks/useParticipantActions";
import { formatGender } from "@/lib/utils";

interface ImportExcelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  excelData: ExcelPreviewData[];
  onExcelDataChange: (data: ExcelPreviewData[]) => void;
  fileName: string;
  onFileNameChange: (name: string) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
  onImport: () => void;
  onClose: () => void;
}

export function ImportExcelModal({
  open,
  onOpenChange,
  excelData,
  onExcelDataChange,
  fileName,
  onFileNameChange,
  fileInputRef,
  onFileChange,
  isLoading,
  onImport,
  onClose,
}: ImportExcelModalProps) {
  const handleDownloadTemplate = () => {
    const headers = [
      "Nama (Wajib)",
      "Email (Wajib)",
      "Jenis Kelamin (Wajib)",
      "Perusahaan (Wajib)",
      "Tipe Identitas (Opsional)",
      "No. Identitas (Opsional)",
      "Tipe Keanggotaan (Opsional)",
    ];
    const example = [
      "Nama Peserta",
      "peserta@example.com",
      "L",
      "PT Contoh",
      "KTP",
      "3201012345670001",
      "Anggota",
    ];
    const ws = XLSX.utils.aoa_to_sheet([headers, example]);
    ws["!cols"] = headers.map((h) => ({ wch: Math.max(h.length + 4, 18) }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template Peserta");
    XLSX.writeFile(wb, "Template_Import_Peserta.xlsx");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-green-600" />
              Import Data Peserta via Excel
            </DialogTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Kolom wajib: Nama, Email, Jenis Kelamin (L/P), Perusahaan
            </p>
            <p className="text-xs text-muted-foreground">
              Kolom opsional: Tipe Identitas, No. Identitas, Tipe Keanggotaan
            </p>
          </div>
        </DialogHeader>

        <DialogBody className="space-y-6">
          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={handleDownloadTemplate} className="shrink-0">
              <Download className="w-4 h-4 mr-2" />
              Download Template
            </Button>
          </div>

          <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer relative group">
            <input
              type="file"
              ref={fileInputRef}
              onChange={onFileChange}
              accept=".xlsx, .xls"
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center gap-2">
              <Import className="w-8 h-8 text-muted-foreground group-hover:text-green-600 transition-colors" />
              <p className="text-sm font-medium text-foreground">
                {fileName ? `File terpilih: ${fileName}` : "Klik atau seret file Excel ke sini"}
              </p>
              <p className="text-xs text-muted-foreground">
                Mendukung ekstensi .xlsx, .xls
              </p>
            </div>
          </div>

          {excelData.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">
                  Pratinjau Data ({excelData.length} Baris ditemukan):
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onExcelDataChange([]);
                    onFileNameChange("");
                  }}
                  className="text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Bersihkan
                </Button>
              </div>

              <div className="border rounded-xl overflow-hidden max-h-[350px] overflow-y-auto">
                <Table>
                  <TableHeader className="bg-slate-50 sticky top-0">
                    <TableRow>
                      <TableHead>No</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead>Jenis Kelamin</TableHead>
                      <TableHead>Perusahaan</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Tipe Identitas</TableHead>
                      <TableHead>No. Identitas</TableHead>
                      <TableHead>Keanggotaan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {excelData.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="text-muted-foreground font-mono text-xs">{idx + 1}</TableCell>
                        <TableCell className="font-medium text-foreground">
                          {row.name || <span className="text-destructive italic">Kosong</span>}
                        </TableCell>
                        <TableCell>{formatGender(row.gender)}</TableCell>
                        <TableCell>{row.company || <span className="text-muted-foreground italic">-</span>}</TableCell>
                        <TableCell>{row.email || <span className="text-destructive italic">Kosong</span>}</TableCell>
                        <TableCell>{row.identification_type || <span className="text-muted-foreground italic">-</span>}</TableCell>
                        <TableCell>{row.identification_number || <span className="text-muted-foreground italic">-</span>}</TableCell>
                        <TableCell>{row.membership_type_name || <span className="text-muted-foreground italic">-</span>}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Batal
          </Button>
          <Button onClick={onImport} disabled={isLoading || excelData.length === 0}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan ({excelData.length} data)...
              </>
            ) : (
              "Konfirmasi & Simpan Ke Database"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
