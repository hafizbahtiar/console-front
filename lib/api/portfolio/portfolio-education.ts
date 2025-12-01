import { del, getPaginatedData, getData, postData, patchData } from '@/lib/api-client'
import { PaginationMeta } from '@/lib/types/api-response'

export interface Education {
    id: string
    institution: string
    degree?: string
    field?: string
    startDate: string
    endDate?: string
    gpa?: string
    description?: string
    createdAt: string
    updatedAt: string
}

export interface CreateEducationDto {
    institution: string
    degree?: string
    field?: string
    startDate: string
    endDate?: string
    gpa?: string
    description?: string
}

export interface UpdateEducationDto extends Partial<CreateEducationDto> { }

export interface EducationListResponse {
    data: Education[]
    pagination: PaginationMeta
}

export async function getEducation(params?: {
    page?: number
    limit?: number
}): Promise<EducationListResponse> {
    const query = new URLSearchParams()
    if (params?.page) query.set('page', String(params.page))
    if (params?.limit) query.set('limit', String(params.limit))
    const qs = query.toString()
    const url = `/portfolio/education${qs ? `?${qs}` : ''}`
    return getPaginatedData<Education>(url)
}

export async function getEducationById(id: string): Promise<Education> {
    return getData<Education>(`/portfolio/education/${id}`)
}

export async function createEducation(data: CreateEducationDto): Promise<Education> {
    return postData<Education>('/portfolio/education', data)
}

export async function updateEducation(id: string, data: UpdateEducationDto): Promise<Education> {
    return patchData<Education>(`/portfolio/education/${id}`, data)
}

export async function deleteEducation(id: string): Promise<void> {
    return del<void>(`/portfolio/education/${id}`)
}

