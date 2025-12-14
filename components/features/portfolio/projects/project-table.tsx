"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import type { Project } from "@/lib/api/portfolio"
import { DataTable } from "@/components/ui/data-table"
import { PaginationMeta } from "@/lib/types/api-response"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { CalendarDays, ExternalLink, Github, Star, Trash2 } from "lucide-react"

interface ProjectTableProps {
  projects: Project[]
  page: number
  pageSize: number
  total: number
  pagination?: PaginationMeta
  onPageChange: (page: number) => void
  search: string
  onSearchChange: (value: string) => void
  isLoading?: boolean
  onEdit?: (project: Project) => void
  onDelete?: (project: Project) => void
  enableRowSelection?: boolean
  onSelectionChange?: (selectedProjects: Project[]) => void
  onBulkDelete?: (selectedProjects: Project[]) => void
}

export function ProjectTable({
  projects,
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
}: ProjectTableProps) {
  const columns = React.useMemo<ColumnDef<Project, any>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => {
          const project = row.original
          return (
            <div className="flex flex-col gap-0.5">
              <div className="font-medium text-sm">{project.title}</div>
              {project.description && (
                <div className="text-[11px] text-muted-foreground line-clamp-2 max-w-md">
                  {project.description}
                </div>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: "technologies",
        header: "Technologies",
        cell: ({ row }) => {
          const tech = row.original.technologies || []
          if (!tech.length) return <span className="text-xs text-muted-foreground">—</span>
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
        accessorKey: "dates",
        header: "Timeline",
        cell: ({ row }) => {
          const { startDate, endDate } = row.original
          if (!startDate && !endDate) {
            return <span className="text-xs text-muted-foreground">—</span>
          }
          return (
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <CalendarDays className="w-3 h-3" />
              <span>
                {startDate ? format(new Date(startDate), "MMM yyyy") : "N/A"} -{" "}
                {endDate ? format(new Date(endDate), "MMM yyyy") : "Present"}
              </span>
            </div>
          )
        },
      },
      {
        accessorKey: "featured",
        header: "Featured",
        cell: ({ row }) => {
          const featured = row.original.featured
          return featured ? (
            <Badge className="text-[10px] px-1.5 py-0" variant="default">
              <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
              Featured
            </Badge>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )
        },
      },
      {
        accessorKey: "links",
        header: "Links",
        cell: ({ row }) => {
          const project = row.original
          return (
            <div className="flex items-center gap-2 text-[11px]">
              {project.url && (
                <a
                  href={project.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  Live
                </a>
              )}
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                >
                  <Github className="w-3 h-3" />
                  Code
                </a>
              )}
            </div>
          )
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const project = row.original
          return (
            <div className="flex items-center justify-end gap-1.5">
              {onEdit && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(project)}
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
                  onClick={() => onDelete(project)}
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
      data={projects}
      page={page}
      pageSize={pageSize}
      total={total}
      pagination={pagination}
      onPageChange={onPageChange}
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search projects..."
      isLoading={isLoading}
      emptyTitle="No projects yet"
      emptyDescription="Start by creating your first project to showcase on your portfolio."
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

