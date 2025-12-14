"use client"

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  useReactTable,
  RowSelectionState,
} from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { cn } from "@/lib/utils"
import { PaginationMeta } from "@/lib/types/api-response"

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  /** Current page (1-based) */
  page: number
  /** Items per page */
  pageSize: number
  /** Total items (for result count and page count) - can be derived from pagination if provided */
  total: number
  onPageChange: (page: number) => void
  /** Search value and handler */
  search: string
  onSearchChange: (value: string) => void
  /** Optional placeholder for search input */
  searchPlaceholder?: string
  /** Hide search input (useful when search is handled externally) */
  hideSearch?: boolean
  /** Loading state */
  isLoading?: boolean
  /** Optional pagination metadata from backend (more accurate than calculated values) */
  pagination?: PaginationMeta
  /** Optional empty state texts */
  emptyTitle?: string
  emptyDescription?: string
  className?: string
  /** Enable row selection */
  enableRowSelection?: boolean
  /** Function to get row ID (required if enableRowSelection is true) */
  getRowId?: (row: TData) => string
  /** Callback when selection changes */
  onSelectionChange?: (selectedRows: TData[]) => void
  /** Render bulk actions toolbar */
  renderBulkActions?: (selectedRows: TData[]) => React.ReactNode
  /** Enable virtual scrolling for large datasets */
  enableVirtualScrolling?: boolean
  /** Estimated row height for virtual scrolling (in pixels) */
  estimatedRowHeight?: number
}

export function DataTable<TData, TValue>({
  columns,
  data,
  page,
  pageSize,
  total,
  onPageChange,
  search,
  onSearchChange,
  searchPlaceholder = "Search...",
  isLoading,
  pagination,
  emptyTitle = "No results",
  emptyDescription = "Try adjusting your search or filters.",
  className,
  enableRowSelection = false,
  getRowId,
  onSelectionChange,
  renderBulkActions,
  enableVirtualScrolling = false,
  estimatedRowHeight = 60,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})

  // Add selection column if enabled
  const tableColumns = React.useMemo<ColumnDef<TData, TValue>[]>(() => {
    if (!enableRowSelection) return columns

    const selectionColumn: ColumnDef<TData, TValue> = {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    }

    return [selectionColumn, ...columns]
  }, [columns, enableRowSelection])

  const table = useReactTable({
    data,
    columns: tableColumns,
    getRowId: getRowId,
    state: {
      sorting,
      rowSelection,
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: enableRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  // Get selected rows and notify parent
  React.useEffect(() => {
    if (onSelectionChange) {
      const selectedRows = table.getFilteredSelectedRowModel().rows.map((row) => row.original)
      onSelectionChange(selectedRows)
    }
  }, [rowSelection, data, onSelectionChange, table])

  const selectedRows = table.getFilteredSelectedRowModel().rows
  const hasSelection = selectedRows.length > 0

  // Use pagination metadata from backend if available, otherwise calculate
  const pageCount = pagination?.totalPages ?? Math.max(1, Math.ceil(total / pageSize))
  const currentPage = pagination?.page ?? Math.min(page, pageCount)
  const hasNextPage = pagination?.hasNextPage ?? (currentPage < pageCount)
  const hasPreviousPage = pagination?.hasPreviousPage ?? (currentPage > 1)
  const actualTotal = pagination?.total ?? total

  const handlePrevious = () => {
    if (hasPreviousPage) onPageChange(currentPage - 1)
  }

  const handleNext = () => {
    if (hasNextPage) onPageChange(currentPage + 1)
  }

  const renderPageNumbers = () => {
    const items = []
    for (let i = 1; i <= pageCount; i++) {
      // Limit number of page buttons for large page counts
      if (pageCount > 7) {
        if (i === 1 || i === pageCount || Math.abs(i - currentPage) <= 1) {
          items.push(i)
        }
      } else {
        items.push(i)
      }
    }

    return Array.from(new Set(items)).sort((a, b) => a - b)
  }

  const startIndex = actualTotal === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endIndex = Math.min(actualTotal, currentPage * pageSize)

  const rows = table.getRowModel().rows

  // Virtual scrolling setup
  const parentRef = React.useRef<HTMLDivElement>(null)
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimatedRowHeight,
    overscan: 5, // Render 5 extra items outside the visible area
    enabled: enableVirtualScrolling && !isLoading && rows.length > 0,
  })

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search and Bulk Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative w-full md:max-w-xs">
          <Input
            placeholder={searchPlaceholder}
            className="pl-3 text-sm"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        {hasSelection && renderBulkActions && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selectedRows.length} selected
            </span>
            {renderBulkActions(selectedRows.map((row) => row.original))}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="border rounded-md bg-background overflow-x-auto">
        {enableVirtualScrolling && !isLoading && rows.length > 0 ? (
          <div
            ref={parentRef}
            className="relative overflow-auto"
            style={{
              maxHeight: "600px", // Max height for virtual scrolling container
            }}
          >
            <div className="sticky top-0 z-10 bg-background border-b">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id} className="bg-background">
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
              </Table>
            </div>
            <div
              style={{
                height: `${virtualizer.getTotalSize()}px`,
                position: "relative",
                width: "100%",
              }}
            >
              <Table>
                <TableBody>
                  {virtualizer.getVirtualItems().map((virtualRow) => {
                    const row = rows[virtualRow.index]
                    return (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: `${virtualRow.size}px`,
                          transform: `translateY(${virtualRow.start}px)`,
                        }}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
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
              {isLoading ? (
                Array.from({ length: pageSize }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    {tableColumns.map((_, colIndex) => (
                      <TableCell key={`skeleton-${index}-${colIndex}`}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="p-0">
                    <Empty className="border-0">
                      <EmptyHeader>
                        <EmptyTitle>{emptyTitle}</EmptyTitle>
                        <EmptyDescription>{emptyDescription}</EmptyDescription>
                      </EmptyHeader>
                      <EmptyContent />
                    </Empty>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Footer with result count and pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground px-4">
        <div className="order-2 sm:order-1">
          {actualTotal === 0 ? "No results" : `Showing ${startIndex}–${endIndex} of ${actualTotal} results`}
        </div>
        <div className="order-1 sm:order-2 w-full sm:w-auto flex justify-end">
          <Pagination className="justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious onClick={handlePrevious} href="#" />
              </PaginationItem>
              {renderPageNumbers().map((p) => (
                <PaginationItem key={p}>
                  <PaginationLink
                    href="#"
                    isActive={p === currentPage}
                    onClick={(e) => {
                      e.preventDefault()
                      onPageChange(p)
                    }}
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={handleNext}
                  href="#"
                  className={!hasNextPage ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  )
}

