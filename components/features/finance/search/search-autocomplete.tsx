"use client"

import * as React from "react"
import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { getSearchSuggestions, type SearchSuggestion } from "@/lib/api/finance/finance-search"
import { getRecentSearches, addRecentSearch, removeRecentSearch, type RecentSearch } from "@/lib/utils/recent-searches"
import { Search, Clock, X, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface SearchAutocompleteProps {
    value: string
    onChange: (value: string) => void
    onSearch: (query: string) => void
    placeholder?: string
    className?: string
}

export function SearchAutocomplete({
    value,
    onChange,
    onSearch,
    placeholder = "Search transactions...",
    className,
}: SearchAutocompleteProps) {
    const [open, setOpen] = useState(false)
    const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
    const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [showRecent, setShowRecent] = useState(true)
    const inputRef = useRef<HTMLInputElement>(null)
    const debounceTimerRef = useRef<NodeJS.Timeout | undefined>(undefined)

    useEffect(() => {
        setRecentSearches(getRecentSearches())
    }, [])

    useEffect(() => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current)
        }

        if (value.trim() && value.length >= 2) {
            debounceTimerRef.current = setTimeout(() => {
                void loadSuggestions(value)
            }, 300)
        } else {
            setSuggestions([])
            setShowRecent(true)
        }

        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current)
            }
        }
    }, [value])

    const loadSuggestions = async (query: string) => {
        setIsLoading(true)
        try {
            const data = await getSearchSuggestions(query, 8)
            setSuggestions(data)
            setShowRecent(false)
        } catch (error: any) {
            // Silently fail - suggestions are optional
            console.error("Failed to load suggestions:", error)
            setSuggestions([])
        } finally {
            setIsLoading(false)
        }
    }

    const handleSelect = (text: string) => {
        onChange(text)
        onSearch(text)
        addRecentSearch(text)
        setRecentSearches(getRecentSearches())
        setOpen(false)
    }

    const handleRemoveRecent = (query: string, e: React.MouseEvent) => {
        e.stopPropagation()
        removeRecentSearch(query)
        setRecentSearches(getRecentSearches())
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault()
            if (value.trim()) {
                onSearch(value.trim())
                addRecentSearch(value.trim())
                setRecentSearches(getRecentSearches())
                setOpen(false)
            }
        } else if (e.key === "Escape") {
            setOpen(false)
        }
    }

    const hasResults = (showRecent && recentSearches.length > 0) || suggestions.length > 0 || isLoading

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <div className={cn("relative", className)}>
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        ref={inputRef}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setOpen(true)}
                        placeholder={placeholder}
                        className="pl-10 pr-10"
                    />
                    {value && (
                        <button
                            type="button"
                            onClick={() => {
                                onChange("")
                                setOpen(false)
                            }}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </PopoverTrigger>
            {hasResults && (
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                    <Command>
                        <CommandList>
                            {isLoading ? (
                                <CommandEmpty>Loading suggestions...</CommandEmpty>
                            ) : showRecent && recentSearches.length > 0 ? (
                                <CommandGroup heading="Recent Searches">
                                    {recentSearches.map((search, index) => (
                                        <CommandItem
                                            key={index}
                                            value={search.query}
                                            onSelect={() => handleSelect(search.query)}
                                            className="flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-2 flex-1">
                                                <Clock className="h-3 w-3 text-muted-foreground" />
                                                <span className="flex-1 truncate">{search.query}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={(e) => handleRemoveRecent(search.query, e)}
                                                className="opacity-0 group-hover:opacity-100 hover:text-destructive"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            ) : suggestions.length > 0 ? (
                                <CommandGroup heading="Suggestions">
                                    {suggestions.map((suggestion, index) => (
                                        <CommandItem
                                            key={index}
                                            value={suggestion.text}
                                            onSelect={() => handleSelect(suggestion.text)}
                                        >
                                            <div className="flex items-center gap-2 flex-1">
                                                <TrendingUp className="h-3 w-3 text-muted-foreground" />
                                                <span className="flex-1 truncate">{suggestion.text}</span>
                                                <Badge variant="secondary" className="text-xs">
                                                    {suggestion.count}
                                                </Badge>
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            ) : (
                                <CommandEmpty>No suggestions found</CommandEmpty>
                            )}
                        </CommandList>
                    </Command>
                </PopoverContent>
            )}
        </Popover>
    )
}

