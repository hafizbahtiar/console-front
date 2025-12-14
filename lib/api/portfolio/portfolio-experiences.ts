import { del, getPaginatedData, getData, postData, patchData } from '@/lib/api-client'
import { PaginationMeta } from '@/lib/types/api-response'
import { BulkDeleteResponse } from './types'

export interface Experience {
    id: string
    title: string
    companyId?: string
    company?: string
    location?: string
    startDate: string
    endDate?: string
    current: boolean
    description?: string
    achievements: string[]
    technologies: string[]
    createdAt: string
    updatedAt: string
}

export interface CreateExperienceDto {
    title: string
    companyId?: string
    company?: string
    location?: string
    startDate: string
    endDate?: string
    current?: boolean
    description?: string
    achievements?: string[]
    technologies?: string[]
}

export interface UpdateExperienceDto extends Partial<CreateExperienceDto> { }

export interface ExperienceListResponse {
    data: Experience[]
    pagination: PaginationMeta
}

export async function getExperiences(params?: {
    page?: number
    limit?: number
}): Promise<ExperienceListResponse> {
    const query = new URLSearchParams()
    if (params?.page) query.set('page', String(params.page))
    if (params?.limit) query.set('limit', String(params.limit))
    const qs = query.toString()
    const url = `/portfolio/experiences${qs ? `?${qs}` : ''}`
    return getPaginatedData<Experience>(url)
}

export async function getExperience(id: string): Promise<Experience> {
    return getData<Experience>(`/portfolio/experiences/${id}`)
}

export async function createExperience(data: CreateExperienceDto): Promise<Experience> {
    return postData<Experience>('/portfolio/experiences', data)
}

export async function updateExperience(id: string, data: UpdateExperienceDto): Promise<Experience> {
    return patchData<Experience>(`/portfolio/experiences/${id}`, data)
}

export async function deleteExperience(id: string): Promise<void> {
    return del<void>(`/portfolio/experiences/${id}`)
}

export async function bulkDeleteExperiences(ids: string[]): Promise<BulkDeleteResponse> {
    return postData<BulkDeleteResponse>('/portfolio/experiences/bulk-delete', { ids })
}

