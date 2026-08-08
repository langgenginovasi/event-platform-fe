"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";

interface CreateParticipantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: {
    name: string;
    email: string;
    gender: string;
    company: string;
    membership_type_id: string;
    identification_type?: string;
    identification_number?: string;
  };
  onFormChange: (form: any) => void;
  errors: {
    name: string;
    email: string;
    gender: string;
    company: string;
    api: string;
  };
  onErrorsChange: (errors: any) => void;
  membershipTypes: any[];
  isLoading: boolean;
  onSubmit: () => void;
}

export function CreateParticipantModal({
  open,
  onOpenChange,
  form,
  onFormChange,
  errors,
  onErrorsChange,
  membershipTypes,
  isLoading,
  onSubmit,
}: CreateParticipantModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Peserta</DialogTitle>
        </DialogHeader>
        <DialogBody className="space-y-4">
          {errors.api && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {errors.api}
            </div>
          )}
          <div>
            <label className="text-sm font-medium mb-1 block">Nama</label>
            <Input
              type="text"
              value={form.name}
              onChange={(e) => {
                onFormChange({ ...form, name: e.target.value });
                onErrorsChange({ ...errors, name: "" });
              }}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Email</label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => {
                onFormChange({ ...form, email: e.target.value });
                onErrorsChange({ ...errors, email: "" });
              }}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Jenis Kelamin</label>
            <Select
              items={[
                { value: "L", label: "Laki-laki" },
                { value: "P", label: "Perempuan" },
              ]}
              value={form.gender}
              onValueChange={(v) => {
                onFormChange({ ...form, gender: v as string });
                onErrorsChange({ ...errors, gender: "" });
              }}
            >
              <SelectTrigger className={errors.gender ? "border-red-500" : ""}>
                <SelectValue placeholder="Pilih Jenis Kelamin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="L">Laki-laki</SelectItem>
                <SelectItem value="P">Perempuan</SelectItem>
              </SelectContent>
            </Select>
            {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Perusahaan</label>
            <Input
              type="text"
              value={form.company}
              onChange={(e) => {
                onFormChange({ ...form, company: e.target.value });
                onErrorsChange({ ...errors, company: "" });
              }}
              className={errors.company ? "border-red-500" : ""}
            />
            {errors.company && <p className="text-red-500 text-xs mt-1">{errors.company}</p>}
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Tipe Keanggotaan (Opsional)</label>
            <Select
              items={[
                { value: "__none__", label: "-- Tidak Ditentukan --" },
                ...membershipTypes.map((mt: any) => ({
                  value: String(mt.id),
                  label: mt.name,
                })),
              ]}
              value={form.membership_type_id || "__none__"}
              onValueChange={(v) =>
                onFormChange({
                  ...form,
                  membership_type_id: (v as string) === "__none__" ? "" : (v as string),
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Tipe Keanggotaan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">-- Tidak Ditentukan --</SelectItem>
                {membershipTypes.map((mt: any) => (
                  <SelectItem key={mt.id} value={String(mt.id)}>
                    {mt.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Tipe Identitas (Opsional)</label>
              <Select
                items={[
                  { value: "__none__", label: "-- Pilih Tipe --" },
                  { value: "KTP", label: "KTP" },
                  { value: "KTA", label: "KTA" },
                  { value: "PASSPORT", label: "Passport" },
                  { value: "OTHER", label: "Lainnya" },
                ]}
                value={form.identification_type || "__none__"}
                onValueChange={(v) =>
                  onFormChange({
                    ...form,
                    identification_type: (v as string) === "__none__" ? "" : (v as string),
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Tipe Identitas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">-- Pilih Tipe --</SelectItem>
                  <SelectItem value="KTP">KTP</SelectItem>
                  <SelectItem value="KTA">KTA</SelectItem>
                  <SelectItem value="PASSPORT">Passport</SelectItem>
                  <SelectItem value="OTHER">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">No. Identitas (Opsional)</label>
              <Input
                type="text"
                value={form.identification_number || ""}
                onChange={(e) => {
                  onFormChange({ ...form, identification_number: e.target.value });
                }}
                placeholder="Masukkan Nomor Identitas"
              />
            </div>
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
                Memproses...
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
