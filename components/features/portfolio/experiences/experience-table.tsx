"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import type { Experience } from "@/lib/api/portfolio"
import { DataTable } from "@/components/ui/data-table"
import { PaginationMeta } from "@/lib/types/api-response"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, MapPin, Briefcase } from "lucide-react"
import { format } from "date-fns"

interface ExperienceTableProps {
  experiences: Experience[]
  page: number
  pageSize: number
  total: number
  pagination?: PaginationMeta
  onPageChange: (page: number) => void
  search: string
  onSearchChange: (value: string) => void
  isLoading?: boolean
  onEdit?: (experience: Experience) => void
  onDelete?: (experience: Experience) => void
}

export function ExperienceTable({
  experiences,
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
}: ExperienceTableProps) {
  const columns = React.useMemo<ColumnDef<Experience, any>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Role",
        cell: ({ row }) => {
          const exp = row.original
          return (
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Briefcase className="w-4 h-4 text-muted-foreground" />
                <span>{exp.title}</span>
              </div>
              {exp.company && (
                <div className="text-[11px] text-muted-foreground">
                  {exp.company}
                </div>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: "location",
        header: "Location",
        cell: ({ row }) => {
          const location = row.original.location
          return location ? (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span>{location}</span>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )
        },
      },
      {
        accessorKey: "dates",
        header: "Timeline",
        cell: ({ row }) => {
          const { startDate, endDate, current } = row.original
          if (!startDate && !endDate) {
            return <span className="text-xs text-muted-foreground">—</span>
          }
          const startLabel = startDate
            ? format(new Date(startDate), "MMM yyyy")
            : "N/A"
          const endLabel = current
            ? "Present"
            : endDate
              ? format(new Date(endDate), "MMM yyyy")
              : "N/A"

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
        accessorKey: "technologies",
        header: "Technologies",
        cell: ({ row }) => {
          const tech = row.original.technologies || []
          if (!tech.length) {
            return <span className="text-xs text-muted-foreground">—</span>
          }
          return (
            <div className="flex flex-wrap gap-1 max-w-xs">
              {tech.slice(0, 3).map((t) => (
                <Badge key={t} variant="outline" className="text-[10px] px-1.5 py-0">
                  {t}
                </Badge>
              ))}
              {tech.length > 3 && (
                <span className="text-[10px] text-muted-foreground">
                  +{tech.length - 3} more
                </span>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: "current",
        header: "Status",
        cell: ({ row }) => {
          const current = row.original.current
          return current ? (
            <Badge className="text-[10px] px-1.5 py-0" variant="default">
              Current
            </Badge>
          ) : (
            <span className="text-xs text-muted-foreground">Past</span>
          )
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const exp = row.original
          return (
            <div className="flex items-center justify-end gap-1.5">
              {onEdit && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(exp)}
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
                  onClick={() => onDelete(exp)}
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
      data={experiences}
      page={page}
      pageSize={pageSize}
      total={total}
      pagination={pagination}
      onPageChange={onPageChange}
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search experiences..."
      isLoading={isLoading}
      emptyTitle="No experiences yet"
      emptyDescription="Start by adding your professional experiences and roles."
    />
  )
}


