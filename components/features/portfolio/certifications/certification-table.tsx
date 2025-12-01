"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import type { Certification } from "@/lib/api/portfolio"
import { DataTable } from "@/components/ui/data-table"
import { PaginationMeta } from "@/lib/types/api-response"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { CalendarDays, ExternalLink, Award } from "lucide-react"
import { cn } from "@/lib/utils"

interface CertificationTableProps {
  certifications: Certification[]
  page: number
  pageSize: number
  total: number
  pagination?: PaginationMeta
  onPageChange: (page: number) => void
  search: string
  onSearchChange: (value: string) => void
  isLoading?: boolean
  onEdit?: (certification: Certification) => void
  onDelete?: (certification: Certification) => void
}

function getExpiryStatus(expiryDate?: string): { status: "valid" | "expiring" | "expired"; label: string; variant: "default" | "secondary" | "destructive" } {
  if (!expiryDate) {
    return { status: "valid", label: "No expiry", variant: "secondary" }
  }

  const expiry = new Date(expiryDate)
  const now = new Date()
  const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (daysUntilExpiry < 0) {
    return { status: "expired", label: "Expired", variant: "destructive" }
  } else if (daysUntilExpiry <= 30) {
    return { status: "expiring", label: `Expires in ${daysUntilExpiry} days`, variant: "secondary" }
  } else {
    return { status: "valid", label: "Valid", variant: "default" }
  }
}

export function CertificationTable({
  certifications,
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
}: CertificationTableProps) {
  const columns = React.useMemo<ColumnDef<Certification, any>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Certification",
        cell: ({ row }) => {
          const certification = row.original
          return (
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Award className="w-4 h-4 text-muted-foreground" />
                <span>{certification.name}</span>
              </div>
              <div className="text-[11px] text-muted-foreground">
                {certification.issuer}
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: "dates",
        header: "Timeline",
        cell: ({ row }) => {
          const { issueDate, expiryDate } = row.original
          return (
            <div className="flex flex-col gap-0.5 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-1">
                <CalendarDays className="w-3 h-3" />
                <span>Issued: {format(new Date(issueDate), "MMM yyyy")}</span>
              </div>
              {expiryDate && (
                <div className="flex items-center gap-1">
                  <CalendarDays className="w-3 h-3" />
                  <span>Expires: {format(new Date(expiryDate), "MMM yyyy")}</span>
                </div>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const expiryStatus = getExpiryStatus(row.original.expiryDate)
          return (
            <Badge variant={expiryStatus.variant} className="text-[10px] px-1.5 py-0">
              {expiryStatus.label}
            </Badge>
          )
        },
      },
      {
        accessorKey: "credential",
        header: "Credential",
        cell: ({ row }) => {
          const certification = row.original
          if (certification.credentialUrl) {
            return (
              <a
                href={certification.credentialUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
              >
                <ExternalLink className="w-3 h-3" />
                {certification.credentialId || "View"}
              </a>
            )
          }
          if (certification.credentialId) {
            return (
              <span className="text-xs text-muted-foreground">{certification.credentialId}</span>
            )
          }
          return <span className="text-xs text-muted-foreground">—</span>
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const certification = row.original
          return (
            <div className="flex items-center justify-end gap-1.5">
              {onEdit && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(certification)}
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
                  onClick={() => onDelete(certification)}
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
      data={certifications}
      page={page}
      pageSize={pageSize}
      total={total}
      pagination={pagination}
      onPageChange={onPageChange}
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search certifications..."
      isLoading={isLoading}
      emptyTitle="No certifications yet"
      emptyDescription="Start by adding your professional certifications and credentials."
    />
  )
}

