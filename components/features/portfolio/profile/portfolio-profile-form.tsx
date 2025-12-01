"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import type { PortfolioProfile, UpdatePortfolioProfileDto } from "@/lib/api/portfolio"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Upload, FileText, ExternalLink } from "lucide-react"

const profileSchema = z.object({
  bio: z.string().max(1000, "Bio must be less than 1000 characters").optional().or(z.literal("")),
  avatar: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  resumeUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  location: z.string().max(255, "Location must be less than 255 characters").optional().or(z.literal("")),
  availableForHire: z.boolean(),
  portfolioUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  theme: z.string().max(50, "Theme must be less than 50 characters").optional().or(z.literal("")),
})

export type PortfolioProfileFormValues = z.infer<typeof profileSchema>

interface PortfolioProfileFormProps {
  initialValues?: PortfolioProfile
  onSubmit: (values: UpdatePortfolioProfileDto) => Promise<void>
  onAvatarUpload?: (avatar: string) => Promise<void>
  onResumeUpload?: (resumeUrl: string) => Promise<void>
  isSubmitting?: boolean
}

const THEME_OPTIONS = [
  { value: "default", label: "Default" },
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
  { value: "minimal", label: "Minimal" },
  { value: "modern", label: "Modern" },
]

export function PortfolioProfileForm({
  initialValues,
  onSubmit,
  onAvatarUpload,
  onResumeUpload,
  isSubmitting,
}: PortfolioProfileFormProps) {
  const [avatarUrl, setAvatarUrl] = useState<string>(initialValues?.avatar || "")
  const [resumeUrl, setResumeUrl] = useState<string>(initialValues?.resumeUrl || "")

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<PortfolioProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      bio: initialValues?.bio ?? "",
      avatar: initialValues?.avatar ?? "",
      resumeUrl: initialValues?.resumeUrl ?? "",
      location: initialValues?.location ?? "",
      availableForHire: initialValues?.availableForHire ?? false,
      portfolioUrl: initialValues?.portfolioUrl ?? "",
      theme: initialValues?.theme ?? "default",
    },
  })

  const availableForHire = watch("availableForHire")
  const avatar = watch("avatar")
  const resume = watch("resumeUrl")

  useEffect(() => {
    if (initialValues) {
      reset({
        bio: initialValues.bio ?? "",
        avatar: initialValues.avatar ?? "",
        resumeUrl: initialValues.resumeUrl ?? "",
        location: initialValues.location ?? "",
        availableForHire: initialValues.availableForHire ?? false,
        portfolioUrl: initialValues.portfolioUrl ?? "",
        theme: initialValues.theme ?? "default",
      })
      setAvatarUrl(initialValues.avatar || "")
      setResumeUrl(initialValues.resumeUrl || "")
    }
  }, [initialValues, reset])

  useEffect(() => {
    setAvatarUrl(avatar || "")
  }, [avatar])

  useEffect(() => {
    setResumeUrl(resume || "")
  }, [resume])

  const handleAvatarUrlChange = (url: string) => {
    setValue("avatar", url)
    setAvatarUrl(url)
  }

  const handleResumeUrlChange = (url: string) => {
    setValue("resumeUrl", url)
    setResumeUrl(url)
  }

  const internalSubmit = async (values: PortfolioProfileFormValues) => {
    const payload: UpdatePortfolioProfileDto = {
      bio: values.bio || undefined,
      avatar: values.avatar || undefined,
      resumeUrl: values.resumeUrl || undefined,
      location: values.location || undefined,
      availableForHire: values.availableForHire,
      portfolioUrl: values.portfolioUrl || undefined,
      theme: values.theme || undefined,
    }

    await onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit(internalSubmit)} className="space-y-6">
      {/* Avatar Section */}
      <div className="space-y-4">
        <Label>Avatar</Label>
        <div className="flex items-start gap-4">
          <Avatar className="w-20 h-20">
            <AvatarImage src={avatarUrl} alt="Avatar" />
            <AvatarFallback className="text-lg">
              {initialValues?.userId?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Input
              {...register("avatar")}
              placeholder="Avatar URL (e.g., https://example.com/avatar.jpg)"
              onChange={(e) => {
                register("avatar").onChange(e)
                handleAvatarUrlChange(e.target.value)
              }}
            />
            {errors.avatar && (
              <p className="text-xs text-destructive">{String(errors.avatar.message)}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Enter a URL to your avatar image. File upload coming soon.
            </p>
          </div>
        </div>
      </div>

      {/* Bio Section */}
      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          {...register("bio")}
          placeholder="Tell us about yourself..."
          rows={4}
          maxLength={1000}
        />
        <div className="flex justify-between items-center">
          {errors.bio && (
            <p className="text-xs text-destructive">{String(errors.bio.message)}</p>
          )}
          <p className="text-xs text-muted-foreground ml-auto">
            {watch("bio")?.length || 0}/1000 characters
          </p>
        </div>
      </div>

      {/* Location Section */}
      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          {...register("location")}
          placeholder="City, Country"
          maxLength={255}
        />
        {errors.location && (
          <p className="text-xs text-destructive">{String(errors.location.message)}</p>
        )}
      </div>

      {/* Portfolio URL Section */}
      <div className="space-y-2">
        <Label htmlFor="portfolioUrl">Portfolio URL</Label>
        <Input
          id="portfolioUrl"
          {...register("portfolioUrl")}
          placeholder="https://yourportfolio.com"
        />
        {errors.portfolioUrl && (
          <p className="text-xs text-destructive">{String(errors.portfolioUrl.message)}</p>
        )}
      </div>

      {/* Resume Section */}
      <div className="space-y-2">
        <Label htmlFor="resumeUrl">Resume URL</Label>
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <Input
            id="resumeUrl"
            {...register("resumeUrl")}
            placeholder="https://example.com/resume.pdf"
            onChange={(e) => {
              register("resumeUrl").onChange(e)
              handleResumeUrlChange(e.target.value)
            }}
          />
        </div>
        {resumeUrl && (
          <a
            href={resumeUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <ExternalLink className="w-3 h-3" />
            View resume
          </a>
        )}
        {errors.resumeUrl && (
          <p className="text-xs text-destructive">{String(errors.resumeUrl.message)}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Enter a URL to your resume. File upload coming soon.
        </p>
      </div>

      {/* Theme Section */}
      <div className="space-y-2">
        <Label htmlFor="theme">Theme</Label>
        <Select
          value={watch("theme") || "default"}
          onValueChange={(value) => setValue("theme", value)}
        >
          <SelectTrigger id="theme">
            <SelectValue placeholder="Select theme" />
          </SelectTrigger>
          <SelectContent>
            {THEME_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Available for Hire Section */}
      <div className="flex items-center justify-between pt-2">
        <div className="space-y-0.5">
          <Label htmlFor="availableForHire" className="cursor-pointer">
            Available for Hire
          </Label>
          <p className="text-xs text-muted-foreground">
            Indicate if you're currently open to job opportunities
          </p>
        </div>
        <Switch
          id="availableForHire"
          checked={availableForHire}
          onCheckedChange={(checked) => setValue("availableForHire", checked)}
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save profile"}
        </Button>
      </div>
    </form>
  )
}

