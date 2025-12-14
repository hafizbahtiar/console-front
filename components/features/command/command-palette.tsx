"use client"

import { useEffect, useMemo, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
    Home,
    Settings,
    CreditCard,
    Receipt,
    BarChart3,
    Layers,
    Table,
    Upload,
    Search,
    KeyRound,
    ShieldCheck,
    Sparkles,
    Filter,
} from "lucide-react"

type CommandAction = {
    label: string
    href?: string
    keywords?: string[]
    group: string
    icon?: React.ComponentType<{ className?: string }>
    hint?: string
}

const COMMANDS: CommandAction[] = [
    // Navigation
    { label: "Dashboard", href: "/dashboard", group: "Navigation", icon: Home },
    { label: "Settings → Preferences", href: "/settings/preferences", group: "Navigation", icon: Settings },
    { label: "Settings → Profile", href: "/settings/profile", group: "Navigation", icon: KeyRound },
    // Finance
    { label: "Finance Overview", href: "/finance", group: "Finance", icon: CreditCard },
    { label: "Transactions", href: "/finance/transactions", group: "Finance", icon: Table },
    { label: "Import Transactions", href: "/finance/import", group: "Finance", icon: Upload },
    { label: "Analytics", href: "/finance/analytics", group: "Finance", icon: BarChart3 },
    { label: "Receipt OCR / Uploads", href: "/finance/transactions?view=table&filter=receipts", group: "Finance", icon: Receipt },
    { label: "Merchant Mappings", href: "/finance/categories/merchant-mappings", group: "Finance", icon: Layers },
    // Owner / Admin
    { label: "Admin (Owner)", href: "/admin", group: "Owner", icon: ShieldCheck },
    // Global actions (placeholder navigation helpers)
    { label: "Search (Transactions)", href: "/finance/transactions?focus=search", group: "Quick Actions", icon: Search, hint: "Focus search bar" },
    { label: "New Transaction", href: "/finance/transactions/new", group: "Quick Actions", icon: Sparkles, hint: "Open create form" },
]

function getContextCommands(pathname: string): CommandAction[] {
    if (pathname.startsWith("/finance")) {
        return [
            { label: "Finance: Focus search/filter", href: "/finance/transactions?focus=search", group: "Context", icon: Search, hint: "Focus search bar" },
            { label: "Finance: Open filters", href: "/finance/transactions?focus=filters", group: "Context", icon: Filter, hint: "Open filters panel" },
            { label: "Finance: New transaction", href: "/finance/transactions/new", group: "Context", icon: Sparkles, hint: "Create transaction" },
        ]
    }
    if (pathname.startsWith("/settings")) {
        return [
            { label: "Settings: Preferences", href: "/settings/preferences", group: "Context", icon: Settings, hint: "Open preferences" },
            { label: "Settings: Profile", href: "/settings/profile", group: "Context", icon: KeyRound, hint: "Open profile" },
        ]
    }
    return []
}

export function CommandPalette() {
    const router = useRouter()
    const pathname = usePathname()
    const [open, setOpen] = useState(false)

    useEffect(() => {
        const handler = (event: KeyboardEvent) => {
            const isMacLike = navigator.platform.toUpperCase().includes("MAC")
            const meta = isMacLike ? event.metaKey : event.ctrlKey
            if (meta && event.key.toLowerCase() === "k") {
                event.preventDefault()
                setOpen((prev) => !prev)
            }
            if (event.key === "Escape") {
                setOpen(false)
            }
        }
        window.addEventListener("keydown", handler)
        return () => window.removeEventListener("keydown", handler)
    }, [])

    const contextCommands = useMemo(() => getContextCommands(pathname), [pathname])

    const grouped = useMemo(() => {
        const all = [...COMMANDS, ...contextCommands]
        return all.reduce<Record<string, CommandAction[]>>((acc, item) => {
            const key = item.group || "Commands"
            acc[key] = acc[key] || []
            acc[key].push(item)
            return acc
        }, {})
    }, [])

    const handleSelect = (item: CommandAction) => {
        if (item.href) {
            // Avoid unnecessary navigation if already on the same path
            const target = new URL(item.href, "https://placeholder").pathname
            if (target !== pathname) {
                router.push(item.href)
            }
        }
        setOpen(false)
    }

    return (
        <CommandDialog open={open} onOpenChange={setOpen} title="Command Palette" description="Search actions and navigation">
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                {Object.entries(grouped).map(([group, items]) => (
                    <CommandGroup key={group} heading={group}>
                        {items.map((item) => {
                            const Icon = item.icon
                            return (
                                <CommandItem
                                    key={item.label}
                                    value={`${item.label} ${item.keywords?.join(" ") ?? ""}`}
                                    onSelect={() => handleSelect(item)}
                                >
                                    {Icon ? <Icon className="mr-2 h-4 w-4 text-muted-foreground" /> : null}
                                    <div className="flex flex-1 flex-col">
                                        <span>{item.label}</span>
                                        {item.href ? (
                                            <span className="text-xs text-muted-foreground">{item.href}</span>
                                        ) : null}
                                    </div>
                                    {item.hint ? (
                                        <Badge variant="outline" className="ml-2 text-[11px] leading-tight">
                                            {item.hint}
                                        </Badge>
                                    ) : null}
                                </CommandItem>
                            )
                        })}
                    </CommandGroup>
                ))}
            </CommandList>
            <div className="flex items-center justify-between px-3 py-2 text-xs text-muted-foreground border-t">
                <div className="flex items-center gap-2">
                    <span className="rounded border px-1 py-0.5">⌘/Ctrl</span>
                    <span className="rounded border px-1 py-0.5">K</span>
                    <span>Open command palette</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="rounded border px-1 py-0.5">Esc</span>
                    <span>Close</span>
                </div>
            </div>
        </CommandDialog>
    )
}

