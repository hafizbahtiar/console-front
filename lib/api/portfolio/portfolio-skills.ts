import { get, patch, del, getData, postData, patchData } from '@/lib/api-client'

export interface Skill {
    id: string
    name: string
    category: string
    level?: number // 0-100 percentage
    icon?: string
    color?: string
    order: number
    createdAt: string
    updatedAt: string
}

export interface CreateSkillDto {
    name: string
    category: string
    level?: number
    icon?: string
    color?: string
    order?: number
}

export interface UpdateSkillDto extends Partial<CreateSkillDto> { }

export interface GroupedSkills {
    [category: string]: Skill[]
}

export async function getSkills(grouped?: boolean): Promise<Skill[] | GroupedSkills> {
    const query = grouped ? '?grouped=true' : ''
    const response = await get<Skill[] | GroupedSkills>(`/portfolio/skills${query}`)
    // Skills endpoint may return grouped or flat array
    return response
}

export async function getSkill(id: string): Promise<Skill> {
    return getData<Skill>(`/portfolio/skills/${id}`)
}

export async function createSkill(data: CreateSkillDto): Promise<Skill> {
    return postData<Skill>('/portfolio/skills', data)
}

export async function updateSkill(id: string, data: UpdateSkillDto): Promise<Skill> {
    return patchData<Skill>(`/portfolio/skills/${id}`, data)
}

export async function deleteSkill(id: string): Promise<void> {
    return del<void>(`/portfolio/skills/${id}`)
}

export async function reorderSkills(skillIds: string[]): Promise<void> {
    return patch<void>('/portfolio/skills/reorder', { skillIds })
}

