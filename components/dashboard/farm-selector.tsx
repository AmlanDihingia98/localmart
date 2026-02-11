"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface Farm {
    id: string
    name: string
}

interface FarmSelectorProps {
    farms: Farm[]
}

export function FarmSelector({ farms }: FarmSelectorProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [open, setOpen] = React.useState(false)

    // Get current farm from URL
    const currentFarmId = searchParams.get("farmId")

    const onSelect = (farmId: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (farmId === "all") {
            params.delete("farmId")
        } else {
            params.set("farmId", farmId)
        }
        router.push(`/dashboard?${params.toString()}`)
        setOpen(false)
    }

    const selectedFarm = farms.find((f) => f.id === currentFarmId)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[200px] justify-between"
                >
                    {currentFarmId
                        ? selectedFarm?.name || "Select farm..."
                        : "All Farms"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandInput placeholder="Search farm..." />
                    <CommandList>
                        <CommandEmpty>No farm found.</CommandEmpty>
                        <CommandGroup>
                            <CommandItem
                                value="all"
                                onSelect={() => onSelect("all")}
                            >
                                <Check
                                    className={cn(
                                        "mr-2 h-4 w-4",
                                        !currentFarmId ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                All Farms
                            </CommandItem>
                            {farms.map((farm) => (
                                <CommandItem
                                    key={farm.id}
                                    value={farm.name} // Command uses value for filtering
                                    onSelect={() => onSelect(farm.id)}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            currentFarmId === farm.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {farm.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
