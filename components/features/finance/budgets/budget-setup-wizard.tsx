"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
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
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight, Check } from "lucide-react"
import {
    getExpenseCategories,
    getIncomeCategories,
    type ExpenseCategory,
    type IncomeCategory,
} from "@/lib/api/finance"
import {
    type CreateBudgetInput,
    type BudgetPeriod,
    type BudgetCategoryType,
} from "@/lib/api/finance/finance-budgets"
import { toast } from "sonner"
import { ApiClientError } from "@/lib/api-client"
import { useEffect } from "react"

const wizardSchema = z.object({
    name: z.string().min(1, "Name is required").max(100, "Name must not exceed 100 characters"),
    categoryId: z.string().optional(),
    categoryType: z.enum(["ExpenseCategory", "IncomeCategory"]).optional(),
    amount: z.number().min(0.01, "Amount must be greater than 0"),
    period: z.enum(["monthly", "yearly"]),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().optional(),
    alertThresholds: z.object({
        warning: z.number().min(0).max(100).optional(),
        critical: z.number().min(0).max(100).optional(),
        exceeded: z.number().min(0).max(100).optional(),
    }).optional(),
    rolloverEnabled: z.boolean().optional(),
    description: z.string().max(500, "Description must not exceed 500 characters").optional(),
})

type WizardFormValues = z.infer<typeof wizardSchema>

interface BudgetSetupWizardProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (data: CreateBudgetInput) => Promise<void>
    isSubmitting?: boolean
}

const STEPS = [
    { id: 1, title: "Basic Info", description: "Budget name and type" },
    { id: 2, title: "Amount & Period", description: "Set budget amount and period" },
    { id: 3, title: "Category (Optional)", description: "Link to expense or income category" },
    { id: 4, title: "Alerts & Settings", description: "Configure alerts and rollover" },
    { id: 5, title: "Review", description: "Review and confirm" },
]

export function BudgetSetupWizard({
    open,
    onOpenChange,
    onSubmit,
    isSubmitting = false,
}: BudgetSetupWizardProps) {
    const [currentStep, setCurrentStep] = useState(1)
    const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([])
    const [incomeCategories, setIncomeCategories] = useState<IncomeCategory[]>([])
    const [isLoadingCategories, setIsLoadingCategories] = useState(false)

    const form = useForm<WizardFormValues>({
        resolver: zodResolver(wizardSchema),
        defaultValues: {
            name: "",
            categoryId: "",
            categoryType: undefined,
            amount: 0,
            period: "monthly",
            startDate: new Date().toISOString().split("T")[0],
            endDate: "",
            alertThresholds: {
                warning: 50,
                critical: 80,
                exceeded: 100,
            },
            rolloverEnabled: false,
            description: "",
        },
    })

    const categoryType = form.watch("categoryType")
    const categories = categoryType === "ExpenseCategory" ? expenseCategories : incomeCategories

    useEffect(() => {
        if (open) {
            async function loadCategories() {
                setIsLoadingCategories(true)
                try {
                    const [expenses, income] = await Promise.all([
                        getExpenseCategories(),
                        getIncomeCategories(),
                    ])
                    setExpenseCategories(expenses)
                    setIncomeCategories(income)
                } catch (error: any) {
                    // Silently fail - categories are optional
                    console.error("Failed to load categories:", error)
                } finally {
                    setIsLoadingCategories(false)
                }
            }
            loadCategories()
        }
    }, [open])

    const handleNext = async () => {
        const fieldsToValidate: (keyof WizardFormValues)[] = {
            1: ["name"],
            2: ["amount", "period", "startDate"],
            3: [],
            4: [],
            5: [],
        }[currentStep] as (keyof WizardFormValues)[]

        const isValid = await form.trigger(fieldsToValidate as any)
        if (isValid && currentStep < STEPS.length) {
            setCurrentStep(currentStep + 1)
        }
    }

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
        }
    }

    const handleSubmit = async (values: WizardFormValues) => {
        const payload: CreateBudgetInput = {
            name: values.name,
            categoryId: values.categoryId || undefined,
            categoryType: values.categoryType,
            amount: values.amount,
            period: values.period,
            startDate: values.startDate,
            endDate: values.endDate || undefined,
            alertThresholds: values.alertThresholds,
            rolloverEnabled: values.rolloverEnabled,
            description: values.description || undefined,
        }

        await onSubmit(payload)
        form.reset()
        setCurrentStep(1)
    }

    const progress = (currentStep / STEPS.length) * 100

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Budget Setup Wizard</DialogTitle>
                    <DialogDescription>
                        Follow the steps below to create your budget
                    </DialogDescription>
                </DialogHeader>

                {/* Progress Bar */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                            Step {currentStep} of {STEPS.length}
                        </span>
                        <span className="font-medium">{STEPS[currentStep - 1].title}</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                </div>

                {/* Step Indicator */}
                <div className="flex items-center justify-between py-4">
                    {STEPS.map((step, index) => (
                        <div key={step.id} className="flex items-center flex-1">
                            <div className="flex flex-col items-center flex-1">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                        currentStep > step.id
                                            ? "bg-green-500 text-white"
                                            : currentStep === step.id
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted text-muted-foreground"
                                    }`}
                                >
                                    {currentStep > step.id ? (
                                        <Check className="h-4 w-4" />
                                    ) : (
                                        step.id
                                    )}
                                </div>
                                <div className="mt-2 text-xs text-center max-w-[80px]">
                                    {step.title}
                                </div>
                            </div>
                            {index < STEPS.length - 1 && (
                                <div
                                    className={`h-0.5 flex-1 mx-2 ${
                                        currentStep > step.id ? "bg-green-500" : "bg-muted"
                                    }`}
                                />
                            )}
                        </div>
                    ))}
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        {/* Step 1: Basic Info */}
                        {currentStep === 1 && (
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Budget Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., Groceries Budget" {...field} />
                                            </FormControl>
                                            <FormDescription>
                                                Give your budget a descriptive name
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description (Optional)</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Add any additional notes..."
                                                    className="resize-none"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}

                        {/* Step 2: Amount & Period */}
                        {currentStep === 2 && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="amount"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Budget Amount</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        placeholder="0.00"
                                                        {...field}
                                                        onChange={(e) =>
                                                            field.onChange(parseFloat(e.target.value) || 0)
                                                        }
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="period"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Period</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="monthly">Monthly</SelectItem>
                                                        <SelectItem value="yearly">Yearly</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="startDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Start Date</FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="endDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>End Date (Optional)</FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} value={field.value || ""} />
                                                </FormControl>
                                                <FormDescription>
                                                    Leave empty for ongoing budget
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 3: Category */}
                        {currentStep === 3 && (
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="categoryType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Category Type (Optional)</FormLabel>
                                            <Select
                                                onValueChange={(value) => {
                                                    field.onChange(value)
                                                    form.setValue("categoryId", "")
                                                }}
                                                value={field.value || ""}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select category type (optional)" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="">None</SelectItem>
                                                    <SelectItem value="ExpenseCategory">Expense Category</SelectItem>
                                                    <SelectItem value="IncomeCategory">Income Category</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>
                                                Optional: Link this budget to a specific category
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {categoryType && (
                                    <FormField
                                        control={form.control}
                                        name="categoryId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Category</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    value={field.value || ""}
                                                    disabled={isLoadingCategories}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a category" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="">None</SelectItem>
                                                        {categories.map((category) => (
                                                            <SelectItem key={category.id} value={category.id}>
                                                                {category.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </div>
                        )}

                        {/* Step 4: Alerts & Settings */}
                        {currentStep === 4 && (
                            <div className="space-y-4">
                                <div className="space-y-4 border rounded-lg p-4">
                                    <div className="font-medium text-sm">Alert Thresholds (%)</div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="alertThresholds.warning"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Warning</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            placeholder="50"
                                                            {...field}
                                                            onChange={(e) =>
                                                                field.onChange(parseFloat(e.target.value) || 0)
                                                            }
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="alertThresholds.critical"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Critical</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            placeholder="80"
                                                            {...field}
                                                            onChange={(e) =>
                                                                field.onChange(parseFloat(e.target.value) || 0)
                                                            }
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="alertThresholds.exceeded"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Exceeded</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            placeholder="100"
                                                            {...field}
                                                            onChange={(e) =>
                                                                field.onChange(parseFloat(e.target.value) || 0)
                                                            }
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                <FormField
                                    control={form.control}
                                    name="rolloverEnabled"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">Enable Rollover</FormLabel>
                                                <FormDescription>
                                                    Automatically carry over unused budget to the next period
                                                </FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}

                        {/* Step 5: Review */}
                        {currentStep === 5 && (
                            <div className="space-y-4">
                                <div className="border rounded-lg p-4 space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Name:</span>
                                        <span className="font-medium">{form.watch("name")}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Amount:</span>
                                        <span className="font-medium">
                                            ${form.watch("amount").toLocaleString("en-US", {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Period:</span>
                                        <span className="font-medium capitalize">{form.watch("period")}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Start Date:</span>
                                        <span className="font-medium">
                                            {new Date(form.watch("startDate")).toLocaleDateString()}
                                        </span>
                                    </div>
                                    {form.watch("endDate") && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">End Date:</span>
                                            <span className="font-medium">
                                                {new Date(form.watch("endDate") || "").toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}
                                    {form.watch("categoryType") && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Category:</span>
                                            <span className="font-medium">
                                                {form.watch("categoryType") === "ExpenseCategory"
                                                    ? "Expense"
                                                    : "Income"}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Rollover:</span>
                                        <span className="font-medium">
                                            {form.watch("rolloverEnabled") ? "Enabled" : "Disabled"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between pt-4 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handlePrevious}
                                disabled={currentStep === 1 || isSubmitting}
                            >
                                <ChevronLeft className="h-4 w-4 mr-2" />
                                Previous
                            </Button>
                            {currentStep < STEPS.length ? (
                                <Button type="button" onClick={handleNext} disabled={isSubmitting}>
                                    Next
                                    <ChevronRight className="h-4 w-4 ml-2" />
                                </Button>
                            ) : (
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "Creating..." : "Create Budget"}
                                </Button>
                            )}
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

