"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import type { Education, CreateEducationDto, UpdateEducationDto } from "@/lib/api/portfolio"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

const educationSchema = z
  .object({
    institution: z.string().min(1, "Institution is required"),
    degree: z.string().optional(),
    field: z.string().optional(),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().optional(),
    gpa: z.string().optional(),
    description: z.string().optional(),
  })
  .refine(
    (val) => {
      if (!val.startDate || !val.endDate) return true
      return new Date(val.startDate) <= new Date(val.endDate)
    },
    { path: ["endDate"], message: "End date must be after start date" },
  )

export type EducationFormValues = z.infer<typeof educationSchema>

interface EducationFormProps {
  initialValues?: Education
  onSubmit: (values: CreateEducationDto | UpdateEducationDto) => Promise<void>
  onCancel?: () => void
  isSubmitting?: boolean
}

export function EducationForm({ initialValues, onSubmit, onCancel, isSubmitting }: EducationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EducationFormValues>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      institution: initialValues?.institution ?? "",
      degree: initialValues?.degree ?? "",
      field: initialValues?.field ?? "",
      startDate: initialValues?.startDate ? initialValues.startDate.slice(0, 10) : "",
      endDate: initialValues?.endDate ? initialValues.endDate.slice(0, 10) : "",
      gpa: initialValues?.gpa ?? "",
      description: initialValues?.description ?? "",
    },
  })

  useEffect(() => {
    if (initialValues) {
      reset({
        institution: initialValues.institution,
        degree: initialValues.degree ?? "",
        field: initialValues.field ?? "",
        startDate: initialValues.startDate ? initialValues.startDate.slice(0, 10) : "",
        endDate: initialValues.endDate ? initialValues.endDate.slice(0, 10) : "",
        gpa: initialValues.gpa ?? "",
        description: initialValues.description ?? "",
      })
    }
  }, [initialValues, reset])

  const internalSubmit = async (values: EducationFormValues) => {
    const payload: CreateEducationDto | UpdateEducationDto = {
      institution: values.institution,
      degree: values.degree || undefined,
      field: values.field || undefined,
      startDate: values.startDate,
      endDate: values.endDate || undefined,
      gpa: values.gpa || undefined,
      description: values.description || undefined,
    }
    await onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit(internalSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="institution">Institution</Label>
        <Input id="institution" {...register("institution")} placeholder="University name" />
        {errors.institution && <p className="text-xs text-destructive mt-1">{String(errors.institution.message)}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="degree">Degree</Label>
          <Input id="degree" {...register("degree")} placeholder="Bachelor, Master, etc." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="field">Field</Label>
          <Input id="field" {...register("field")} placeholder="Computer Science, Design, etc." />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Input id="startDate" type="date" {...register("startDate")} />
          {errors.startDate && <p className="text-xs text-destructive mt-1">{String(errors.startDate.message)}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">End Date</Label>
          <Input id="endDate" type="date" {...register("endDate")} />
          {errors.endDate && <p className="text-xs text-destructive mt-1">{String(errors.endDate.message)}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="gpa">GPA</Label>
          <Input id="gpa" {...register("gpa")} placeholder="3.8 / 4.0" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" rows={3} {...register("description")} placeholder="Highlights and relevant coursework" />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : initialValues ? "Save changes" : "Create education"}
        </Button>
      </div>
    </form>
  )
}


