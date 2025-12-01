"use client"

import { Project } from "@/lib/api/portfolio"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Github, Star, CalendarDays } from "lucide-react"
import { format } from "date-fns"

interface ProjectCardProps {
    project: Project
    onEdit?: (project: Project) => void
    onDelete?: (project: Project) => void
}

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
    const hasDates = project.startDate || project.endDate

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                <div className="space-y-1">
                    <CardTitle className="text-base font-semibold leading-tight">
                        {project.title}
                    </CardTitle>
                    {project.technologies?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                            {project.technologies.slice(0, 4).map((tech) => (
                                <Badge
                                    key={tech}
                                    variant="outline"
                                    className="text-[10px] px-1.5 py-0"
                                >
                                    {tech}
                                </Badge>
                            ))}
                            {project.technologies.length > 4 && (
                                <span className="text-[10px] text-muted-foreground">
                                    +{project.technologies.length - 4} more
                                </span>
                            )}
                        </div>
                    )}
                </div>
                <div className="flex flex-col items-end gap-1">
                    {project.featured && (
                        <Badge className="text-[10px] px-1.5 py-0" variant="default">
                            <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                            Featured
                        </Badge>
                    )}
                    {hasDates && (
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <CalendarDays className="w-3 h-3" />
                            <span>
                                {project.startDate
                                    ? format(new Date(project.startDate), "MMM yyyy")
                                    : "N/A"}{" "}
                                -{" "}
                                {project.endDate
                                    ? format(new Date(project.endDate), "MMM yyyy")
                                    : "Present"}
                            </span>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-3">
                {project.description && (
                    <p className="text-xs text-muted-foreground line-clamp-3">
                        {project.description}
                    </p>
                )}

                {project.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {project.tags.slice(0, 3).map((tag) => (
                            <Badge
                                key={tag}
                                variant="secondary"
                                className="text-[10px] px-1.5 py-0"
                            >
                                {tag}
                            </Badge>
                        ))}
                        {project.tags.length > 3 && (
                            <span className="text-[10px] text-muted-foreground">
                                +{project.tags.length - 3} more
                            </span>
                        )}
                    </div>
                )}

                <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                    <div className="flex items-center gap-2">
                        {project.url && (
                            <a
                                href={project.url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline"
                            >
                                <ExternalLink className="w-3 h-3" />
                                Live
                            </a>
                        )}
                        {project.githubUrl && (
                            <a
                                href={project.githubUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"
                            >
                                <Github className="w-3 h-3" />
                                Code
                            </a>
                        )}
                    </div>
                    <div className="flex items-center gap-1.5">
                        {onEdit && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => onEdit(project)}
                            >
                                Edit
                            </Button>
                        )}
                        {onDelete && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="text-destructive border-destructive/40 hover:bg-destructive/10"
                                onClick={() => onDelete(project)}
                            >
                                Delete
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}


