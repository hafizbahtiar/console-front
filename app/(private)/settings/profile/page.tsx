"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { AvatarUpload } from "@/components/ui/avatar-upload"
import { toast } from "sonner"
import { z } from "zod"
import { updateProfile, uploadAvatar } from "@/lib/api/settings"
import { BasicInfoSection } from "@/components/features/settings/profile/basic-info-section"
import { ProfileDetailsSection } from "@/components/features/settings/profile/profile-details-section"
import { ApiClientError } from "@/lib/api-client"

const profileSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  displayName: z.string().optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  location: z.string().optional(),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
})

type ProfileFormData = z.infer<typeof profileSchema>

export default function ProfileSettingsPage() {
  const { user, refreshUser } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      displayName: user?.displayName || "",
      bio: user?.bio || "",
      location: user?.location || "",
      website: user?.website || "",
    },
  })

  // Reset form when user data loads
  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        displayName: user.displayName || "",
        bio: user.bio || "",
        location: user.location || "",
        website: user.website || "",
      })
    }
  }, [user, reset])

  const handleAvatarUpload = async (avatarUrl: string) => {
    setIsUploadingAvatar(true)
    try {
      await uploadAvatar(avatarUrl)
      await refreshUser()
      toast.success("Avatar updated successfully!")
    } catch (error: any) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : "Failed to upload avatar. Please try again."
      toast.error(message)
      throw error
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true)
    try {
      // Prepare data - remove empty strings and convert to undefined
      const updateData: any = {
        firstName: data.firstName,
        lastName: data.lastName,
        displayName: data.displayName || undefined,
        bio: data.bio || undefined,
        location: data.location || undefined,
        website: data.website || undefined,
      }

      await updateProfile(updateData)
      toast.success("Profile updated successfully!")
      await refreshUser()
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to update profile. Please try again."
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Profile Settings</h2>
        <p className="text-muted-foreground mt-1">
          Update your personal information and profile details
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Avatar Upload Section */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Profile Picture</h3>
            <p className="text-sm text-muted-foreground">
              Upload a profile picture to personalize your account
            </p>
          </div>
          <AvatarUpload
            value={user?.avatar}
            onUpload={handleAvatarUpload}
            fallback={user?.firstName?.charAt(0) || user?.username?.charAt(0) || "U"}
            size="md"
            showUrlInput={true}
            disabled={isUploadingAvatar || isSubmitting}
            uploadEndpoint="/users/profile/avatar"
          />
        </div>

        <BasicInfoSection
          register={register}
          errors={errors}
          username={user.username}
          email={user.email}
        />

        <ProfileDetailsSection register={register} errors={errors} />

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => reset()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  )
}
