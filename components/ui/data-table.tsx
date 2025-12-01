"use client"

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
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
  /** Loading state */
  isLoading?: boolean
  /** Optional pagination metadata from backend (more accurate than calculated values) */
  pagination?: PaginationMeta
  /** Optional empty state texts */
  emptyTitle?: string
  emptyDescription?: string
  className?: string
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
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

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

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative w-full md:max-w-xs">
          <Input
            placeholder={searchPlaceholder}
            className="pl-3 text-sm"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-md bg-background">
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
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-sm text-muted-foreground"
                >
                  Loading...
                </TableCell>
              </TableRow>
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

