"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";

interface CreateEventGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: { name: string; start_date: string; end_date: string };
  onFormChange: (form: any) => void;
  errors: { name: string; start_date: string; end_date: string; api: string };
  onErrorsChange: (errors: any) => void;
  isLoading: boolean;
  onSubmit: () => void;
}

export function CreateEventGroupModal({
  open,
  onOpenChange,
  form,
  onFormChange,
  errors,
  onErrorsChange,
  isLoading,
  onSubmit,
}: CreateEventGroupModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Buat Grup Event</DialogTitle>
        </DialogHeader>
        <DialogBody className="space-y-4">
          {errors.api && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {errors.api}
            </div>
          )}
          <div>
            <Input
              type="text"
              placeholder="Nama Grup Event"
              value={form.name}
              onChange={(e) => {
                onFormChange({ ...form, name: e.target.value });
                onErrorsChange({ ...errors, name: "" });
              }}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>
          <div>
            <Input
              type="datetime-local"
              value={form.start_date}
              onChange={(e) => {
                onFormChange({ ...form, start_date: e.target.value });
                onErrorsChange({ ...errors, start_date: "" });
              }}
              className={errors.start_date ? "border-red-500" : ""}
            />
            {errors.start_date && <p className="mt-1 text-xs text-red-500">{errors.start_date}</p>}
          </div>
          <div>
            <Input
              type="datetime-local"
              value={form.end_date}
              onChange={(e) => {
                onFormChange({ ...form, end_date: e.target.value });
                onErrorsChange({ ...errors, end_date: "" });
              }}
              className={errors.end_date ? "border-red-500" : ""}
            />
            {errors.end_date && <p className="mt-1 text-xs text-red-500">{errors.end_date}</p>}
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={onSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Menyimpan...
              </>
            ) : (
              "Simpan"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
