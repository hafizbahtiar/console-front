"use client"

import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
    type CreateFinancialGoalInput,
    type UpdateFinancialGoalInput,
    type GoalCategory,
} from "@/lib/api/finance/finance-financial-goals"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Plus, Trash2 } from "lucide-react"

const GOAL_CATEGORIES: { value: GoalCategory; label: string }[] = [
    { value: "emergency_fund", label: "Emergency Fund" },
    { value: "vacation", label: "Vacation" },
    { value: "house", label: "House" },
    { value: "car", label: "Car" },
    { value: "education", label: "Education" },
    { value: "retirement", label: "Retirement" },
    { value: "debt_payoff", label: "Debt Payoff" },
    { value: "investment", label: "Investment" },
    { value: "other", label: "Other" },
]

const financialGoalSchema = z.object({
    name: z.string().min(1, "Name is required").max(100, "Name must not exceed 100 characters"),
    targetAmount: z.number().min(0.01, "Target amount must be greater than 0"),
    currentAmount: z.number().min(0, "Current amount must be 0 or greater").optional(),
    category: z.enum([
        "emergency_fund",
        "vacation",
        "house",
        "car",
        "education",
        "retirement",
        "debt_payoff",
        "investment",
        "other",
    ]),
    targetDate: z.string().min(1, "Target date is required"),
    description: z.string().max(500, "Description must not exceed 500 characters").optional(),
    milestones: z.array(
        z.object({
            amount: z.number().min(0.01, "Milestone amount must be greater than 0"),
            label: z.string().min(1, "Milestone label is required").max(50, "Label must not exceed 50 characters"),
        })
    ).optional(),
}).refine(
    (data) => {
        if (data.currentAmount !== undefined && data.targetAmount) {
            return data.currentAmount <= data.targetAmount
        }
        return true
    },
    {
        message: "Current amount cannot exceed target amount",
        path: ["currentAmount"],
    }
).refine(
    (data) => {
        if (data.targetDate) {
            const targetDate = new Date(data.targetDate)
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            return targetDate >= today
        }
        return true
    },
    {
        message: "Target date must be today or in the future",
        path: ["targetDate"],
    }
)

export type FinancialGoalFormValues = z.infer<typeof financialGoalSchema>

interface FinancialGoalFormProps {
    initialValues?: {
        name?: string
        targetAmount?: number
        currentAmount?: number
        category?: GoalCategory
        targetDate?: string
        description?: string
        milestones?: Array<{ amount: number; label: string }>
    }
    onSubmit: (values: CreateFinancialGoalInput | UpdateFinancialGoalInput) => void
    onCancel: () => void
    isSubmitting?: boolean
}

export function FinancialGoalForm({
    initialValues,
    onSubmit,
    onCancel,
    isSubmitting = false,
}: FinancialGoalFormProps) {
    const form = useForm<FinancialGoalFormValues>({
        resolver: zodResolver(financialGoalSchema),
        defaultValues: {
            name: initialValues?.name || "",
            targetAmount: initialValues?.targetAmount || 0,
            currentAmount: initialValues?.currentAmount || 0,
            category: initialValues?.category || "other",
            targetDate: initialValues?.targetDate || "",
            description: initialValues?.description || "",
            milestones: initialValues?.milestones || [],
        },
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "milestones",
    })

    const handleSubmit = (values: FinancialGoalFormValues) => {
        onSubmit(values)
    }

    const addMilestone = () => {
        append({ amount: 0, label: "" })
    }

    const removeMilestone = (index: number) => {
        remove(index)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Goal Name</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., Emergency Fund" {...field} />
                            </FormControl>
                            <FormDescription>
                                Give your financial goal a descriptive name
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="targetAmount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Target Amount</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        placeholder="0.00"
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    />
                                </FormControl>
                                <FormDescription>
                                    The total amount you want to save
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="currentAmount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Current Amount</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="0.00"
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    />
                                </FormControl>
                                <FormDescription>
                                    How much you've saved so far
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {GOAL_CATEGORIES.map((cat) => (
                                            <SelectItem key={cat.value} value={cat.value}>
                                                {cat.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormDescription>
                                    Categorize your financial goal
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="targetDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Target Date</FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormDescription>
                                    When you want to achieve this goal
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Add any notes about this goal..."
                                    className="resize-none"
                                    rows={3}
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                Optional description for your goal
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Milestones */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <FormLabel>Milestones</FormLabel>
                            <FormDescription>
                                Set intermediate milestones to track progress
                            </FormDescription>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addMilestone}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Milestone
                        </Button>
                    </div>

                    {fields.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            No milestones added. Click "Add Milestone" to create one.
                        </p>
                    )}

                    <div className="space-y-3">
                        {fields.map((field, index) => (
                            <div key={field.id} className="flex gap-2 items-start p-3 border rounded-lg">
                                <div className="flex-1 grid grid-cols-2 gap-2">
                                    <FormField
                                        control={form.control}
                                        name={`milestones.${index}.amount`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs">Amount</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        min="0.01"
                                                        placeholder="0.00"
                                                        {...field}
                                                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`milestones.${index}.label`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs">Label</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="e.g., 25% Complete"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeMilestone(index)}
                                    className="mt-6"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : initialValues ? "Update Goal" : "Create Goal"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}

