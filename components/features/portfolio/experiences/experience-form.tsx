"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import type { Experience, CreateExperienceDto, UpdateExperienceDto } from "@/lib/api/portfolio"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

const experienceSchema = z
  .object({
    title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
    company: z.string().max(200, "Company must be less than 200 characters").optional(),
    location: z.string().optional(),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().optional(),
    current: z.boolean().optional(),
    description: z.string().optional(),
    achievements: z.string().optional(),
    technologies: z.string().optional(),
  })
  .refine(
    (val) => {
      if (!val.startDate || !val.endDate) return true
      return new Date(val.startDate) <= new Date(val.endDate)
    },
    {
      path: ["endDate"],
      message: "End date must be after start date",
    },
  )
  .refine(
    (val) => {
      if (!val.current) return true
      return !val.endDate
    },
    {
      path: ["endDate"],
      message: "Current experience cannot have an end date",
    },
  )

export type ExperienceFormValues = z.infer<typeof experienceSchema>

interface ExperienceFormProps {
  initialValues?: Experience
  onSubmit: (values: CreateExperienceDto | UpdateExperienceDto) => Promise<void>
  onCancel?: () => void
  isSubmitting?: boolean
}

export function ExperienceForm({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: ExperienceFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      title: initialValues?.title ?? "",
      company: initialValues?.company ?? "",
      location: initialValues?.location ?? "",
      startDate: initialValues?.startDate
        ? initialValues.startDate.slice(0, 10)
        : "",
      endDate: initialValues?.endDate ? initialValues.endDate.slice(0, 10) : "",
      current: initialValues?.current ?? false,
      description: initialValues?.description ?? "",
      achievements: initialValues?.achievements?.join("\n") ?? "",
      technologies: initialValues?.technologies?.join(", ") ?? "",
    },
  })

  const current = watch("current")

  useEffect(() => {
    if (initialValues) {
      reset({
        title: initialValues.title,
        company: initialValues.company ?? "",
        location: initialValues.location ?? "",
        startDate: initialValues.startDate
          ? initialValues.startDate.slice(0, 10)
          : "",
        endDate: initialValues.endDate ? initialValues.endDate.slice(0, 10) : "",
        current: initialValues.current ?? false,
        description: initialValues.description ?? "",
        achievements: initialValues.achievements?.join("\n") ?? "",
        technologies: initialValues.technologies?.join(", ") ?? "",
      })
    }
  }, [initialValues, reset])

  const internalSubmit = async (values: ExperienceFormValues) => {
    const payload: CreateExperienceDto | UpdateExperienceDto = {
      title: values.title,
      company: values.company || undefined,
      location: values.location || undefined,
      startDate: values.startDate,
      endDate: values.current ? undefined : values.endDate || undefined,
      current: values.current ?? false,
      description: values.description || undefined,
      achievements: values.achievements
        ? values.achievements
            .split("\n")
            .map((a) => a.trim())
            .filter(Boolean)
        : undefined,
      technologies: values.technologies
        ? values.technologies
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : undefined,
    }

    await onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit(internalSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          {...register("title")}
          placeholder="Senior Software Engineer"
        />
        {errors.title && (
          <p className="text-xs text-destructive mt-1">
            {String(errors.title.message)}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            {...register("company")}
            placeholder="Company name"
          />
          {errors.company && (
            <p className="text-xs text-destructive mt-1">
              {String(errors.company.message)}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            {...register("location")}
            placeholder="City, Country or Remote"
          />
          {errors.location && (
            <p className="text-xs text-destructive mt-1">
              {String(errors.location.message)}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Input id="startDate" type="date" {...register("startDate")} />
          {errors.startDate && (
            <p className="text-xs text-destructive mt-1">
              {String(errors.startDate.message)}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            type="date"
            {...register("endDate")}
            disabled={current}
          />
          {errors.endDate && (
            <p className="text-xs text-destructive mt-1">
              {String(errors.endDate.message)}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="current"
          checked={!!current}
          onCheckedChange={(checked) => setValue("current", Boolean(checked))}
        />
        <Label htmlFor="current" className="text-sm">
          This is my current position
        </Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          rows={3}
          {...register("description")}
          placeholder="Brief overview of your role and responsibilities"
        />
        {errors.description && (
          <p className="text-xs text-destructive mt-1">
            {String(errors.description.message)}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="achievements">Achievements</Label>
        <Textarea
          id="achievements"
          rows={3}
          {...register("achievements")}
          placeholder={"Use one line per achievement, for example:\n• Led a team of 5 engineers\n• Improved system performance by 30%"}
        />
        {errors.achievements && (
          <p className="text-xs text-destructive mt-1">
            {String(errors.achievements.message)}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="technologies">Technologies</Label>
        <Input
          id="technologies"
          {...register("technologies")}
          placeholder="React, Node.js, PostgreSQL"
        />
        {errors.technologies && (
          <p className="text-xs text-destructive mt-1">
            {String(errors.technologies.message)}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Comma-separated list of technologies used in this role
        </p>
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
          {isSubmitting ? "Saving..." : initialValues ? "Save changes" : "Create experience"}
        </Button>
      </div>
    </form>
  )
}


