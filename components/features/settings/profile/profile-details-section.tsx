"use client"

import { UseFormRegister, FieldErrors } from "react-hook-form"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface ProfileDetailsSectionProps {
    register: UseFormRegister<any>
    errors: FieldErrors<any>
}

export function ProfileDetailsSection({ register, errors }: ProfileDetailsSectionProps) {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Profile Details</h3>
                <p className="text-sm text-muted-foreground">
                    Additional information about yourself
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                    id="bio"
                    {...register("bio")}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    maxLength={500}
                />
                {errors.bio?.message && (
                    <p className="text-sm text-destructive">
                        {String(errors.bio.message)}
                    </p>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                        id="location"
                        {...register("location")}
                        placeholder="City, Country"
                    />
                    {errors.location?.message && (
                        <p className="text-sm text-destructive">
                            {String(errors.location.message)}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                        id="website"
                        {...register("website")}
                        placeholder="https://example.com"
                        type="url"
                    />
                    {errors.website?.message && (
                        <p className="text-sm text-destructive">
                            {String(errors.website.message)}
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}

