import { Badge } from "@/components/ui/badge"
import { CheckCircle2, AlertTriangle, XCircle, Clock, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export type StatusType = 'healthy' | 'warning' | 'error' | 'loading' | 'unknown'

interface StatusIndicatorProps {
    status: StatusType
    text?: string
    showIcon?: boolean
    size?: 'sm' | 'md' | 'lg'
    variant?: 'badge' | 'dot' | 'inline'
    className?: string
}

export function StatusIndicator({
    status,
    text,
    showIcon = true,
    size = 'md',
    variant = 'badge',
    className
}: StatusIndicatorProps) {
    const getStatusConfig = (status: StatusType) => {
        switch (status) {
            case 'healthy':
                return {
                    icon: CheckCircle2,
                    color: 'text-green-600',
                    bgColor: 'bg-green-50 border-green-200',
                    badgeColor: 'bg-green-500 hover:bg-green-600 text-white',
                    label: text || 'Healthy'
                }
            case 'warning':
                return {
                    icon: AlertTriangle,
                    color: 'text-yellow-600',
                    bgColor: 'bg-yellow-50 border-yellow-200',
                    badgeColor: 'bg-yellow-500 hover:bg-yellow-600 text-white',
                    label: text || 'Warning'
                }
            case 'error':
                return {
                    icon: XCircle,
                    color: 'text-red-600',
                    bgColor: 'bg-red-50 border-red-200',
                    badgeColor: 'bg-red-500 hover:bg-red-600 text-white',
                    label: text || 'Error'
                }
            case 'loading':
                return {
                    icon: Loader2,
                    color: 'text-blue-600',
                    bgColor: 'bg-blue-50 border-blue-200',
                    badgeColor: 'bg-blue-500 hover:bg-blue-600 text-white',
                    label: text || 'Loading'
                }
            case 'unknown':
            default:
                return {
                    icon: Clock,
                    color: 'text-gray-600',
                    bgColor: 'bg-gray-50 border-gray-200',
                    badgeColor: 'bg-gray-500 hover:bg-gray-600 text-white',
                    label: text || 'Unknown'
                }
        }
    }

    const config = getStatusConfig(status)
    const Icon = config.icon

    const iconSizes = {
        sm: 'h-3 w-3',
        md: 'h-4 w-4',
        lg: 'h-5 w-5'
    }

    const textSizes = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base'
    }

    if (variant === 'dot') {
        return (
            <div className={cn("flex items-center gap-1", className)}>
                <div className={cn(
                    "rounded-full",
                    size === 'sm' && "w-2 h-2",
                    size === 'md' && "w-3 h-3",
                    size === 'lg' && "w-4 h-4",
                    status === 'healthy' && "bg-green-500",
                    status === 'warning' && "bg-yellow-500",
                    status === 'error' && "bg-red-500",
                    status === 'loading' && "bg-blue-500",
                    status === 'unknown' && "bg-gray-500"
                )} />
                {text && (
                    <span className={cn(textSizes[size], "text-muted-foreground")}>
                        {text}
                    </span>
                )}
            </div>
        )
    }

    if (variant === 'inline') {
        return (
            <div className={cn("flex items-center gap-1", className)}>
                {showIcon && (
                    <Icon className={cn(iconSizes[size], config.color)} />
                )}
                {config.label && (
                    <span className={cn(textSizes[size], config.color)}>
                        {config.label}
                    </span>
                )}
            </div>
        )
    }

    // Default badge variant
    return (
        <Badge
            variant="secondary"
            className={cn(config.badgeColor, className)}
        >
            {showIcon && (
                <Icon className={cn(iconSizes.sm, "mr-1")} />
            )}
            {config.label}
        </Badge>
    )
}
