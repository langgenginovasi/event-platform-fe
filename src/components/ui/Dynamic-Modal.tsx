"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export interface DynamicField {
  name: string;
  label: string;
  placeholder?: string;
  // Diperketat tipenya agar TypeScript tidak komplain
  type?:
    | "text"
    | "email"
    | "number"
    | "select"
    | "date"
    | "datetime-local"
    | "textarea";
  options?: {
    label: string;
    value: string;
  }[];
}

interface DynamicModalProps {
  title: string;
  confirmLabel: string;
  showDates?: boolean;
  fields: DynamicField[];
  formState: any;
  setFormState: any;
  errors: any;
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
  children?: ReactNode;
  mode?: "create" | "edit" | "detail";
}

export default function DynamicModal({
  title,
  confirmLabel,
  showDates = true,
  fields,
  formState,
  setFormState,
  errors,
  isOpen,
  isLoading,
  onClose,
  onConfirm,
  mode = "create",
}: DynamicModalProps) {
  if (!isOpen) return null;

  const isDetail = mode === "detail";

  const handleInputChange = (name: string, value: string) => {
    if (isDetail) return;
    setFormState((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl">
        <h2 className="text-xl font-bold text-blue-950 mb-5">{title}</h2>

        <div className="space-y-4">
          {errors?.api && (
            <div className="rounded-md bg-red-50 p-2.5 text-xs text-red-600 border border-red-200">
              {errors.api}
            </div>
          )}

          {fields.map((field) => (
            <div
              key={field.name}
              className={
                isDetail ? "border-b border-gray-100 pb-3 last:border-0" : ""
              }
            >
              <label className="block text-sm font-medium text-gray-500 mb-1">
                {field.label}
              </label>

              {/* DESAIN JIKA MODE DETAIL (TANPA FORM/TEXTFIELD) */}
              {isDetail ? (
                <div className="text-sm font-semibold text-gray-800 whitespace-pre-wrap min-h-[20px]">
                  {field.type === "datetime-local" && formState[field.name]
                    ? new Date(formState[field.name]).toLocaleString("id-ID")
                    : formState[field.name] || "-"}
                </div>
              ) : (
                /* DESAIN JIKA MODE CREATE / EDIT (TETAP PAKE FORM) */
                <>
                  {field.type === "select" ? (
                    <select
                      value={formState[field.name] || ""}
                      onChange={(e) =>
                        handleInputChange(field.name, e.target.value)
                      }
                      className={`w-full rounded-md px-3 py-2.5 border text-sm ${
                        errors?.[field.name]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    >
                      <option value="">Pilih {field.label}</option>
                      {field.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : field.type === "textarea" ? (
                    <textarea
                      value={formState[field.name] || ""}
                      onChange={(e) =>
                        handleInputChange(field.name, e.target.value)
                      }
                      rows={4}
                      className={`w-full rounded-md px-3 py-2.5 border text-sm ${
                        errors?.[field.name]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                  ) : (
                    <input
                      type={field.type || "text"}
                      placeholder={field.placeholder}
                      value={formState[field.name] || ""}
                      onChange={(e) =>
                        handleInputChange(field.name, e.target.value)
                      }
                      className={`w-full rounded-md px-3 py-2.5 border text-sm ${
                        errors?.[field.name]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                  )}
                  {errors?.[field.name] && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors[field.name]}
                    </p>
                  )}
                </>
              )}
            </div>
          ))}

          {/* Sisa logic tanggal bawaan jika showDates aktif */}
          {!isDetail && showDates && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Mulai
                </label>
                <input
                  type="datetime-local"
                  value={formState.start_date || ""}
                  onChange={(e) =>
                    handleInputChange("start_date", e.target.value)
                  }
                  className={`w-full rounded-md px-3 py-2.5 border text-sm ${
                    errors?.start_date ? "border-red-500" : "border-gray-300"
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Selesai
                </label>
                <input
                  type="datetime-local"
                  value={formState.end_date || ""}
                  onChange={(e) =>
                    handleInputChange("end_date", e.target.value)
                  }
                  className={`w-full rounded-md px-3 py-2.5 border text-sm ${
                    errors?.end_date ? "border-red-500" : "border-gray-300"
                  }`}
                />
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6 border-t pt-4">
          <Button
            variant="outline"
            size="lg"
            onClick={onClose}
            disabled={isLoading}
          >
            {isDetail ? "Tutup" : "Batal"}
          </Button>
          {!isDetail && (
            <Button size="lg" onClick={onConfirm} disabled={isLoading}>
              {isLoading ? "Menyimpan..." : confirmLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
