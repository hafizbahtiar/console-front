"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import type { CreateProjectDto, Project, UpdateProjectDto } from "@/lib/api/portfolio"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ImageUpload } from "@/components/ui/image-upload"

const projectSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().optional(),
  url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  githubUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  tags: z.string().optional(),
  technologies: z.string().optional(),
  featured: z.boolean().optional(),
})

export type ProjectFormValues = z.infer<typeof projectSchema>

interface ProjectFormProps {
  initialValues?: Project
  onSubmit: (values: CreateProjectDto | UpdateProjectDto) => Promise<void>
  onCancel?: () => void
  isSubmitting?: boolean
}

export function ProjectForm({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: ProjectFormProps) {
  const [imageUrl, setImageUrl] = useState<string | undefined>(initialValues?.image)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: initialValues?.title ?? "",
      description: initialValues?.description ?? "",
      url: initialValues?.url ?? "",
      githubUrl: initialValues?.githubUrl ?? "",
      tags: initialValues?.tags?.join(", ") ?? "",
      technologies: initialValues?.technologies?.join(", ") ?? "",
      featured: initialValues?.featured ?? false,
    },
  })

  useEffect(() => {
    if (initialValues) {
      setImageUrl(initialValues.image)
      reset({
        title: initialValues.title,
        description: initialValues.description ?? "",
        url: initialValues.url ?? "",
        githubUrl: initialValues.githubUrl ?? "",
        tags: initialValues.tags?.join(", ") ?? "",
        technologies: initialValues.technologies?.join(", ") ?? "",
        featured: initialValues.featured ?? false,
      })
    }
  }, [initialValues, reset])

  const handleImageUpload = async (url: string | string[]) => {
    setIsUploadingImage(true)
    try {
      const imageUrlString = Array.isArray(url) ? url[0] : url
      setImageUrl(imageUrlString)
    } catch (error) {
      console.error("Failed to upload image:", error)
    } finally {
      setIsUploadingImage(false)
    }
  }

  const internalSubmit = async (values: ProjectFormValues) => {
    const payload: CreateProjectDto | UpdateProjectDto = {
      title: values.title,
      description: values.description || undefined,
      url: values.url || undefined,
      githubUrl: values.githubUrl || undefined,
      image: imageUrl || undefined,
      tags: values.tags
        ? values.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
        : [],
      technologies: values.technologies
        ? values.technologies
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
        : [],
      featured: values.featured ?? false,
    }

    await onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit(internalSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...register("title")} placeholder="Project title" />
        {errors.title && (
          <p className="text-xs text-destructive mt-1">
            {String(errors.title.message)}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Project Image</Label>
        <ImageUpload
          value={imageUrl}
          onUpload={handleImageUpload}
          label="Project Image"
          previewSize="md"
          aspectRatio="16/9"
          showUrlInput={true}
          disabled={isSubmitting || isUploadingImage}
          className="w-full"
        />
        <p className="text-xs text-muted-foreground">
          Upload a project screenshot or image (recommended: 16:9 aspect ratio)
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          rows={3}
          {...register("description")}
          placeholder="Short description of the project"
        />
        {errors.description && (
          <p className="text-xs text-destructive mt-1">
            {String(errors.description.message)}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="url">Live URL</Label>
          <Input
            id="url"
            {...register("url")}
            placeholder="https://project.example.com"
          />
          {errors.url && (
            <p className="text-xs text-destructive mt-1">
              {String(errors.url.message)}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="githubUrl">GitHub URL</Label>
          <Input
            id="githubUrl"
            {...register("githubUrl")}
            placeholder="https://github.com/username/repo"
          />
          {errors.githubUrl && (
            <p className="text-xs text-destructive mt-1">
              {String(errors.githubUrl.message)}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="technologies">Technologies</Label>
          <Input
            id="technologies"
            {...register("technologies")}
            placeholder="React, TypeScript, Tailwind"
          />
          <p className="text-[10px] text-muted-foreground">
            Comma-separated list (e.g. React, TypeScript, Tailwind)
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="tags">Tags</Label>
          <Input
            id="tags"
            {...register("tags")}
            placeholder="SaaS, Dashboard, Internal Tool"
          />
          <p className="text-[10px] text-muted-foreground">
            Comma-separated list (e.g. SaaS, Dashboard, Internal Tool)
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <Switch
            id="featured"
            checked={!!initialValues?.featured}
            {...register("featured")}
          />
          <Label htmlFor="featured" className="text-sm">
            Mark as featured
          </Label>
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
          {isSubmitting ? "Saving..." : initialValues ? "Save changes" : "Create project"}
        </Button>
      </div>
    </form>
  )
}


