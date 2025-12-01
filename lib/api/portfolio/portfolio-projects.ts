import { patch, del, getPaginatedData, getData, postData, patchData } from '@/lib/api-client'
import { PaginationMeta } from '@/lib/types/api-response'

export interface Project {
    id: string
    title: string
    description?: string
    image?: string
    url?: string
    githubUrl?: string
    tags: string[]
    technologies: string[]
    startDate?: string
    endDate?: string
    featured: boolean
    order: number
    createdAt: string
    updatedAt: string
}

export interface CreateProjectDto {
    title: string
    description?: string
    image?: string
    url?: string
    githubUrl?: string
    tags?: string[]
    technologies?: string[]
    startDate?: string
    endDate?: string
    featured?: boolean
}

export interface UpdateProjectDto extends Partial<CreateProjectDto> { }

export interface ProjectListResponse {
    data: Project[]
    pagination: PaginationMeta
}

export async function getProjects(params?: {
    page?: number
    limit?: number
    search?: string
    featured?: boolean
}): Promise<ProjectListResponse> {
    const query = new URLSearchParams()
    if (params?.page) query.set('page', String(params.page))
    if (params?.limit) query.set('limit', String(params.limit))
    if (params?.search) query.set('search', params.search)
    if (typeof params?.featured === 'boolean') query.set('featured', String(params.featured))

    const qs = query.toString()
    const url = `/portfolio/projects${qs ? `?${qs}` : ''}`
    return getPaginatedData<Project>(url)
}

export async function getProject(id: string): Promise<Project> {
    return getData<Project>(`/portfolio/projects/${id}`)
}

export async function createProject(data: CreateProjectDto): Promise<Project> {
    return postData<Project>('/portfolio/projects', data)
}

export async function updateProject(id: string, data: UpdateProjectDto): Promise<Project> {
    return patchData<Project>(`/portfolio/projects/${id}`, data)
}

export async function deleteProject(id: string): Promise<void> {
    return del<void>(`/portfolio/projects/${id}`)
}

export async function reorderProjects(projectIds: string[]): Promise<void> {
    return patch<void>('/portfolio/projects/reorder', { projectIds })
}

