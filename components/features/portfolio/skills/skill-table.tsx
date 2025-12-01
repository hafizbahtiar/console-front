"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import type { Skill } from "@/lib/api/portfolio"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface SkillTableProps {
  skills: Skill[]
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  search: string
  onSearchChange: (value: string) => void
  isLoading?: boolean
  onEdit?: (skill: Skill) => void
  onDelete?: (skill: Skill) => void
}

export function SkillTable({
  skills,
  page,
  pageSize,
  total,
  onPageChange,
  search,
  onSearchChange,
  isLoading,
  onEdit,
  onDelete,
}: SkillTableProps) {
  const columns = React.useMemo<ColumnDef<Skill, any>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => {
          const skill = row.original
          return (
            <div className="flex items-center gap-2">
              {skill.icon && (
                <span className="text-lg flex-shrink-0" aria-hidden="true">
                  {skill.icon}
                </span>
              )}
              <span className="text-sm font-medium">{skill.name}</span>
            </div>
          )
        },
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => {
          const category = row.original.category
          const color = row.original.color
          return (
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0"
              style={color ? { borderColor: color } : undefined}
            >
              {category || "—"}
            </Badge>
          )
        },
      },
      {
        accessorKey: "level",
        header: "Level",
        cell: ({ row }) => {
          const level = row.original.level ?? 0
          return (
            <div className="flex items-center gap-2 min-w-[120px]">
              <Progress value={level} className="h-1.5 flex-1" />
              <span className="text-xs text-muted-foreground flex-shrink-0 w-10 text-right">
                {level}%
              </span>
            </div>
          )
        },
      },
      {
        accessorKey: "order",
        header: "Order",
        cell: ({ row }) => {
          const order = row.original.order
          return (
            <span className="text-xs text-muted-foreground">{order}</span>
          )
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const skill = row.original
          return (
            <div className="flex items-center justify-end gap-1.5">
              {onEdit && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(skill)}
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
                  onClick={() => onDelete(skill)}
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
      data={skills}
      page={page}
      pageSize={pageSize}
      total={total}
      onPageChange={onPageChange}
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search skills..."
      isLoading={isLoading}
      emptyTitle="No skills yet"
      emptyDescription="Start by adding your technical skills and proficiency levels."
    />
  )
}

