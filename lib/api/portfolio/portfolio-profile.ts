import { getData, postData, patchData, apiClient } from '@/lib/api-client'

export interface PortfolioProfile {
    id: string
    userId: string
    bio?: string
    avatar?: string
    resumeUrl?: string
    location?: string
    availableForHire: boolean
    portfolioUrl?: string
    theme: string
    createdAt: string
    updatedAt: string
}

export interface UpdatePortfolioProfileDto {
    bio?: string
    avatar?: string
    resumeUrl?: string
    location?: string
    availableForHire?: boolean
    portfolioUrl?: string
    theme?: string
}

export async function getPortfolioProfile(): Promise<PortfolioProfile> {
    return getData<PortfolioProfile>('/portfolio/profile')
}

export async function updatePortfolioProfile(data: UpdatePortfolioProfileDto): Promise<PortfolioProfile> {
    return patchData<PortfolioProfile>('/portfolio/profile', data)
}

/**
 * Upload avatar - supports both file upload and URL
 * @param avatar - Either a File object or a URL string
 */
export async function uploadAvatar(avatar: File | string): Promise<PortfolioProfile> {
    if (avatar instanceof File) {
        // File upload
        const formData = new FormData()
        formData.append('file', avatar)

        return apiClient<PortfolioProfile>('/portfolio/profile/avatar', {
            method: 'POST',
            body: formData,
            extractData: true,
        })
    } else {
        // URL string
        return postData<PortfolioProfile>('/portfolio/profile/avatar', { avatar })
    }
}

export async function uploadResume(resumeUrl: string): Promise<PortfolioProfile> {
    return postData<PortfolioProfile>('/portfolio/profile/resume', { resumeUrl })
}

