import { getData, postData, patchData } from '@/lib/api-client'

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

export async function uploadAvatar(avatar: string): Promise<PortfolioProfile> {
    return postData<PortfolioProfile>('/portfolio/profile/avatar', { avatar })
}

export async function uploadResume(resumeUrl: string): Promise<PortfolioProfile> {
    return postData<PortfolioProfile>('/portfolio/profile/resume', { resumeUrl })
}

