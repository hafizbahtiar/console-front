import { del, getPaginatedData, getData, postData, patchData } from '@/lib/api-client'
import { PaginationMeta } from '@/lib/types/api-response'

export interface Certification {
    id: string
    name: string
    issuer: string
    issueDate: string
    expiryDate?: string
    credentialId?: string
    credentialUrl?: string
    createdAt: string
    updatedAt: string
}

export interface CreateCertificationDto {
    name: string
    issuer: string
    issueDate: string
    expiryDate?: string
    credentialId?: string
    credentialUrl?: string
}

export interface UpdateCertificationDto extends Partial<CreateCertificationDto> { }

export interface CertificationListResponse {
    data: Certification[]
    pagination: PaginationMeta
}

export async function getCertifications(params?: {
    page?: number
    limit?: number
}): Promise<CertificationListResponse> {
    const query = new URLSearchParams()
    if (params?.page) query.set('page', String(params.page))
    if (params?.limit) query.set('limit', String(params.limit))
    const qs = query.toString()
    const url = `/portfolio/certifications${qs ? `?${qs}` : ''}`
    return getPaginatedData<Certification>(url)
}

export async function getCertification(id: string): Promise<Certification> {
    return getData<Certification>(`/portfolio/certifications/${id}`)
}

export async function createCertification(data: CreateCertificationDto): Promise<Certification> {
    return postData<Certification>('/portfolio/certifications', data)
}

export async function updateCertification(id: string, data: UpdateCertificationDto): Promise<Certification> {
    return patchData<Certification>(`/portfolio/certifications/${id}`, data)
}

export async function deleteCertification(id: string): Promise<void> {
    return del<void>(`/portfolio/certifications/${id}`)
}

