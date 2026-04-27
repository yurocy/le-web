"use client";

import React from "react";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// ─── Types ───────────────────────────────────────────────────────────────────

interface FormDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Called when open state should change */
  onOpenChange: (open: boolean) => void;
  /** Dialog title – automatically switches between "新增" and "编辑" */
  title?: string;
  /** When `editingId` is set, title auto-prefixes with "编辑" */
  editingId?: number | null;
  /** Optional description text below the title */
  description?: string;
  /** Form content rendered inside the dialog body */
  children: React.ReactNode;
  /** Submit handler */
  onSubmit: () => void | Promise<void>;
  /** Whether the submit action is in-progress */
  submitting?: boolean;
  /** Submit button label */
  submitLabel?: string;
  /** Cancel button label */
  cancelLabel?: string;
  /** Dialog content max-width class (e.g. "sm:max-w-xl") */
  className?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function FormDialog({
  open,
  onOpenChange,
  title,
  editingId,
  description,
  children,
  onSubmit,
  submitting = false,
  submitLabel = "确定",
  cancelLabel = "取消",
  className,
}: FormDialogProps) {
  const derivedTitle = title ?? (editingId ? "编辑" : "新增");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={className}>
        <DialogHeader>
          <DialogTitle>{derivedTitle}</DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-2">{children}</div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              {cancelLabel}
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default FormDialog;
