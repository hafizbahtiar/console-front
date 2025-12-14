"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import type { Education } from "@/lib/api/portfolio"
import { DataTable } from "@/components/ui/data-table"
import { PaginationMeta } from "@/lib/types/api-response"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, School, Trash2 } from "lucide-react"
import { format } from "date-fns"

interface EducationTableProps {
  education: Education[]
  page: number
  pageSize: number
  total: number
  pagination?: PaginationMeta
  onPageChange: (page: number) => void
  search: string
  onSearchChange: (value: string) => void
  isLoading?: boolean
  onEdit?: (education: Education) => void
  onDelete?: (education: Education) => void
  enableRowSelection?: boolean
  onSelectionChange?: (selectedEducation: Education[]) => void
  onBulkDelete?: (selectedEducation: Education[]) => void
}

export function EducationTable({
  education,
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
}: EducationTableProps) {
  const columns = React.useMemo<ColumnDef<Education, any>[]>(
    () => [
      {
        accessorKey: "institution",
        header: "Institution",
        cell: ({ row }) => {
          const ed = row.original
          return (
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2 text-sm font-medium">
                <School className="w-4 h-4 text-muted-foreground" />
                <span>{ed.institution}</span>
              </div>
              {(ed.degree || ed.field) && (
                <div className="text-[11px] text-muted-foreground">
                  {[ed.degree, ed.field].filter(Boolean).join(" • ")}
                </div>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: "timeline",
        header: "Timeline",
        cell: ({ row }) => {
          const { startDate, endDate } = row.original
          if (!startDate && !endDate) {
            return <span className="text-xs text-muted-foreground">—</span>
          }
          const startLabel = startDate ? format(new Date(startDate), "MMM yyyy") : "N/A"
          const endLabel = endDate ? format(new Date(endDate), "MMM yyyy") : "Present"
          return (
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <CalendarDays className="w-3 h-3" />
              <span>
                {startLabel} - {endLabel}
              </span>
            </div>
          )
        },
      },
      {
        accessorKey: "gpa",
        header: "GPA",
        cell: ({ row }) => {
          const gpa = row.original.gpa
          return gpa ? (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              {gpa}
            </Badge>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const ed = row.original
          return (
            <div className="flex items-center justify-end gap-1.5">
              {onEdit && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(ed)}
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
                  onClick={() => onDelete(ed)}
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
      data={education}
      page={page}
      pageSize={pageSize}
      total={total}
      pagination={pagination}
      onPageChange={onPageChange}
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search education..."
      isLoading={isLoading}
      emptyTitle="No education yet"
      emptyDescription="Start by adding your education history."
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


