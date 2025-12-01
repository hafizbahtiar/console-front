"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import type { Contact } from "@/lib/api/portfolio"
import { DataTable } from "@/components/ui/data-table"
import { PaginationMeta } from "@/lib/types/api-response"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Link2, CheckCircle2, XCircle } from "lucide-react"

interface ContactTableProps {
  contacts: Contact[]
  page: number
  pageSize: number
  total: number
  pagination?: PaginationMeta
  onPageChange: (page: number) => void
  search: string
  onSearchChange: (value: string) => void
  isLoading?: boolean
  onEdit?: (contact: Contact) => void
  onDelete?: (contact: Contact) => void
}

export function ContactTable({
  contacts,
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
}: ContactTableProps) {
  const columns = React.useMemo<ColumnDef<Contact, any>[]>(
    () => [
      {
        accessorKey: "platform",
        header: "Platform",
        cell: ({ row }) => {
          const contact = row.original
          return (
            <div className="flex items-center gap-2">
              {contact.icon && (
                <span className="text-lg flex-shrink-0" aria-hidden="true">
                  {contact.icon}
                </span>
              )}
              <span className="text-sm font-medium">{contact.platform}</span>
            </div>
          )
        },
      },
      {
        accessorKey: "url",
        header: "URL",
        cell: ({ row }) => {
          const url = row.original.url
          const label = url.replace(/^https?:\/\//, "").replace(/\/$/, "")
          return (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline max-w-md truncate"
            >
              <ExternalLink className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{label}</span>
            </a>
          )
        },
      },
      {
        accessorKey: "active",
        header: "Status",
        cell: ({ row }) => {
          const active = row.original.active
          return active ? (
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <Badge variant="default" className="text-[10px] px-1.5 py-0">
                Active
              </Badge>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <XCircle className="w-4 h-4 text-muted-foreground" />
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                Inactive
              </Badge>
            </div>
          )
        },
      },
      {
        accessorKey: "order",
        header: "Order",
        cell: ({ row }) => {
          const order = row.original.order
          return <span className="text-xs text-muted-foreground">{order}</span>
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const contact = row.original
          return (
            <div className="flex items-center justify-end gap-1.5">
              {onEdit && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(contact)}
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
                  onClick={() => onDelete(contact)}
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
      data={contacts}
      page={page}
      pageSize={pageSize}
      total={total}
      pagination={pagination}
      onPageChange={onPageChange}
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search contacts..."
      isLoading={isLoading}
      emptyTitle="No contacts yet"
      emptyDescription="Start by adding your social media links and contact information."
    />
  )
}

