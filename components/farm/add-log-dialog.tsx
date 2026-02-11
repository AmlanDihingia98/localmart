"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus } from "lucide-react"

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

import { addOperationalLog } from "@/lib/actions"
import { logSchema, type LogFormValues } from "@/lib/schemas"
import { toast } from "sonner"

// ... imports

interface AddLogDialogProps {
    farmId?: string
    farms?: { id: string; name: string }[]
}

export function AddLogDialog({ farmId, farms }: AddLogDialogProps) {
    const [open, setOpen] = useState(false)
    // Default to provided farmId or first available farm
    const defaultFarmId = farmId || farms?.[0]?.id || ''

    const form = useForm<LogFormValues>({
        resolver: zodResolver(logSchema) as any,
        defaultValues: {
            farm_id: defaultFarmId, // Use the calculated default
            log_type: "feed_input",
            quantity: 0,
            unit: "kg",
            notes: "",
            log_date: new Date().toISOString().split('T')[0],
        },
    })

    const logType = form.watch("log_type")
    const avgWeight = form.watch("average_weight")
    const totalCount = form.watch("total_count")

    useEffect(() => {
        if ((logType === 'biomass_check' || logType === 'growth_check')) {
            if (avgWeight && totalCount) {
                const totalBiomass = avgWeight * totalCount
                form.setValue('quantity', totalBiomass)
            }
        }
    }, [logType, avgWeight, totalCount, form])

    // Reset form when dialog opens or defaults change
    // Effect/Key logic omitted for brevity, relying on key={open} or similar if needed, 
    // but react-hook-form defaultValues are cached. 
    // For MVP, if we open/close, we might want to reset.
    // However, simplest is to let the user pick.

    async function onSubmit(data: LogFormValues) {
        const result = await addOperationalLog(data)

        if (result.success) {
            setOpen(false)
            form.reset({
                ...data,
                quantity: 0, // Reset quantity
                notes: "",
                average_weight: undefined,
                total_count: undefined
            })
            toast.success("Log added successfully!")
        } else {
            toast.error(`Error: ${result.message}`)
        }
    }

    const showFarmSelect = !farmId && farms && farms.length > 0
    const isBiomassLog = logType === 'biomass_check' || logType === 'growth_check'

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Add Log
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Operational Log</DialogTitle>
                    <DialogDescription>
                        Record daily farming activities here.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit, (errors) => console.log("Validation Errors:", errors))} className="space-y-4">

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
                            name="log_date"
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
                        {/* ... rest of the form ... */}
                        <FormField
                            control={form.control}
                            name="log_type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select log type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="feed_input">Feed Input</SelectItem>
                                            <SelectItem value="mortality">Mortality</SelectItem>
                                            <SelectItem value="labor_hours">Labor Hours</SelectItem>
                                            <SelectItem value="electricity_usage">Electricity Usage</SelectItem>
                                            <SelectItem value="fertilizer_application">Fertilizer Application</SelectItem>
                                            <SelectItem value="pest_incidence">Pest Incidence</SelectItem>
                                            <SelectItem value="water_usage">Water Usage</SelectItem>
                                            <SelectItem value="biomass_check">Biomass Check</SelectItem>
                                            <SelectItem value="growth_check">Growth Check</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {isBiomassLog && (
                            <div className="grid grid-cols-2 gap-4 border p-3 rounded-md bg-muted/20">
                                <FormField
                                    control={form.control}
                                    name="average_weight"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Avg Weight (kg/unit)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g. 0.5"
                                                    step="0.001"
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
                                    name="total_count"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Est. Count (units)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g. 1000"
                                                    step="1"
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
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="quantity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Total Biomass / Quantity</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="0"
                                                readOnly={isBiomassLog}
                                                className={isBiomassLog ? "bg-muted" : ""}
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
                                name="unit"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Unit</FormLabel>
                                        <FormControl>
                                            <Input placeholder="kg, hrs..." {...field} />
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
                                        <Textarea placeholder="Optional details..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full">Save Log</Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
