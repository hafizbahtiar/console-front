"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import type { Blog } from "@/lib/api/portfolio"
import { DataTable } from "@/components/ui/data-table"
import { PaginationMeta } from "@/lib/types/api-response"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { FileText, CalendarDays, Eye, EyeOff } from "lucide-react"

interface BlogTableProps {
  blogs: Blog[]
  page: number
  pageSize: number
  total: number
  pagination?: PaginationMeta
  onPageChange: (page: number) => void
  search: string
  onSearchChange: (value: string) => void
  isLoading?: boolean
  onEdit?: (blog: Blog) => void
  onDelete?: (blog: Blog) => void
}

export function BlogTable({
  blogs,
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
}: BlogTableProps) {
  const columns = React.useMemo<ColumnDef<Blog, any>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => {
          const blog = row.original
          return (
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2 text-sm font-medium">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span>{blog.title}</span>
              </div>
              {blog.excerpt && (
                <div className="text-[11px] text-muted-foreground line-clamp-2 max-w-md">
                  {blog.excerpt}
                </div>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: "tags",
        header: "Tags",
        cell: ({ row }) => {
          const tags = row.original.tags || []
          if (!tags.length) return <span className="text-xs text-muted-foreground">—</span>
          return (
            <div className="flex flex-wrap gap-1 max-w-xs">
              {tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">
                  {tag}
                </Badge>
              ))}
              {tags.length > 3 && (
                <span className="text-[10px] text-muted-foreground">
                  +{tags.length - 3} more
                </span>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: "published",
        header: "Status",
        cell: ({ row }) => {
          const published = row.original.published
          return (
            <div className="flex items-center gap-1.5">
              {published ? (
                <>
                  <Eye className="w-3.5 h-3.5 text-green-600" />
                  <Badge variant="default" className="text-[10px] px-1.5 py-0">
                    Published
                  </Badge>
                </>
              ) : (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    Draft
                  </Badge>
                </>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: "dates",
        header: "Dates",
        cell: ({ row }) => {
          const { publishedAt, createdAt } = row.original
          return (
            <div className="flex flex-col gap-0.5 text-[11px] text-muted-foreground">
              {publishedAt && (
                <div className="flex items-center gap-1">
                  <CalendarDays className="w-3 h-3" />
                  <span>Published: {format(new Date(publishedAt), "MMM d, yyyy")}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <CalendarDays className="w-3 h-3" />
                <span>Created: {format(new Date(createdAt), "MMM d, yyyy")}</span>
              </div>
            </div>
          )
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const blog = row.original
          return (
            <div className="flex items-center justify-end gap-1.5">
              {onEdit && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(blog)}
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
                  onClick={() => onDelete(blog)}
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
      data={blogs}
      page={page}
      pageSize={pageSize}
      total={total}
      pagination={pagination}
      onPageChange={onPageChange}
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search blog posts..."
      isLoading={isLoading}
      emptyTitle="No blog posts yet"
      emptyDescription="Start by creating your first blog post or article."
    />
  )
}

