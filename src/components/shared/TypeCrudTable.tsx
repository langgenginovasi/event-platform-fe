"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableCard } from "@/components/shared/CustomCards";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { TableToolbar } from "@/components/shared/TableToolbar";
import { TableBodyStates } from "@/components/shared/TableBodyStates";
import { generateSlug } from "@/lib/utils";

interface TypeCrudTableProps {
  title: string;
  entityName: string;
  items: any[];
  isLoading: boolean;
  columns: { label: string; accessor: (item: any) => React.ReactNode }[];
  countColumn?: { label: string; accessor: (item: any) => number };
  isDialogOpen: boolean;
  onDialogChange: (open: boolean) => void;
  editingItem: any;
  name: string;
  onNameChange: (v: string) => void;
  slug: string;
  onSlugChange: (v: string) => void;
  sortOrder: number;
  onSortOrderChange: (v: number) => void;
  saving: boolean;
  onOpenDialog: (item?: any) => void;
  onSave: () => void;
  onDelete: (item: any) => void;
  namePlaceholder?: string;
  slugPlaceholder?: string;
}

export function TypeCrudTable({
  title,
  entityName,
  items,
  isLoading,
  columns,
  countColumn,
  isDialogOpen,
  onDialogChange,
  editingItem,
  name,
  onNameChange,
  slug,
  onSlugChange,
  sortOrder,
  onSortOrderChange,
  saving,
  onOpenDialog,
  onSave,
  onDelete,
  namePlaceholder = "Contoh: Nama Type",
  slugPlaceholder = "Contoh: nama-type",
}: TypeCrudTableProps) {
  const colSpan = 1 + columns.length + (countColumn ? 1 : 0) + 1;

  return (
    <div className="flex flex-col space-y-7 md:space-y-10 pb-20 md:pb-0">
      <TableCard>
        <TableToolbar
          title={title}
          keyword=""
          setKeyword={() => {}}
          searchPlaceholder=""
          actionButton={
            <Button onClick={() => onOpenDialog()} className="whitespace-nowrap w-full">
              <Plus className="w-4 h-4 mr-1" />
              Tambah
            </Button>
          }
        />

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>No</TableHead>
                {columns.map((col) => (
                  <TableHead key={col.label}>{col.label}</TableHead>
                ))}
                {countColumn && <TableHead>{countColumn.label}</TableHead>}
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableBodyStates isLoading={isLoading} isEmpty={items.length === 0} colSpan={colSpan} emptyMessage={`Belum ada ${entityName.toLowerCase()}`} />

              {!isLoading &&
                items.map((item: any, idx: number) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                    {columns.map((col) => (
                      <TableCell key={col.label} className={col.label === "Nama" ? "font-semibold text-foreground" : "text-muted-foreground"}>
                        {col.accessor(item)}
                      </TableCell>
                    ))}
                    {countColumn && (
                      <TableCell className="text-muted-foreground">{countColumn.accessor(item)}</TableCell>
                    )}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => onOpenDialog(item)}>
                          <Pencil className="w-3.5 h-3.5 mr-1.5" />
                          Ubah
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDelete(item)}
                          className="text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                          Hapus
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </TableCard>

      <Dialog open={isDialogOpen} onOpenChange={onDialogChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? `Edit ${entityName}` : `Tambah ${entityName}`}
            </DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Nama</label>
              <Input
                value={name}
                onChange={(e) => {
                  onNameChange(e.target.value);
                  if (!editingItem) {
                    onSlugChange(generateSlug(e.target.value));
                  }
                }}
                placeholder={namePlaceholder}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Slug</label>
              <Input
                value={slug}
                onChange={(e) => onSlugChange(e.target.value)}
                placeholder={slugPlaceholder}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Urutan</label>
              <Input
                type="number"
                value={sortOrder}
                onChange={(e) => onSortOrderChange(parseInt(e.target.value) || 0)}
              />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => onDialogChange(false)} disabled={saving}>
              Batal
            </Button>
            <Button onClick={onSave} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
