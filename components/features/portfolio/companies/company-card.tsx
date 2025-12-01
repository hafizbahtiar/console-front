"use client"

import type { Company } from "@/lib/api/portfolio"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building2, Globe2 } from "lucide-react"

interface CompanyCardProps {
  company: Company
  onEdit?: (company: Company) => void
  onDelete?: (company: Company) => void
}

export function CompanyCard({ company, onEdit, onDelete }: CompanyCardProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold leading-tight flex items-center gap-2">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            <span>{company.name}</span>
          </CardTitle>
          {company.industry && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 mt-1">
              {company.industry}
            </Badge>
          )}
        </div>
        {company.location && (
          <span className="text-[10px] text-muted-foreground">{company.location}</span>
        )}
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-3">
        {company.description && (
          <p className="text-xs text-muted-foreground line-clamp-3">
            {company.description}
          </p>
        )}

        {company.website && (
          <a
            href={company.website}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline"
          >
            <Globe2 className="w-3 h-3" />
            {company.website.replace(/^https?:\/\//, "")}
          </a>
        )}

        <div className="mt-auto flex items-center justify-end gap-1.5 pt-2">
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
      </CardContent>
    </Card>
  )
}

