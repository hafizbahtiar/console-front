import { patch, del, getPaginatedData, getData, postData, patchData } from '@/lib/api-client'
import { PaginationMeta } from '@/lib/types/api-response'
import type { BulkDeleteResponse } from './types'

export interface Testimonial {
    id: string
    name: string
    role?: string
    company?: string
    content: string
    avatar?: string
    rating?: number
    featured: boolean
    order: number
    createdAt: string
    updatedAt: string
}

export interface CreateTestimonialDto {
    name: string
    role?: string
    company?: string
    content: string
    avatar?: string
    rating?: number
    featured?: boolean
    order?: number
}

export interface UpdateTestimonialDto extends Partial<CreateTestimonialDto> { }

export interface TestimonialListResponse {
    data: Testimonial[]
    pagination: PaginationMeta
}

export async function getTestimonials(params?: {
    page?: number
    limit?: number
}): Promise<TestimonialListResponse> {
    const query = new URLSearchParams()
    if (params?.page) query.set('page', String(params.page))
    if (params?.limit) query.set('limit', String(params.limit))
    const qs = query.toString()
    const url = `/portfolio/testimonials${qs ? `?${qs}` : ''}`
    return getPaginatedData<Testimonial>(url)
}

export async function getTestimonial(id: string): Promise<Testimonial> {
    return getData<Testimonial>(`/portfolio/testimonials/${id}`)
}

export async function createTestimonial(data: CreateTestimonialDto): Promise<Testimonial> {
    return postData<Testimonial>('/portfolio/testimonials', data)
}

export async function updateTestimonial(id: string, data: UpdateTestimonialDto): Promise<Testimonial> {
    return patchData<Testimonial>(`/portfolio/testimonials/${id}`, data)
}

export async function deleteTestimonial(id: string): Promise<void> {
    return del<void>(`/portfolio/testimonials/${id}`)
}

export async function reorderTestimonials(testimonialIds: string[]): Promise<void> {
    return patch<void>('/portfolio/testimonials/reorder', { testimonialIds })
}

export async function bulkDeleteTestimonials(ids: string[]): Promise<BulkDeleteResponse> {
    return postData<BulkDeleteResponse>('/portfolio/testimonials/bulk-delete', { ids })
}

