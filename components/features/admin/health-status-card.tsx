import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Server,
    Database,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    Clock,
    Zap
} from "lucide-react"

interface HealthStatusCardProps {
    title: string
    description?: string
    status: 'healthy' | 'warning' | 'error' | null
    message?: string
    timestamp?: string
    icon?: React.ComponentType<{ className?: string }>
    isLoading?: boolean
    additionalInfo?: Array<{
        label: string
        value: string | number
        icon?: React.ComponentType<{ className?: string }>
    }>
}

export function HealthStatusCard({
    title,
    description,
    status,
    message,
    timestamp,
    icon: Icon = Server,
    isLoading = false,
    additionalInfo = []
}: HealthStatusCardProps) {
    const getStatusIcon = (status: 'healthy' | 'warning' | 'error') => {
        switch (status) {
            case 'healthy':
                return <CheckCircle2 className="h-4 w-4 text-green-500" />
            case 'warning':
                return <AlertTriangle className="h-4 w-4 text-yellow-500" />
            case 'error':
                return <XCircle className="h-4 w-4 text-red-500" />
        }
    }

    const getStatusBadge = (status: 'healthy' | 'warning' | 'error') => {
        const variants = {
            healthy: 'default',
            warning: 'secondary',
            error: 'destructive'
        } as const

        const colors = {
            healthy: 'bg-green-500 hover:bg-green-600 text-white',
            warning: 'bg-yellow-500 hover:bg-yellow-600 text-white',
            error: 'bg-red-500 hover:bg-red-600 text-white'
        }

        return (
            <Badge variant={variants[status]} className={colors[status]}>
                {getStatusIcon(status)}
                <span className="ml-1 capitalize">{status}</span>
            </Badge>
        )
    }

    const getStatusText = (status: 'healthy' | 'warning' | 'error') => {
        switch (status) {
            case 'healthy':
                return "Online"
            case 'warning':
                return "Warning"
            case 'error':
                return "Error"
            default:
                return "Unknown"
        }
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center space-x-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <div>
                        <CardTitle className="text-sm font-medium">
                            {title}
                        </CardTitle>
                        {description && (
                            <CardDescription className="text-xs">
                                {description}
                            </CardDescription>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-24" />
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-2xl font-bold">
                                {status ? getStatusText(status) : "Loading..."}
                            </div>
                            {status ? getStatusBadge(status) : <Skeleton className="h-5 w-20" />}
                        </div>

                        {message && (
                            <p className="text-xs text-muted-foreground mb-2">
                                {message}
                            </p>
                        )}

                        {additionalInfo.length > 0 && (
                            <div className="space-y-1 mt-3 pt-2 border-t">
                                {additionalInfo.map((info, index) => {
                                    const InfoIcon = info.icon
                                    return (
                                        <div key={index} className="flex items-center justify-between text-xs">
                                            <span className="text-muted-foreground flex items-center">
                                                {InfoIcon && <InfoIcon className="h-3 w-3 mr-1" />}
                                                {info.label}:
                                            </span>
                                            <span className="font-medium">{info.value}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        {timestamp && (
                            <div className="flex items-center text-xs text-muted-foreground mt-2">
                                <Clock className="h-3 w-3 mr-1" />
                                {new Date(timestamp).toLocaleString()}
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    )
}
