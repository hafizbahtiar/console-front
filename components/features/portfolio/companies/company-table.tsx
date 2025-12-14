"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import type { Company } from "@/lib/api/portfolio"
import { DataTable } from "@/components/ui/data-table"
import { PaginationMeta } from "@/lib/types/api-response"
import { Button } from "@/components/ui/button"
import { Building2, Globe2, Trash2 } from "lucide-react"

interface CompanyTableProps {
  companies: Company[]
  page: number
  pageSize: number
  total: number
  pagination?: PaginationMeta
  onPageChange: (page: number) => void
  search: string
  onSearchChange: (value: string) => void
  isLoading?: boolean
  onEdit?: (company: Company) => void
  onDelete?: (company: Company) => void
  enableRowSelection?: boolean
  onSelectionChange?: (selectedCompanies: Company[]) => void
  onBulkDelete?: (selectedCompanies: Company[]) => void
}

export function CompanyTable({
  companies,
  page,
  pageSize,
  total,
  pagination,
  onPageChange,
  search,
  onSearchChange,
  isLoading,
  onEdit,
  onDelete,
  enableRowSelection = false,
  onSelectionChange,
  onBulkDelete,
}: CompanyTableProps) {
  const columns = React.useMemo<ColumnDef<Company, any>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => {
          const company = row.original
          return (
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <span>{company.name}</span>
              </div>
              {company.description && (
                <div className="text-[11px] text-muted-foreground line-clamp-2 max-w-md">
                  {company.description}
                </div>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: "industry",
        header: "Industry",
        cell: ({ row }) => {
          const industry = row.original.industry
          return (
            <span className="text-xs text-muted-foreground">
              {industry || "—"}
            </span>
          )
        },
      },
      {
        accessorKey: "location",
        header: "Location",
        cell: ({ row }) => {
          const location = row.original.location
          return (
            <span className="text-xs text-muted-foreground">
              {location || "—"}
            </span>
          )
        },
      },
      {
        accessorKey: "website",
        header: "Website",
        cell: ({ row }) => {
          const website = row.original.website
          if (!website) return <span className="text-xs text-muted-foreground">—</span>
          const label = website.replace(/^https?:\/\//, "")
          return (
            <a
              href={website}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
            >
              <Globe2 className="w-3 h-3" />
              {label}
            </a>
          )
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const company = row.original
          return (
            <div className="flex items-center justify-end gap-1.5">
              {onEdit && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(company)}
                >
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-destructive border-destructive/40 hover:bg-destructive/10"
                  onClick={() => onDelete(company)}
                >
                  Delete
                </Button>
              )}
            </div>
          )
        },
      },
    ],
    [onEdit, onDelete],
  )

  return (
    <DataTable
      columns={columns}
      data={companies}
      page={page}
      pageSize={pageSize}
      total={total}
      pagination={pagination}
      onPageChange={onPageChange}
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search companies..."
      isLoading={isLoading}
      emptyTitle="No companies yet"
      emptyDescription="Start by adding companies you have worked with or collaborated with."
      enableRowSelection={enableRowSelection}
      getRowId={(row) => row.id}
      onSelectionChange={onSelectionChange}
      renderBulkActions={
        onBulkDelete
          ? (selected) => (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onBulkDelete(selected)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Selected ({selected.length})
            </Button>
          )
          : undefined
      }
    />
  )
}

