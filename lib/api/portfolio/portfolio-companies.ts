import { del, getPaginatedData, getData, postData, patchData } from '@/lib/api-client'
import { PaginationMeta } from '@/lib/types/api-response'
import { BulkDeleteResponse } from './types'

export interface Company {
    id: string
    name: string
    logo?: string
    website?: string
    description?: string
    industry?: string
    location?: string
    foundedYear?: number
    createdAt: string
    updatedAt: string
}

export interface CreateCompanyDto {
    name: string
    logo?: string
    website?: string
    description?: string
    industry?: string
    location?: string
    foundedYear?: number
}

export interface UpdateCompanyDto extends Partial<CreateCompanyDto> { }

export interface CompanyListResponse {
    data: Company[]
    pagination: PaginationMeta
}

export async function getCompanies(params?: {
    page?: number
    limit?: number
}): Promise<CompanyListResponse> {
    const query = new URLSearchParams()
    if (params?.page) query.set('page', String(params.page))
    if (params?.limit) query.set('limit', String(params.limit))
    const qs = query.toString()
    const url = `/portfolio/companies${qs ? `?${qs}` : ''}`
    return getPaginatedData<Company>(url)
}

export async function getCompany(id: string): Promise<Company> {
    return getData<Company>(`/portfolio/companies/${id}`)
}

export async function createCompany(data: CreateCompanyDto): Promise<Company> {
    return postData<Company>("/portfolio/companies", data)
}

export async function updateCompany(id: string, data: UpdateCompanyDto): Promise<Company> {
    return patchData<Company>(`/portfolio/companies/${id}`, data)
}

export async function deleteCompany(id: string): Promise<void> {
    return del<void>(`/portfolio/companies/${id}`)
}

export async function bulkDeleteCompanies(ids: string[]): Promise<BulkDeleteResponse> {
    return postData<BulkDeleteResponse>('/portfolio/companies/bulk-delete', { ids })
}

