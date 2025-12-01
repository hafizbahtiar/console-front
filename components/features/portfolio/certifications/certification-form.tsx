"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import type { Certification, CreateCertificationDto, UpdateCertificationDto } from "@/lib/api/portfolio"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

const certificationSchema = z.object({
  name: z.string().min(1, "Name is required").max(200, "Name must be less than 200 characters"),
  issuer: z.string().min(1, "Issuer is required").max(200, "Issuer must be less than 200 characters"),
  issueDate: z.string().min(1, "Issue date is required"),
  expiryDate: z.string().optional().or(z.literal("")),
  credentialId: z.string().max(100, "Credential ID must be less than 100 characters").optional().or(z.literal("")),
  credentialUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
}).refine((data) => {
  if (data.expiryDate && data.issueDate) {
    const issue = new Date(data.issueDate)
    const expiry = new Date(data.expiryDate)
    return issue <= expiry
  }
  return true
}, {
  message: "Expiry date must be after issue date",
  path: ["expiryDate"],
})

export type CertificationFormValues = z.infer<typeof certificationSchema>

interface CertificationFormProps {
  initialValues?: Certification
  onSubmit: (values: CreateCertificationDto | UpdateCertificationDto) => Promise<void>
  onCancel?: () => void
  isSubmitting?: boolean
}

export function CertificationForm({ initialValues, onSubmit, onCancel, isSubmitting }: CertificationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CertificationFormValues>({
    resolver: zodResolver(certificationSchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      issuer: initialValues?.issuer ?? "",
      issueDate: initialValues?.issueDate ? initialValues.issueDate.split("T")[0] : "",
      expiryDate: initialValues?.expiryDate ? initialValues.expiryDate.split("T")[0] : "",
      credentialId: initialValues?.credentialId ?? "",
      credentialUrl: initialValues?.credentialUrl ?? "",
    },
  })

  useEffect(() => {
    if (initialValues) {
      reset({
        name: initialValues.name,
        issuer: initialValues.issuer,
        issueDate: initialValues.issueDate ? initialValues.issueDate.split("T")[0] : "",
        expiryDate: initialValues.expiryDate ? initialValues.expiryDate.split("T")[0] : "",
        credentialId: initialValues.credentialId ?? "",
        credentialUrl: initialValues.credentialUrl ?? "",
      })
    }
  }, [initialValues, reset])

  const internalSubmit = async (values: CertificationFormValues) => {
    const payload: CreateCertificationDto | UpdateCertificationDto = {
      name: values.name,
      issuer: values.issuer,
      issueDate: values.issueDate,
      expiryDate: values.expiryDate || undefined,
      credentialId: values.credentialId || undefined,
      credentialUrl: values.credentialUrl || undefined,
    }

    await onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit(internalSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Certification Name</Label>
        <Input id="name" {...register("name")} placeholder="e.g., AWS Certified Solutions Architect" />
        {errors.name && (
          <p className="text-xs text-destructive mt-1">{String(errors.name.message)}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="issuer">Issuer</Label>
        <Input id="issuer" {...register("issuer")} placeholder="e.g., Amazon Web Services" />
        {errors.issuer && (
          <p className="text-xs text-destructive mt-1">{String(errors.issuer.message)}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="issueDate">Issue Date</Label>
          <Input id="issueDate" type="date" {...register("issueDate")} />
          {errors.issueDate && (
            <p className="text-xs text-destructive mt-1">{String(errors.issueDate.message)}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="expiryDate">Expiry Date (optional)</Label>
          <Input id="expiryDate" type="date" {...register("expiryDate")} />
          {errors.expiryDate && (
            <p className="text-xs text-destructive mt-1">{String(errors.expiryDate.message)}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="credentialId">Credential ID (optional)</Label>
        <Input id="credentialId" {...register("credentialId")} placeholder="e.g., ABC123456" />
        {errors.credentialId && (
          <p className="text-xs text-destructive mt-1">{String(errors.credentialId.message)}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="credentialUrl">Credential URL (optional)</Label>
        <Input id="credentialUrl" {...register("credentialUrl")} placeholder="https://..." />
        {errors.credentialUrl && (
          <p className="text-xs text-destructive mt-1">{String(errors.credentialUrl.message)}</p>
        )}
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
          {isSubmitting ? "Saving..." : initialValues ? "Save changes" : "Create certification"}
        </Button>
      </div>
    </form>
  )
}

