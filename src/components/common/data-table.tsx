"use client";

import React, { useCallback, useMemo, useState } from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Plus,
  Search,
  Trash2,
  MoreHorizontal,
  Pencil,
  Eye,
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
}

interface DataTableProps<TData, TValue> {
  /** TanStack column definitions */
  columns: ColumnDef<TData, TValue>[];
  /** Row data */
  data: TData[];
  /** Total record count (server-side) */
  total?: number;
  /** Current page (1-based, server-side) */
  page?: number;
  /** Page size (server-side) */
  pageSize?: number;

  // ── Server-side pagination callbacks ───────────────────────────────────
  /** Called when page or page size changes */
  onPageChange?: (page: number, pageSize: number) => void;

  // ── Search / Filter ────────────────────────────────────────────────────
  /** Placeholder text for the search input */
  searchPlaceholder?: string;
  /** Called when user types in the search box (debounce in parent) */
  onSearch?: (keyword: string) => void;
  /** Current search keyword (controlled) */
  searchValue?: string;

  // ── Actions ────────────────────────────────────────────────────────────
  /** Label for the "Add" button; omit to hide it */
  addLabel?: string;
  onAdd?: () => void;
  /** Called with the selected row IDs when user clicks batch delete */
  onBatchDelete?: (ids: number[]) => void;

  // ── Row actions ────────────────────────────────────────────────────────
  /** Show edit button per row */
  onEdit?: (row: TData) => void;
  /** Show delete button per row */
  onDelete?: (row: TData) => void;
  /** Show view button per row */
  onView?: (row: TData) => void;

  // ── State ──────────────────────────────────────────────────────────────
  loading?: boolean;
  /** Unique key to extract row ID for selection */
  rowIdKey?: string;

  // ── Slot ───────────────────────────────────────────────────────────────
  /** Toolbar extra content (rendered after the search input) */
  toolbarExtra?: React.ReactNode;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function DataTable<TData, TValue>({
  columns,
  data,
  total,
  page = 1,
  pageSize = 20,
  onPageChange,
  searchPlaceholder = "搜索...",
  onSearch,
  searchValue,
  addLabel,
  onAdd,
  onBatchDelete,
  onEdit,
  onDelete,
  onView,
  loading = false,
  rowIdKey = "id",
  toolbarExtra,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const isServerSide = !!onPageChange;
  const totalPages = Math.ceil((total ?? data.length) / pageSize);

  // ── Augment columns with selection checkbox and row actions ────────────

  const augmentedColumns = useMemo<ColumnDef<TData, TValue>[]>(() => {
    const cols: ColumnDef<TData, TValue>[] = [
      // Selection column
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="全选"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="选择行"
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 40,
      },
      // Index column
      {
        id: "index",
        header: "#",
        cell: ({ row }) => {
          const idx = isServerSide
            ? (page - 1) * pageSize + row.index + 1
            : row.index + 1;
          return <span className="text-muted-foreground">{idx}</span>;
        },
        enableSorting: false,
        enableHiding: false,
        size: 60,
      },
      // User columns
      ...columns,
    ];

    // Row actions column
    if (onEdit || onDelete || onView) {
      cols.push({
        id: "actions",
        header: () => <span className="text-xs">操作</span>,
        cell: ({ row }) => {
          const record = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                  <MoreHorizontal className="size-4" />
                  <span className="sr-only">打开菜单</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>操作</DropdownMenuLabel>
                {onView && (
                  <DropdownMenuItem onClick={() => onView(record)}>
                    <Eye className="mr-2 size-4" />
                    查看
                  </DropdownMenuItem>
                )}
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(record)}>
                    <Pencil className="mr-2 size-4" />
                    编辑
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => onDelete(record)}
                    >
                      <Trash2 className="mr-2 size-4" />
                      删除
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
        enableSorting: false,
        enableHiding: false,
        size: 80,
      });
    }

    return cols;
  }, [columns, onEdit, onDelete, onView, page, pageSize, isServerSide]);

  // ── Table instance ─────────────────────────────────────────────────────

  const table = useReactTable({
    data,
    columns: augmentedColumns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: isServerSide ? undefined : getFilteredRowModel(),
    getPaginationRowModel: isServerSide ? undefined : getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: isServerSide,
    manualSorting: false,
    manualFiltering: isServerSide,
    pageCount: isServerSide ? totalPages : undefined,
    // @ts-expect-error TanStack Table pageIndex workaround
    pageIndex: isServerSide ? page - 1 : undefined,
    pageSize: isServerSide ? pageSize : undefined,
  });

  // ── Pagination handler ─────────────────────────────────────────────────

  const handlePageChange = useCallback(
    (newPage: number) => {
      if (isServerSide && onPageChange) {
        onPageChange(newPage, pageSize);
      } else {
        table.setPageIndex(newPage - 1);
      }
    },
    [isServerSide, onPageChange, pageSize, table],
  );

  const handlePageSizeChange = useCallback(
    (newSize: string) => {
      const size = Number(newSize);
      if (isServerSide && onPageChange) {
        onPageChange(1, size);
      } else {
        table.setPageSize(size);
      }
    },
    [isServerSide, onPageChange, table],
  );

  // ── Selected IDs ───────────────────────────────────────────────────────

  const selectedIds = useMemo(() => {
    const ids: number[] = [];
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    for (const row of selectedRows) {
      const val = (row.original as Record<string, unknown>)[rowIdKey];
      if (typeof val === "number") ids.push(val);
    }
    return ids;
  }, [table, rowIdKey]);

  const handleBatchDelete = useCallback(() => {
    if (onBatchDelete && selectedIds.length > 0) {
      onBatchDelete(selectedIds);
      setRowSelection({});
    }
  }, [onBatchDelete, selectedIds]);

  // ── Current effective page info ────────────────────────────────────────

  const currentPage = isServerSide ? page : table.getState().pagination.pageIndex + 1;
  const currentPageSize = isServerSide ? pageSize : table.getState().pagination.pageSize;
  const totalRecords = isServerSide
    ? total ?? data.length
    : table.getFilteredRowModel().rows.length;
  const currentTotalPages = isServerSide
    ? totalPages
    : table.getPageCount();

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          {/* Search */}
          {onSearch !== undefined && (
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={searchValue ?? ""}
                onChange={(e) => onSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          )}

          {/* Toolbar extra slot */}
          {toolbarExtra}
        </div>

        <div className="flex items-center gap-2">
          {/* Batch delete */}
          {onBatchDelete && selectedIds.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBatchDelete}
            >
              <Trash2 className="size-4" />
              批量删除 ({selectedIds.length})
            </Button>
          )}

          {/* Add button */}
          {addLabel && onAdd && (
            <Button size="sm" onClick={onAdd}>
              <Plus className="size-4" />
              {addLabel}
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {loading ? (
              // Skeleton loading rows
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  {augmentedColumns.map((col, j) => (
                    <TableCell key={`skeleton-${i}-${j}`}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={augmentedColumns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  暂无数据
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: page size selector */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>每页</span>
          <Select
            value={String(currentPageSize)}
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <span>
            共 {totalRecords} 条记录
          </span>
        </div>

        {/* Right: page navigation */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => handlePageChange(1)}
            disabled={currentPage <= 1}
          >
            <ChevronsLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="size-4" />
          </Button>

          {/* Page numbers (show at most 5) */}
          {(() => {
            const pages: number[] = [];
            let start = Math.max(1, currentPage - 2);
            let end = Math.min(currentTotalPages, start + 4);
            if (end - start < 4) start = Math.max(1, end - 4);
            for (let i = start; i <= end; i++) pages.push(i);

            return pages.map((p) => (
              <Button
                key={p}
                variant={p === currentPage ? "default" : "outline"}
                size="icon"
                className="size-8"
                onClick={() => handlePageChange(p)}
              >
                {p}
              </Button>
            ));
          })()}

          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= currentTotalPages}
          >
            <ChevronRight className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => handlePageChange(currentTotalPages)}
            disabled={currentPage >= currentTotalPages}
          >
            <ChevronsRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default DataTable;
