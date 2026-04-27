"use client";

import React from "react";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { BreadcrumbItem } from "@/lib/store";

// ─── Types ───────────────────────────────────────────────────────────────────

interface PageHeaderProps {
  /** Page title */
  title: string;
  /** Optional description / subtitle */
  description?: string;
  /** Label for the action button; omit to hide it */
  actionLabel?: string;
  /** Called when the action button is clicked */
  onAction?: () => void;
  /** Replace the action button entirely with custom content */
  actions?: React.ReactNode;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function PageHeader({
  title,
  description,
  actionLabel,
  onAction,
  actions,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>

      <div className="flex items-center gap-2 mt-2 sm:mt-0">
        {actions ||
          (actionLabel && onAction && (
            <Button size="sm" onClick={onAction}>
              <Plus className="size-4" />
              {actionLabel}
            </Button>
          ))}
      </div>
    </div>
  );
}

export default PageHeader;
