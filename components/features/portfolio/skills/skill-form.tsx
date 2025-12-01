"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import type { Skill, CreateSkillDto, UpdateSkillDto } from "@/lib/api/portfolio"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const SKILL_CATEGORIES = [
  "Frontend",
  "Backend",
  "Database",
  "DevOps",
  "Mobile",
  "Design",
  "Tools",
  "Other",
] as const

const skillSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  category: z.enum(SKILL_CATEGORIES as any, {
    message: "Category is required",
  }),
  level: z
    .string()
    .optional()
    .refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 100), {
      message: "Level must be a number between 0 and 100",
    }),
  icon: z.string().optional(),
  color: z.string().optional(),
})

export type SkillFormValues = z.infer<typeof skillSchema>

interface SkillFormProps {
  initialValues?: Skill
  onSubmit: (values: CreateSkillDto | UpdateSkillDto) => Promise<void>
  onCancel?: () => void
  isSubmitting?: boolean
}

export function SkillForm({ initialValues, onSubmit, onCancel, isSubmitting }: SkillFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<SkillFormValues>({
    resolver: zodResolver(skillSchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      category: (initialValues?.category as any) ?? undefined,
      level: initialValues?.level ? String(initialValues.level) : "",
      icon: initialValues?.icon ?? "",
      color: initialValues?.color ?? "",
    },
  })

  const category = watch("category")

  useEffect(() => {
    if (initialValues) {
      reset({
        name: initialValues.name,
        category: initialValues.category as any,
        level: initialValues.level ? String(initialValues.level) : "",
        icon: initialValues.icon ?? "",
        color: initialValues.color ?? "",
      })
    }
  }, [initialValues, reset])

  const internalSubmit = async (values: SkillFormValues) => {
    const payload: CreateSkillDto | UpdateSkillDto = {
      name: values.name,
      category: values.category,
      level: values.level ? Number(values.level) : undefined,
      icon: values.icon || undefined,
      color: values.color || undefined,
    }

    await onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit(internalSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register("name")} placeholder="e.g., React, Node.js, MongoDB" />
        {errors.name && (
          <p className="text-xs text-destructive mt-1">{String(errors.name.message)}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select
          value={category}
          onValueChange={(value) => setValue("category", value as any)}
        >
          <SelectTrigger id="category">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {SKILL_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-xs text-destructive mt-1">{String(errors.category.message)}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="level">Level (0-100%)</Label>
        <Input
          id="level"
          type="number"
          min="0"
          max="100"
          {...register("level")}
          placeholder="e.g., 85"
        />
        {errors.level && (
          <p className="text-xs text-destructive mt-1">{String(errors.level.message)}</p>
        )}
        <p className="text-xs text-muted-foreground">Your proficiency level as a percentage</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="icon">Icon (optional)</Label>
          <Input
            id="icon"
            {...register("icon")}
            placeholder="e.g., react, nodejs, mongodb"
          />
          <p className="text-xs text-muted-foreground">Icon name or emoji</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="color">Color (optional)</Label>
          <Input
            id="color"
            type="color"
            {...register("color")}
            className="h-10"
          />
          <p className="text-xs text-muted-foreground">Skill badge color</p>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : initialValues ? "Save changes" : "Create skill"}
        </Button>
      </div>
    </form>
  )
}

