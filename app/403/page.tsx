import { AlertTriangle, Home, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function ForbiddenPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">
                        Access Forbidden
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                        You don't have permission to access this resource.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-sm text-gray-500 text-center">
                        This area is restricted to administrators only.
                        If you believe this is an error, please contact your system administrator.
                    </div>

                    <div className="flex flex-col gap-2">
                        <Button asChild className="w-full">
                            <Link href="/dashboard">
                                <Home className="mr-2 h-4 w-4" />
                                Go to Dashboard
                            </Link>
                        </Button>

                        <Button variant="outline" asChild className="w-full">
                            <Link href="/login">
                                <LogOut className="mr-2 h-4 w-4" />
                                Sign In
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
