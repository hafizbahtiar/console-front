"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import type { Contact, CreateContactDto, UpdateContactDto } from "@/lib/api/portfolio"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const SOCIAL_PLATFORMS = [
  "GitHub",
  "LinkedIn",
  "Twitter",
  "Facebook",
  "Instagram",
  "YouTube",
  "Medium",
  "DevTo",
  "Behance",
  "Dribbble",
  "Codepen",
  "StackOverflow",
] as const

const PLATFORM_ICONS: Record<string, string> = {
  GitHub: "github",
  LinkedIn: "linkedin",
  Twitter: "twitter",
  Facebook: "facebook",
  Instagram: "instagram",
  YouTube: "youtube",
  Medium: "medium",
  DevTo: "dev",
  Behance: "behance",
  Dribbble: "dribbble",
  Codepen: "codepen",
  StackOverflow: "stackoverflow",
}

const contactSchema = z.object({
  platform: z.string().min(1, "Platform is required").max(100, "Platform must be less than 100 characters"),
  url: z.string().url("Must be a valid URL"),
  icon: z.string().optional().or(z.literal("")),
  active: z.boolean(),
})

export type ContactFormValues = z.infer<typeof contactSchema>

interface ContactFormProps {
  initialValues?: Contact
  onSubmit: (values: CreateContactDto | UpdateContactDto) => Promise<void>
  onCancel?: () => void
  isSubmitting?: boolean
}

export function ContactForm({ initialValues, onSubmit, onCancel, isSubmitting }: ContactFormProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<string>(initialValues?.platform || "")

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      platform: initialValues?.platform ?? "",
      url: initialValues?.url ?? "",
      icon: initialValues?.icon ?? "",
      active: initialValues?.active ?? true,
    },
  })

  const active = watch("active")
  const platform = watch("platform")

  useEffect(() => {
    if (initialValues) {
      reset({
        platform: initialValues.platform,
        url: initialValues.url,
        icon: initialValues.icon ?? "",
        active: initialValues.active,
      })
      setSelectedPlatform(initialValues.platform)
    }
  }, [initialValues, reset])

  useEffect(() => {
    // Auto-fill icon when platform is selected from presets
    if (platform && PLATFORM_ICONS[platform] && !watch("icon")) {
      setValue("icon", PLATFORM_ICONS[platform])
    }
  }, [platform, setValue, watch])

  const handlePlatformChange = (value: string) => {
    setSelectedPlatform(value)
    if (value !== "custom") {
      setValue("platform", value)
      // Auto-fill icon if platform is in presets
      if (PLATFORM_ICONS[value]) {
        setValue("icon", PLATFORM_ICONS[value])
      }
    } else {
      // Clear platform when custom is selected, user will enter it manually
      setValue("platform", "")
    }
  }

  const internalSubmit = async (values: ContactFormValues) => {
    const payload: CreateContactDto | UpdateContactDto = {
      platform: values.platform,
      url: values.url,
      icon: values.icon || undefined,
      active: values.active,
    }

    await onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit(internalSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="platform">Platform</Label>
        <Select
          value={selectedPlatform && SOCIAL_PLATFORMS.includes(selectedPlatform as any) ? selectedPlatform : "custom"}
          onValueChange={handlePlatformChange}
        >
          <SelectTrigger id="platform">
            <SelectValue placeholder="Select platform or enter custom" />
          </SelectTrigger>
          <SelectContent>
            {SOCIAL_PLATFORMS.map((platform) => (
              <SelectItem key={platform} value={platform}>
                {platform}
              </SelectItem>
            ))}
            <SelectItem value="custom">Custom (enter below)</SelectItem>
          </SelectContent>
        </Select>
        {(selectedPlatform === "custom" || (selectedPlatform && !SOCIAL_PLATFORMS.includes(selectedPlatform as any))) && (
          <Input
            id="platform-custom"
            {...register("platform")}
            placeholder="Enter platform name"
            className="mt-2"
          />
        )}
        {errors.platform && (
          <p className="text-xs text-destructive mt-1">{String(errors.platform.message)}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="url">URL</Label>
        <Input id="url" {...register("url")} placeholder="https://..." />
        {errors.url && (
          <p className="text-xs text-destructive mt-1">{String(errors.url.message)}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="icon">Icon (optional)</Label>
        <Input
          id="icon"
          {...register("icon")}
          placeholder="Icon name or emoji (auto-filled for preset platforms)"
        />
        <p className="text-xs text-muted-foreground">
          Icon name (e.g., github, linkedin) or emoji. Auto-filled when selecting preset platforms.
        </p>
      </div>

      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <Switch
            id="active"
            checked={active}
            onCheckedChange={(checked) => setValue("active", checked)}
          />
          <Label htmlFor="active" className="cursor-pointer">
            Active
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
          {isSubmitting ? "Saving..." : initialValues ? "Save changes" : "Create contact"}
        </Button>
      </div>
    </form>
  )
}

