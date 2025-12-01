"use client"

import type { Skill } from "@/lib/api/portfolio"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Edit2, Trash2, GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"

interface SkillBadgeProps {
  skill: Skill
  onEdit?: (skill: Skill) => void
  onDelete?: (skill: Skill) => void
  isDragging?: boolean
  showLevel?: boolean
}

export function SkillBadge({
  skill,
  onEdit,
  onDelete,
  isDragging,
  showLevel = true,
}: SkillBadgeProps) {
  const level = skill.level ?? 0
  const color = skill.color || "hsl(var(--primary))"

  return (
    <div
      className={cn(
        "group relative flex items-center gap-2 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors",
        isDragging && "opacity-50",
      )}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {skill.icon && (
          <span className="text-lg flex-shrink-0" aria-hidden="true">
            {skill.icon}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm truncate">{skill.name}</span>
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 flex-shrink-0"
              style={{ borderColor: color }}
            >
              {skill.category}
            </Badge>
          </div>
          {showLevel && (
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <Progress value={level} className="h-1.5 flex-1" />
                <span className="text-[10px] text-muted-foreground flex-shrink-0">{level}%</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {onEdit && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onEdit(skill)}
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
        )}
        {onDelete && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={() => onDelete(skill)}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
    </div>
  )
}

