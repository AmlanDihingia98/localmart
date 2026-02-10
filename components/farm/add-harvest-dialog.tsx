"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Sprout } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

import { addHarvest } from "@/lib/actions"
import { harvestSchema, type HarvestFormValues } from "@/lib/schemas"

// ... imports

interface AddHarvestDialogProps {
    farmId?: string
    farms?: { id: string; name: string }[]
}

export function AddHarvestDialog({ farmId, farms }: AddHarvestDialogProps) {
    const [open, setOpen] = useState(false)
    const defaultFarmId = farmId || farms?.[0]?.id || ''

    const form = useForm<HarvestFormValues>({
        resolver: zodResolver(harvestSchema) as any,
        defaultValues: {
            farm_id: defaultFarmId,
            harvest_date: new Date().toISOString().split('T')[0],
            quantity_kg: 0,
            wastage_kg: 0,
            quality_grade: "A",
            // prices optional
        },
    })

    async function onSubmit(data: HarvestFormValues) {
        const result = await addHarvest(data)

        if (result.success) {
            setOpen(false)
            form.reset({
                ...data,
                quantity_kg: 0,
                wastage_kg: 0,
            })
            toast.success("Harvest recorded successfully!")
        } else {
            toast.error(`Error: ${result.message}`)
        }
    }

    const showFarmSelect = !farmId && farms && farms.length > 0

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Sprout className="mr-2 h-4 w-4" /> Record Harvest
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Record Harvest Data</DialogTitle>
                    <DialogDescription>
                        Log yield details for this farm.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                        {showFarmSelect && (
                            <FormField
                                control={form.control}
                                name="farm_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Farm</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select farm" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {farms?.map(f => (
                                                    <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <FormField
                            control={form.control}
                            name="harvest_date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Date</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* ... rest of existing fields ... */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="quantity_kg"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Quantity (kg)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="0.0"
                                                {...field}
                                                onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                                                value={field.value ?? ''}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="wastage_kg"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Wastage (kg)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="0.0"
                                                {...field}
                                                onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                                                value={field.value ?? ''}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="quality_grade"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Quality Grade</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select grade" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="A">Grade A (Premium)</SelectItem>
                                            <SelectItem value="B">Grade B (Standard)</SelectItem>
                                            <SelectItem value="C">Grade C (Low)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="market_price_per_kg"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mandi Rate (₹/kg)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="0.0"
                                                {...field}
                                                onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                                                value={field.value ?? ''}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="sale_price_per_kg"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Sold Rate (₹/kg)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="0.0"
                                                {...field}
                                                onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                                                value={field.value ?? ''}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Buyer details, crop condition..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full">Save Harvest Record</Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
