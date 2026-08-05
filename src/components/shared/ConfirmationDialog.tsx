"use client";

import { Loader2, AlertTriangle, Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "default";
  isLoading?: boolean;
  onConfirm: () => void;
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Hapus",
  cancelText = "Batal",
  variant = "danger",
  isLoading = false,
  onConfirm,
}: ConfirmationDialogProps) {
  const variantStyles = {
    danger: {
      header: "bg-red-50 border-b-red-100",
      icon: "bg-red-100 text-red-600",
      iconComponent: Trash2,
      button: "bg-red-600 hover:bg-red-700 text-white",
    },
    warning: {
      header: "bg-amber-50 border-b-amber-100",
      icon: "bg-amber-100 text-amber-600",
      iconComponent: AlertTriangle,
      button: "bg-amber-600 hover:bg-amber-700 text-white",
    },
    default: {
      header: "bg-gray-50 border-b-gray-100",
      icon: "bg-gray-100 text-gray-600",
      iconComponent: AlertCircle,
      button: "",
    },
  };

  const styles = variantStyles[variant];
  const IconComponent = styles.iconComponent;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className={styles.header}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${styles.icon}`}>
              <IconComponent className="w-5 h-5" />
            </div>
            <DialogTitle>{title}</DialogTitle>
          </div>
        </DialogHeader>
        <DialogBody>
          <p className="text-sm text-muted-foreground">{description}</p>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            className={styles.button}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
