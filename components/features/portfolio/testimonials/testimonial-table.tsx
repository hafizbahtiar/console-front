"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import type { Testimonial } from "@/lib/api/portfolio"
import { DataTable } from "@/components/ui/data-table"
import { PaginationMeta } from "@/lib/types/api-response"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, MessageSquare, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface TestimonialTableProps {
    testimonials: Testimonial[]
    page: number
    pageSize: number
    total: number
    pagination?: PaginationMeta
    onPageChange: (page: number) => void
    search: string
    onSearchChange: (value: string) => void
    isLoading?: boolean
    onEdit?: (testimonial: Testimonial) => void
    onDelete?: (testimonial: Testimonial) => void
}

export function TestimonialTable({
    testimonials,
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
}: TestimonialTableProps) {
    const columns = React.useMemo<ColumnDef<Testimonial, any>[]>(
        () => [
            {
                accessorKey: "name",
                header: "Author",
                cell: ({ row }) => {
                    const testimonial = row.original
                    return (
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                                <AvatarFallback>
                                    <User className="w-5 h-5" />
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col gap-0.5">
                                <div className="text-sm font-medium">{testimonial.name}</div>
                                {(testimonial.role || testimonial.company) && (
                                    <div className="text-[11px] text-muted-foreground">
                                        {testimonial.role}
                                        {testimonial.role && testimonial.company && " at "}
                                        {testimonial.company}
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                },
            },
            {
                accessorKey: "content",
                header: "Content",
                cell: ({ row }) => {
                    const content = row.original.content
                    return (
                        <div className="text-sm text-muted-foreground line-clamp-3 max-w-md">
                            {content}
                        </div>
                    )
                },
            },
            {
                accessorKey: "rating",
                header: "Rating",
                cell: ({ row }) => {
                    const rating = row.original.rating
                    if (!rating) return <span className="text-xs text-muted-foreground">—</span>
                    return (
                        <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{rating}</span>
                        </div>
                    )
                },
            },
            {
                accessorKey: "featured",
                header: "Status",
                cell: ({ row }) => {
                    const featured = row.original.featured
                    return featured ? (
                        <Badge variant="default" className="text-[10px] px-1.5 py-0">
                            Featured
                        </Badge>
                    ) : (
                        <span className="text-xs text-muted-foreground">—</span>
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
                    const testimonial = row.original
                    return (
                        <div className="flex items-center justify-end gap-1.5">
                            {onEdit && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onEdit(testimonial)}
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
                                    onClick={() => onDelete(testimonial)}
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
            data={testimonials}
            page={page}
            pageSize={pageSize}
            total={total}
            pagination={pagination}
            onPageChange={onPageChange}
            search={search}
            onSearchChange={onSearchChange}
            searchPlaceholder="Search testimonials..."
            isLoading={isLoading}
            emptyTitle="No testimonials yet"
            emptyDescription="Start by adding testimonials from your clients and colleagues."
        />
    )
}

