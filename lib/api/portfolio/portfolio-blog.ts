import { del, getPaginatedData, getData, postData, patchData } from '@/lib/api-client'
import { PaginationMeta } from '@/lib/types/api-response'

export interface Blog {
    id: string
    title: string
    slug: string
    content: string
    excerpt?: string
    coverImage?: string
    published: boolean
    publishedAt?: string
    tags: string[]
    createdAt: string
    updatedAt: string
}

export interface CreateBlogDto {
    title: string
    slug?: string
    content: string
    excerpt?: string
    coverImage?: string
    published?: boolean
    tags?: string[]
}

export interface UpdateBlogDto extends Partial<CreateBlogDto> { }

export interface BlogListResponse {
    data: Blog[]
    pagination: PaginationMeta
}

export async function getBlogs(params?: {
    page?: number
    limit?: number
    published?: boolean
}): Promise<BlogListResponse> {
    const query = new URLSearchParams()
    if (params?.page) query.set('page', String(params.page))
    if (params?.limit) query.set('limit', String(params.limit))
    if (typeof params?.published === 'boolean') query.set('published', String(params.published))

    const qs = query.toString()
    const url = `/portfolio/blog${qs ? `?${qs}` : ''}`
    return getPaginatedData<Blog>(url)
}

export async function getBlog(id: string): Promise<Blog> {
    return getData<Blog>(`/portfolio/blog/${id}`)
}

export async function createBlog(data: CreateBlogDto): Promise<Blog> {
    return postData<Blog>('/portfolio/blog', data)
}

export async function updateBlog(id: string, data: UpdateBlogDto): Promise<Blog> {
    return patchData<Blog>(`/portfolio/blog/${id}`, data)
}

export async function deleteBlog(id: string): Promise<void> {
    return del<void>(`/portfolio/blog/${id}`)
}

