import { patch, del, getPaginatedData, getData, postData, patchData } from '@/lib/api-client'
import { PaginationMeta } from '@/lib/types/api-response'
import type { BulkDeleteResponse } from './types'

export interface Contact {
    id: string
    platform: string
    url: string
    icon?: string
    order: number
    active: boolean
    createdAt: string
    updatedAt: string
}

export interface CreateContactDto {
    platform: string
    url: string
    icon?: string
    order?: number
    active?: boolean
}

export interface UpdateContactDto extends Partial<CreateContactDto> { }

export interface ContactListResponse {
    data: Contact[]
    pagination: PaginationMeta
}

export async function getContacts(params?: {
    page?: number
    limit?: number
    activeOnly?: boolean
}): Promise<ContactListResponse> {
    const query = new URLSearchParams()
    if (params?.page) query.set('page', String(params.page))
    if (params?.limit) query.set('limit', String(params.limit))
    if (params?.activeOnly) query.set('activeOnly', 'true')
    const qs = query.toString()
    const url = `/portfolio/contacts${qs ? `?${qs}` : ''}`
    return getPaginatedData<Contact>(url)
}

export async function getContact(id: string): Promise<Contact> {
    return getData<Contact>(`/portfolio/contacts/${id}`)
}

export async function createContact(data: CreateContactDto): Promise<Contact> {
    return postData<Contact>('/portfolio/contacts', data)
}

export async function updateContact(id: string, data: UpdateContactDto): Promise<Contact> {
    return patchData<Contact>(`/portfolio/contacts/${id}`, data)
}

export async function deleteContact(id: string): Promise<void> {
    return del<void>(`/portfolio/contacts/${id}`)
}

export async function reorderContacts(contactIds: string[]): Promise<void> {
    return patch<void>('/portfolio/contacts/reorder', { contactIds })
}

export async function bulkDeleteContacts(ids: string[]): Promise<BulkDeleteResponse> {
    return postData<BulkDeleteResponse>('/portfolio/contacts/bulk-delete', { ids })
}

