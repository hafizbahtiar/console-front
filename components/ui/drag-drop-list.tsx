"use client"

import * as React from "react"
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core"
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
    horizontalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

export interface DragDropListProps<T> {
    /** Array of items to display */
    items: T[]
    /** Function to get unique key from item */
    getItemKey: (item: T, index: number) => string | number
    /** Render function for each item */
    renderItem: (item: T, index: number) => React.ReactNode
    /** Callback when items are reordered */
    onReorder: (items: T[]) => void | Promise<void>
    /** Layout direction */
    direction?: "vertical" | "horizontal"
    /** Additional className */
    className?: string
    /** Disabled state */
    disabled?: boolean
    /** Show drag handle */
    showHandle?: boolean
    /** Custom handle component */
    renderHandle?: (item: T, index: number) => React.ReactNode
}

interface SortableItemProps<T> {
    item: T
    index: number
    getItemKey: (item: T, index: number) => string | number
    renderItem: (item: T, index: number) => React.ReactNode
    disabled?: boolean
    showHandle?: boolean
    renderHandle?: (item: T, index: number) => React.ReactNode
}

function SortableItem<T>({
    item,
    index,
    getItemKey,
    renderItem,
    disabled = false,
    showHandle = true,
    renderHandle,
}: SortableItemProps<T>) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: getItemKey(item, index),
        disabled,
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    const defaultHandle = (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            className="cursor-grab active:cursor-grabbing"
            {...attributes}
            {...listeners}
        >
            <GripVertical className="w-4 h-4 text-muted-foreground" />
        </Button>
    )

    const handle = renderHandle
        ? renderHandle(item, index)
        : showHandle
        ? defaultHandle
        : null

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "flex items-center gap-2",
                isDragging && "z-50"
            )}
        >
            {handle}
            <div className="flex-1">{renderItem(item, index)}</div>
        </div>
    )
}

export function DragDropList<T>({
    items,
    getItemKey,
    renderItem,
    onReorder,
    direction = "vertical",
    className,
    disabled = false,
    showHandle = true,
    renderHandle,
}: DragDropListProps<T>) {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event

        if (over && active.id !== over.id) {
            const oldIndex = items.findIndex(
                (item, index) => getItemKey(item, index) === active.id
            )
            const newIndex = items.findIndex(
                (item, index) => getItemKey(item, index) === over.id
            )

            if (oldIndex !== -1 && newIndex !== -1) {
                const newItems = arrayMove(items, oldIndex, newIndex)
                await onReorder(newItems)
            }
        }
    }

    const strategy =
        direction === "horizontal"
            ? horizontalListSortingStrategy
            : verticalListSortingStrategy

    const itemIds = items.map((item, index) => getItemKey(item, index))

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext items={itemIds} strategy={strategy}>
                <div
                    className={cn(
                        "space-y-2",
                        direction === "horizontal" && "flex flex-row space-x-2 space-y-0",
                        className
                    )}
                >
                    {items.map((item, index) => (
                        <SortableItem
                            key={getItemKey(item, index)}
                            item={item}
                            index={index}
                            getItemKey={getItemKey}
                            renderItem={renderItem}
                            disabled={disabled}
                            showHandle={showHandle}
                            renderHandle={renderHandle}
                        />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    )
}

