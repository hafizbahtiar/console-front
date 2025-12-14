"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import type { Company, CreateCompanyDto, UpdateCompanyDto } from "@/lib/api/portfolio"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ImageUpload } from "@/components/ui/image-upload"

const companySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  description: z.string().optional(),
  industry: z.string().optional(),
  location: z.string().optional(),
  foundedYear: z
    .string()
    .optional()
    .refine((val) => !val || /^\d{4}$/.test(val), {
      message: "Must be a 4-digit year",
    }),
})

export type CompanyFormValues = z.infer<typeof companySchema>

interface CompanyFormProps {
  initialValues?: Company
  onSubmit: (values: CreateCompanyDto | UpdateCompanyDto) => Promise<void>
  onCancel?: () => void
  isSubmitting?: boolean
}

export function CompanyForm({ initialValues, onSubmit, onCancel, isSubmitting }: CompanyFormProps) {
  const [logoUrl, setLogoUrl] = useState<string | undefined>(initialValues?.logo)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      website: initialValues?.website ?? "",
      description: initialValues?.description ?? "",
      industry: initialValues?.industry ?? "",
      location: initialValues?.location ?? "",
      foundedYear: initialValues?.foundedYear ? String(initialValues.foundedYear) : "",
    },
  })

  useEffect(() => {
    if (initialValues) {
      setLogoUrl(initialValues.logo)
      reset({
        name: initialValues.name,
        website: initialValues.website ?? "",
        description: initialValues.description ?? "",
        industry: initialValues.industry ?? "",
        location: initialValues.location ?? "",
        foundedYear: initialValues.foundedYear ? String(initialValues.foundedYear) : "",
      })
    }
  }, [initialValues, reset])

  const handleLogoUpload = async (url: string | string[]) => {
    setIsUploadingLogo(true)
    try {
      const logoUrlString = Array.isArray(url) ? url[0] : url
      setLogoUrl(logoUrlString)
    } catch (error) {
      console.error("Failed to upload logo:", error)
    } finally {
      setIsUploadingLogo(false)
    }
  }

  const internalSubmit = async (values: CompanyFormValues) => {
    const payload: CreateCompanyDto | UpdateCompanyDto = {
      name: values.name,
      website: values.website || undefined,
      description: values.description || undefined,
      logo: logoUrl || undefined,
      industry: values.industry || undefined,
      location: values.location || undefined,
      foundedYear: values.foundedYear ? Number(values.foundedYear) : undefined,
    }

    await onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit(internalSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register("name")} placeholder="Company name" />
        {errors.name && (
          <p className="text-xs text-destructive mt-1">{String(errors.name.message)}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Company Logo</Label>
        <ImageUpload
          value={logoUrl}
          onUpload={handleLogoUpload}
          label="Company Logo"
          previewSize="md"
          aspectRatio="1/1"
          showUrlInput={true}
          disabled={isSubmitting || isUploadingLogo}
          className="w-full"
        />
        <p className="text-xs text-muted-foreground">
          Upload a company logo (recommended: square image, 1:1 aspect ratio)
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          {...register("website")}
          placeholder="https://company.example.com"
        />
        {errors.website && (
          <p className="text-xs text-destructive mt-1">{String(errors.website.message)}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          rows={3}
          {...register("description")}
          placeholder="Short description of the company"
        />
        {errors.description && (
          <p className="text-xs text-destructive mt-1">{String(errors.description.message)}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="industry">Industry</Label>
          <Input
            id="industry"
            {...register("industry")}
            placeholder="SaaS, Fintech, E-commerce"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            {...register("location")}
            placeholder="City, Country"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="foundedYear">Founded Year</Label>
        <Input
          id="foundedYear"
          {...register("foundedYear")}
          placeholder="2020"
          inputMode="numeric"
        />
        {errors.foundedYear && (
          <p className="text-xs text-destructive mt-1">{String(errors.foundedYear.message)}</p>
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
          {isSubmitting ? "Saving..." : initialValues ? "Save changes" : "Create company"}
        </Button>
      </div>
    </form>
  )
}

