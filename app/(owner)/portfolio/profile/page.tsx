"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import {
  getPortfolioProfile,
  updatePortfolioProfile,
  uploadAvatar,
  uploadResume,
  type PortfolioProfile,
} from "@/lib/api/portfolio"
import { ApiClientError } from "@/lib/api-client"
import { PortfolioProfileForm } from "@/components/features/portfolio/profile/portfolio-profile-form"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function PortfolioProfilePage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  const [profile, setProfile] = useState<PortfolioProfile | null>(null)
  const [isFetching, setIsFetching] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (isAuthenticated) {
      void fetchProfile()
    }
  }, [isAuthenticated])

  const fetchProfile = async () => {
    setIsFetching(true)
    try {
      const data = await getPortfolioProfile()
      setProfile(data)
    } catch (error: any) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : "Failed to load profile. Please try again."
      toast.error(message)
    } finally {
      setIsFetching(false)
    }
  }

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true)
    try {
      const updated = await updatePortfolioProfile(values)
      setProfile(updated)
      toast.success("Profile updated successfully")
    } catch (error: any) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : "Failed to update profile. Please try again."
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAvatarUpload = async (avatar: string) => {
    try {
      const updated = await uploadAvatar(avatar)
      setProfile(updated)
      toast.success("Avatar updated successfully")
    } catch (error: any) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : "Failed to upload avatar. Please try again."
      toast.error(message)
      throw error
    }
  }

  const handleResumeUpload = async (resumeUrl: string) => {
    try {
      const updated = await uploadResume(resumeUrl)
      setProfile(updated)
      toast.success("Resume updated successfully")
    } catch (error: any) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : "Failed to upload resume. Please try again."
      toast.error(message)
      throw error
    }
  }

  if (!isAuthenticated && !isLoading) {
    return null
  }

  if (isFetching) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Portfolio Profile</h2>
        <p className="text-sm text-muted-foreground">
          Manage your portfolio profile settings, avatar, and resume.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your portfolio profile details, including bio, location, and availability.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PortfolioProfileForm
            initialValues={profile || undefined}
            onSubmit={handleSubmit}
            onAvatarUpload={handleAvatarUpload}
            onResumeUpload={handleResumeUpload}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>
    </div>
  )
}

