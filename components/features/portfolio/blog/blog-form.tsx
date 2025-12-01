"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import type { Blog, CreateBlogDto, UpdateBlogDto } from "@/lib/api/portfolio"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

const blogSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  slug: z.string().max(200, "Slug must be less than 200 characters").optional().or(z.literal("")),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().max(500, "Excerpt must be less than 500 characters").optional().or(z.literal("")),
  coverImage: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  published: z.boolean(),
  tags: z.string().optional(),
})

export type BlogFormValues = z.infer<typeof blogSchema>

interface BlogFormProps {
  initialValues?: Blog
  onSubmit: (values: CreateBlogDto | UpdateBlogDto) => Promise<void>
  onCancel?: () => void
  isSubmitting?: boolean
}

export function BlogForm({ initialValues, onSubmit, onCancel, isSubmitting }: BlogFormProps) {
  const [tags, setTags] = useState<string[]>(initialValues?.tags || [])
  const [tagInput, setTagInput] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<BlogFormValues>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: initialValues?.title ?? "",
      slug: initialValues?.slug ?? "",
      content: initialValues?.content ?? "",
      excerpt: initialValues?.excerpt ?? "",
      coverImage: initialValues?.coverImage ?? "",
      published: initialValues?.published ?? false,
      tags: "",
    },
  })

  const published = watch("published")

  useEffect(() => {
    if (initialValues) {
      reset({
        title: initialValues.title,
        slug: initialValues.slug,
        content: initialValues.content,
        excerpt: initialValues.excerpt ?? "",
        coverImage: initialValues.coverImage ?? "",
        published: initialValues.published,
        tags: "",
      })
      setTags(initialValues.tags || [])
    }
  }, [initialValues, reset])

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault()
      const newTag = tagInput.trim()
      if (!tags.includes(newTag)) {
        const updatedTags = [...tags, newTag]
        setTags(updatedTags)
        setTagInput("")
      }
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const internalSubmit = async (values: BlogFormValues) => {
    const payload: CreateBlogDto | UpdateBlogDto = {
      title: values.title,
      slug: values.slug || undefined,
      content: values.content,
      excerpt: values.excerpt || undefined,
      coverImage: values.coverImage || undefined,
      published: values.published,
      tags: tags.length > 0 ? tags : undefined,
    }

    await onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit(internalSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...register("title")} placeholder="Blog post title" />
        {errors.title && (
          <p className="text-xs text-destructive mt-1">{String(errors.title.message)}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug (optional, auto-generated from title if not provided)</Label>
        <Input id="slug" {...register("slug")} placeholder="blog-post-slug" />
        {errors.slug && (
          <p className="text-xs text-destructive mt-1">{String(errors.slug.message)}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="excerpt">Excerpt (optional)</Label>
        <Textarea
          id="excerpt"
          rows={2}
          {...register("excerpt")}
          placeholder="Short description of the blog post"
        />
        {errors.excerpt && (
          <p className="text-xs text-destructive mt-1">{String(errors.excerpt.message)}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          rows={12}
          {...register("content")}
          placeholder="Write your blog post content here (Markdown supported)"
          className="font-mono text-sm"
        />
        {errors.content && (
          <p className="text-xs text-destructive mt-1">{String(errors.content.message)}</p>
        )}
        <p className="text-xs text-muted-foreground">Markdown formatting is supported</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="coverImage">Cover Image URL (optional)</Label>
        <Input id="coverImage" {...register("coverImage")} placeholder="https://..." />
        {errors.coverImage && (
          <p className="text-xs text-destructive mt-1">{String(errors.coverImage.message)}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags</Label>
        <Input
          id="tags"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleAddTag}
          placeholder="Type a tag and press Enter"
        />
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <Switch
            id="published"
            checked={published}
            onCheckedChange={(checked) => setValue("published", checked)}
          />
          <Label htmlFor="published" className="cursor-pointer">
            Published
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
          {isSubmitting ? "Saving..." : initialValues ? "Save changes" : "Create blog post"}
        </Button>
      </div>
    </form>
  )
}

