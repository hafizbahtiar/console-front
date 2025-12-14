"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, RefreshCcw } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import {
  getSkills,
  createSkill,
  updateSkill,
  deleteSkill,
  bulkDeleteSkills,
  type Skill,
} from "@/lib/api/portfolio"
import { ApiClientError } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { SkillForm } from "@/components/features/portfolio/skills/skill-form"
import { SkillTable } from "@/components/features/portfolio/skills/skill-table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function PortfolioSkillsPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  const [skills, setSkills] = useState<Skill[]>([])
  const [isFetching, setIsFetching] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [page, setPage] = useState(1)
  const pageSize = 10
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [skillToDelete, setSkillToDelete] = useState<Skill | null>(null)
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false)
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>([])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (isAuthenticated) {
      void fetchSkills()
    }
  }, [isAuthenticated])

  const fetchSkills = async () => {
    setIsFetching(true)
    try {
      const data = await getSkills(false) // Get flat list
      const items = Array.isArray(data) ? data : []
      setSkills(items.sort((a, b) => a.order - b.order))
    } catch (error: any) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : "Failed to load skills. Please try again."
      toast.error(message)
    } finally {
      setIsFetching(false)
    }
  }

  const categories = useMemo(() => {
    const set = new Set<string>()
    skills.forEach((skill) => {
      if (skill.category) set.add(skill.category)
    })
    return Array.from(set).sort()
  }, [skills])

  const filteredSkills = useMemo(() => {
    let result = skills

    // Search
    if (search.trim()) {
      const term = search.toLowerCase()
      result = result.filter((skill) => {
        return (
          skill.name.toLowerCase().includes(term) ||
          (skill.category && skill.category.toLowerCase().includes(term)) ||
          (skill.icon && skill.icon.toLowerCase().includes(term))
        )
      })
    }

    // Category filter
    if (categoryFilter !== "all") {
      result = result.filter(
        (s) => s.category && s.category.toLowerCase() === categoryFilter.toLowerCase(),
      )
    }

    return result
  }, [skills, search, categoryFilter])

  // Reset page on filter/search change
  useEffect(() => {
    setPage(1)
  }, [search, categoryFilter])

  const total = filteredSkills.length
  const pagedSkills = useMemo(() => {
    const start = (page - 1) * pageSize
    const end = start + pageSize
    return filteredSkills.slice(start, end)
  }, [filteredSkills, page, pageSize])

  const handleCreate = async (values: any) => {
    setIsSubmitting(true)
    try {
      const maxOrder = skills.length > 0 ? Math.max(...skills.map((s) => s.order)) : -1
      const created = await createSkill({ ...values, order: maxOrder + 1 })
      setSkills((prev) => [...prev, created].sort((a, b) => a.order - b.order))
      toast.success("Skill created successfully")
      setIsDialogOpen(false)
      setEditingSkill(null)
    } catch (error: any) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : "Failed to create skill. Please try again."
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdate = async (values: any) => {
    if (!editingSkill) return
    setIsSubmitting(true)
    try {
      const updated = await updateSkill(editingSkill.id, values)
      setSkills((prev) =>
        prev
          .map((s) => (s.id === updated.id ? updated : s))
          .sort((a, b) => a.order - b.order),
      )
      toast.success("Skill updated successfully")
      setIsDialogOpen(false)
      setEditingSkill(null)
    } catch (error: any) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : "Failed to update skill. Please try again."
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteClick = (skill: Skill) => {
    setSkillToDelete(skill)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!skillToDelete) return
    setIsDeleting(true)
    try {
      await deleteSkill(skillToDelete.id)
      setSkills((prev) => prev.filter((s) => s.id !== skillToDelete.id))
      toast.success("Skill deleted successfully")
      setSkillToDelete(null)
    } catch (error: any) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : "Failed to delete skill. Please try again."
      toast.error(message)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleBulkDeleteClick = (skills: Skill[]) => {
    setSelectedSkills(skills)
    setShowBulkDeleteDialog(true)
  }

  const handleBulkDeleteConfirm = async () => {
    if (selectedSkills.length === 0) return
    setIsBulkDeleting(true)
    try {
      const ids = selectedSkills.map((s) => s.id)
      // Try bulk delete first, fallback to individual deletes if endpoint doesn't exist
      try {
        const result = await bulkDeleteSkills(ids)
        if (result.failedIds.length > 0) {
          toast.warning(
            `Deleted ${result.deletedCount} skills. ${result.failedIds.length} failed.`
          )
        } else {
          toast.success(`Successfully deleted ${result.deletedCount} skill(s)`)
        }
        setSkills((prev) => prev.filter((s) => !ids.includes(s.id)))
      } catch (bulkError) {
        // Fallback to individual deletes if bulk endpoint doesn't exist
        const deletePromises = ids.map((id) => deleteSkill(id))
        await Promise.all(deletePromises)
        setSkills((prev) => prev.filter((s) => !ids.includes(s.id)))
        toast.success(`Successfully deleted ${ids.length} skill(s)`)
      }
      setSelectedSkills([])
    } catch (error: any) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : "Failed to delete skills. Please try again."
      toast.error(message)
    } finally {
      setIsBulkDeleting(false)
    }
  }

  const openCreateDialog = () => {
    setEditingSkill(null)
    setIsDialogOpen(true)
  }

  const openEditDialog = (skill: Skill) => {
    setEditingSkill(skill)
    setIsDialogOpen(true)
  }

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setEditingSkill(null)
    }
    setIsDialogOpen(open)
  }

  const onSubmit = async (values: any) => {
    if (editingSkill) {
      await handleUpdate(values)
    } else {
      await handleCreate(values)
    }
  }

  if (!isAuthenticated && !isLoading) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Portfolio Skills</h2>
          <p className="text-sm text-muted-foreground">
            Manage your technical skills and proficiency levels.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => void fetchSkills()}
            disabled={isFetching}
          >
            <RefreshCcw className="w-4 h-4" />
          </Button>
          <Button type="button" onClick={openCreateDialog}>
            <Plus className="w-4 h-4 mr-1" />
            New skill
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Category</Label>
            <Select
              value={categoryFilter}
              onValueChange={(value) => setCategoryFilter(value)}
            >
              <SelectTrigger className="h-8 px-2 text-xs min-w-[160px]">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <SkillTable
        skills={pagedSkills}
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
        search={search}
        onSearchChange={setSearch}
        isLoading={isFetching}
        onEdit={openEditDialog}
        onDelete={handleDeleteClick}
        enableRowSelection={true}
        onSelectionChange={setSelectedSkills}
        onBulkDelete={handleBulkDeleteClick}
      />

      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingSkill ? "Edit skill" : "New skill"}</DialogTitle>
            <DialogDescription>
              {editingSkill
                ? "Update your skill details and proficiency level."
                : "Add a new technical skill to your portfolio."}
            </DialogDescription>
          </DialogHeader>

          <SkillForm
            initialValues={editingSkill || undefined}
            onSubmit={onSubmit}
            onCancel={() => handleDialogClose(false)}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Skill"
        description={`Are you sure you want to delete "${skillToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="destructive"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showBulkDeleteDialog}
        onOpenChange={setShowBulkDeleteDialog}
        title="Delete Multiple Skills"
        description={`Are you sure you want to delete ${selectedSkills.length} selected skill(s)? This action cannot be undone.`}
        confirmText={`Delete ${selectedSkills.length} Skill(s)`}
        confirmVariant="destructive"
        isLoading={isBulkDeleting}
        onConfirm={handleBulkDeleteConfirm}
      />
    </div>
  )
}
