"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import type { Testimonial, CreateTestimonialDto, UpdateTestimonialDto } from "@/lib/api/portfolio"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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

const testimonialSchema = z.object({
    name: z.string().min(1, "Name is required").max(200, "Name must be less than 200 characters"),
    role: z.string().max(200, "Role must be less than 200 characters").optional().or(z.literal("")),
    company: z.string().max(200, "Company must be less than 200 characters").optional().or(z.literal("")),
    content: z.string().min(1, "Content is required"),
    avatar: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    rating: z
        .string()
        .optional()
        .refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 1 && Number(val) <= 5), {
            message: "Rating must be between 1 and 5",
        }),
    featured: z.boolean(),
})

export type TestimonialFormValues = z.infer<typeof testimonialSchema>

interface TestimonialFormProps {
    initialValues?: Testimonial
    onSubmit: (values: CreateTestimonialDto | UpdateTestimonialDto) => Promise<void>
    onCancel?: () => void
    isSubmitting?: boolean
}

export function TestimonialForm({ initialValues, onSubmit, onCancel, isSubmitting }: TestimonialFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
        setValue,
    } = useForm<TestimonialFormValues>({
        resolver: zodResolver(testimonialSchema),
        defaultValues: {
            name: initialValues?.name ?? "",
            role: initialValues?.role ?? "",
            company: initialValues?.company ?? "",
            content: initialValues?.content ?? "",
            avatar: initialValues?.avatar ?? "",
            rating: initialValues?.rating ? String(initialValues.rating) : "",
            featured: initialValues?.featured ?? false,
        },
    })

    const featured = watch("featured")
    const rating = watch("rating")

    useEffect(() => {
        if (initialValues) {
            reset({
                name: initialValues.name,
                role: initialValues.role ?? "",
                company: initialValues.company ?? "",
                content: initialValues.content,
                avatar: initialValues.avatar ?? "",
                rating: initialValues.rating ? String(initialValues.rating) : "",
                featured: initialValues.featured,
            })
        }
    }, [initialValues, reset])

    const internalSubmit = async (values: TestimonialFormValues) => {
        const payload: CreateTestimonialDto | UpdateTestimonialDto = {
            name: values.name,
            role: values.role || undefined,
            company: values.company || undefined,
            content: values.content,
            avatar: values.avatar || undefined,
            rating: values.rating ? Number(values.rating) : undefined,
            featured: values.featured,
        }

        await onSubmit(payload)
    }

    return (
        <form onSubmit={handleSubmit(internalSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...register("name")} placeholder="John Doe" />
                {errors.name && (
                    <p className="text-xs text-destructive mt-1">{String(errors.name.message)}</p>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="role">Role (optional)</Label>
                    <Input id="role" {...register("role")} placeholder="Software Engineer" />
                    {errors.role && (
                        <p className="text-xs text-destructive mt-1">{String(errors.role.message)}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="company">Company (optional)</Label>
                    <Input id="company" {...register("company")} placeholder="Company Name" />
                    {errors.company && (
                        <p className="text-xs text-destructive mt-1">{String(errors.company.message)}</p>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="content">Testimonial Content</Label>
                <Textarea
                    id="content"
                    rows={6}
                    {...register("content")}
                    placeholder="What they said about you..."
                />
                {errors.content && (
                    <p className="text-xs text-destructive mt-1">{String(errors.content.message)}</p>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="avatar">Avatar URL (optional)</Label>
                    <Input id="avatar" {...register("avatar")} placeholder="https://..." />
                    {errors.avatar && (
                        <p className="text-xs text-destructive mt-1">{String(errors.avatar.message)}</p>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="rating">Rating (optional)</Label>
                    <Select
                        value={rating}
                        onValueChange={(value) => setValue("rating", value)}
                    >
                        <SelectTrigger id="rating">
                            <SelectValue placeholder="Select rating" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">No rating</SelectItem>
                            <SelectItem value="5">5 - Excellent</SelectItem>
                            <SelectItem value="4">4 - Very Good</SelectItem>
                            <SelectItem value="3">3 - Good</SelectItem>
                            <SelectItem value="2">2 - Fair</SelectItem>
                            <SelectItem value="1">1 - Poor</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.rating && (
                        <p className="text-xs text-destructive mt-1">{String(errors.rating.message)}</p>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                    <Switch
                        id="featured"
                        checked={featured}
                        onCheckedChange={(checked) => setValue("featured", checked)}
                    />
                    <Label htmlFor="featured" className="cursor-pointer">
                        Featured
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
                    {isSubmitting ? "Saving..." : initialValues ? "Save changes" : "Create testimonial"}
                </Button>
            </div>
        </form>
    )
}

